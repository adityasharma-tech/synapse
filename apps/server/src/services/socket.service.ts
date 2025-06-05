import {
    logger,
    ApiError,
    SocketEventEnum,
    hasPermission,
    Role,
} from "@pkgs/lib";
import { eq } from "drizzle-orm";
import { ChatMessage } from "@pkgs/drizzle-client";
import { Socket, Server } from "socket.io";

// basic data types to support
interface UserT {
    id: number;
    firstName: string;
    lastName: string;
    username: string;
    email: string;
    profilePicture?: string;
    phoneNumber: string;
    role: Role;
    emailVerified: boolean;
}

interface BasicChatT {
    id: number;
    message: string;
    markRead?: boolean;
    upVotes: number;
    downVotes: number;
    user: Partial<UserT>;
    pinned?: boolean;
}

interface JoinStreamHandlerPayloadT {
    streamId: string;
}

interface LeaveStreamHandlerPayloadT {
    streamId: string;
}

interface ChatCreateHandlerPayloadT extends BasicChatT {
    streamId: string;
}

interface ChatUpdatePayloadT {
    id: string;
    streamId: string;
    message: string;
}

interface ChatDeletePayloadT {
    id: string;
    streamId: string;
}

interface GetCurrentViewers {
    streamId: string;
}

interface ChatUpvotePaylaodT extends ChatDeletePayloadT {}
interface ChatDownVotePaylaodT extends ChatDeletePayloadT {}
interface ChatMarkDonePayloadT extends ChatDeletePayloadT {}

interface ChatTypingEventT extends LeaveStreamHandlerPayloadT {}

// event handlers
function joinStreamHandler(socket: Socket, payload: JoinStreamHandlerPayloadT) {
    socket.join(payload.streamId);
}

// when user leaves
function leaveStreamHandler(
    socket: Socket,
    payload: LeaveStreamHandlerPayloadT
) {
    socket.leave(payload.streamId);
}

// when user create a basic chat
async function chatCreateHandler(
    io: Server,
    socket: Socket,
    payload: ChatCreateHandlerPayloadT
) {
    if (!hasPermission(socket.user, "chat:create")) return;
    const [result] = await db
        .insert(ChatMessage)
        .values({
            streamUid: payload.streamId,
            userId: socket.user?.id,
            message: payload.message,
            updatedAt: new Date(),
        })
        .returning()
        .execute();

    if (result) {
        io.to(String(payload.streamId)).emit(
            SocketEventEnum.CHAT_CREATE_EVENT,
            {
                ...payload,
                id: String(result.id),
                streamId: undefined,
                markRead: false,
                upVotes: 0,
                downVotes: 0,
                user: {
                    fullName: `${socket.user?.firstName} ${socket.user?.lastName}`,
                    username: socket.user?.username,
                    profilePicture: socket.user?.profilePicture,
                    role: socket.user?.role ?? "viewer",
                },
                pinned: false,
            }
        );
    }
}

// when user updates it's chat
async function chatUpdateHandler(io: Server, payload: ChatUpdatePayloadT) {
    await db
        .update(ChatMessage)
        .set({ message: payload.message })
        .where(eq(ChatMessage.id, parseInt(payload.id)))
        .execute();

    io.to(payload.streamId).emit(SocketEventEnum.CHAT_UPDATE_EVENT, {
        ...payload,
        streamId: undefined,
    });
}

async function getCurrentViewers(io: Server, payload: GetCurrentViewers) {
    const viewers = (await io.in(payload.streamId).fetchSockets()).length;
    io.to(payload.streamId).emit(SocketEventEnum.GET_STREAM_CONNECTIONS, {
        currentViewers: viewers,
    });
}

// when user delete a chat
async function chatDeleteHandler(
    io: Server,
    socket: Socket,
    payload: ChatDeletePayloadT
) {
    if (!hasPermission(socket.user, "chat:delete")) return;
    await db
        .delete(ChatMessage)
        .where(eq(ChatMessage.id, parseInt(payload.id)))
        .execute();

    io.to(payload.streamId).emit(SocketEventEnum.CHAT_UPDATE_EVENT, {
        ...payload,
        streamId: undefined,
    });
}
function paymentChatCreateHandler() {}

// when a chat is being upvoted
async function chatUpvoteHandler(
    io: Server,
    socket: Socket,
    payload: ChatUpvotePaylaodT
) {
    if (!hasPermission(socket.user, "chat:own-upvote")) return;
    const [result] = await db
        .select({ upVotes: ChatMessage.upVotes })
        .from(ChatMessage)
        .where(eq(ChatMessage.id, parseInt(payload.id))); // problem here

    if (!result) return; // TODO: send socket error messages
    if (result.upVotes.includes(socket.user?.id)) {
        db.update(ChatMessage)
            .set({
                upVotes: result.upVotes.filter(
                    (value) => value != socket.user?.id
                ),
            })
            .where(eq(ChatMessage.id, parseInt(payload.id)))
            .execute()
            .then(() => {
                io.to(payload.streamId).emit(
                    SocketEventEnum.CHAT_UPVOTE_DOWN_EVENT,
                    {
                        ...payload,
                        streamId: undefined,
                    }
                );
            });
    } else {
        db.update(ChatMessage)
            .set({ upVotes: [...result.upVotes, socket.user?.id] })
            .where(eq(ChatMessage.id, parseInt(payload.id)))
            .execute()
            .then(() => {
                io.to(payload.streamId).emit(
                    SocketEventEnum.CHAT_UPVOTE_EVENT,
                    {
                        ...payload,
                        streamId: undefined,
                    }
                );
            });
    }
}

// when a chat is being down voted
async function chatDownVoteHandler(
    io: Server,
    socket: Socket,
    payload: ChatDownVotePaylaodT
) {
    if (!hasPermission(socket.user, "chat:own-downvote")) return;
    const [result] = await db
        .select({ downVotes: ChatMessage.downVotes })
        .from(ChatMessage)
        .where(eq(ChatMessage.id, parseInt(payload.id))) // problem here
        .execute();

    if (!result) return; // send socket error messages
    if (result.downVotes.includes(socket.user?.id)) {
        await db
            .update(ChatMessage)
            .set({
                downVotes: result.downVotes.filter(
                    (value) => value != socket.user?.id
                ),
            })
            .where(eq(ChatMessage.id, parseInt(payload.id)))
            .execute();
        io.to(payload.streamId).emit(SocketEventEnum.CHAT_DOWNVOTE_DOWN_EVENT, {
            ...payload,
            streamId: undefined,
        });
    } else {
        await db
            .update(ChatMessage)
            .set({ downVotes: [...result.downVotes, socket.user?.id] })
            .where(eq(ChatMessage.id, parseInt(payload.id)))
            .execute();

        io.to(payload.streamId).emit(SocketEventEnum.CHAT_DOWNVOTE_EVENT, {
            ...payload,
            streamId: undefined,
        });
    }
}

// send typing event
async function chatTypingEvent(
    io: Server,
    socket: Socket,
    payload: ChatTypingEventT
) {
    io.to(payload.streamId).emit(SocketEventEnum.STREAM_TYPING_EVENT, {
        fullName: `${socket.user?.firstName} ${socket.user?.lastName}`,
        userId: socket.user?.id,
    });
}

// send not typing event
async function stopChatTypingEvent(
    io: Server,
    socket: Socket,
    payload: ChatTypingEventT
) {
    io.to(payload.streamId).emit(SocketEventEnum.STREAM_STOP_TYPING_EVENT, {
        fullName: `${socket.user?.firstName} ${socket.user?.lastName}`,
        userId: socket.user?.id,
    });
}

// set mark read done to specific message
async function markChatDone(
    _: Server,
    socket: Socket,
    payload: ChatMarkDonePayloadT
) {
    if (!hasPermission(socket.user, "chat:mark-read")) return;

    await db
        .update(ChatMessage)
        .set({ markRead: true })
        .where(eq(ChatMessage.id, +payload.id))
        .execute();
}

// when socket will be disconnected
function socketDisconnectHandler(socket: Socket) {
    if (socket.user.id) {
        socket.leave(String(socket.user.id));
    }
}

// whole socket handler and register
function socketHandler(io: Server, socket: Socket) {
    logger.info(`socket connection with username: ${socket.user?.username}`);
    try {
        socket.on(SocketEventEnum.JOIN_STREAM_EVENT, (payload) =>
            joinStreamHandler(socket, payload)
        );
        socket.on(SocketEventEnum.LEAVE_STREAM_EVENT, (payload) =>
            leaveStreamHandler(socket, payload)
        );
        socket.on(SocketEventEnum.CHAT_CREATE_EVENT, (payload) =>
            chatCreateHandler(io, socket, payload)
        );
        socket.on(SocketEventEnum.CHAT_UPDATE_EVENT, (payload) =>
            chatUpdateHandler(io, payload)
        );
        socket.on(SocketEventEnum.CHAT_DELETE_EVENT, (payload) =>
            chatDeleteHandler(io, socket, payload)
        );
        socket.on(SocketEventEnum.GET_STREAM_CONNECTIONS, (payload) => {
            getCurrentViewers(io, payload);
        });
        socket.on(
            SocketEventEnum.PAYMENT_CHAT_CREATE_EVENT,
            paymentChatCreateHandler
        );
        socket.on(
            SocketEventEnum.CHAT_UPVOTE_EVENT,
            async (payload) => await chatUpvoteHandler(io, socket, payload)
        );
        socket.on(
            SocketEventEnum.CHAT_DOWNVOTE_EVENT,
            async (payload) => await chatDownVoteHandler(io, socket, payload)
        );
        socket.on(SocketEventEnum.STREAM_TYPING_EVENT, (payload) =>
            chatTypingEvent(io, socket, payload)
        );
        socket.on(SocketEventEnum.STREAM_STOP_TYPING_EVENT, (payload) =>
            stopChatTypingEvent(io, socket, payload)
        );
        socket.on(SocketEventEnum.CHAT_MARK_DONE, async (payload) => {
            await markChatDone(io, socket, payload);
        });
    } catch (error: any) {
        // Internal error handling & emit errors to client
        logger.error(`Internal sockets error: ${error.message}`);
        socket.emit(
            SocketEventEnum.SOCKET_ERROR_EVENT,
            new ApiError(400, error.message ?? "Some error occured")
        );
    }

    // disconnect event
    socket.on(SocketEventEnum.DISCONNECT_EVENT, () =>
        socketDisconnectHandler(socket)
    );
}

export { socketHandler };

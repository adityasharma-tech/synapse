import { Socket } from "socket.io";
import {
    hasPermission,
    logger,
    chatMessageT,
    ApiError,
    socketEvent as events,
} from "@pkgs/lib";
import { redisClient } from "./redis.service";
import msgpack from "msgpack-lite";

// Events to handle
/**
 * stream-join
 * stream-leave
 * chat-create
 * chat-update
 * chat-delete
 * chat-mark-done
 * chat-pin
 * stream-viewers
 * chat-premium-create
 * chat-upvote
 * chat-downvote
 * stream-typing
 */

async function getInc(streamId: string): Promise<string> {
    return (await redisClient.incr(`message:${streamId}:inc`)).toString();
}

function handleStreamJoin(socket: Socket): void {
    socket.join(socket.handshake.query.socketId as string);
}

function handleStreamLeave(socket: Socket): void {
    socket.leave(socket.handshake.query.socketId as string);
    socket.disconnect(true);
}

async function handleChatCreate(
    socket: Socket,
    payload: Buffer
): Promise<void> {
    if (!hasPermission(socket.user, "chat:create")) return;

    const streamId = socket.handshake.query.streamId as string;

    const id = await getInc(streamId);

    const msg = msgpack.decode(payload) as chatMessageT;
    msg.un = socket.user.username;

    let repPayload: {
        run?: string;
        rmsg?: string;
    } = {};

    if (msg.rid) {
        const rmsg = await redisClient.hGet(`chats:${streamId}`, msg.rid);
        if (rmsg) {
            const drmsg = msgpack.decode(
                Buffer.from(rmsg, "binary")
            ) as chatMessageT;
            repPayload.run = drmsg.un;
            repPayload.rmsg = drmsg.msg.slice(0, 15);
        }
    }

    let returnPayload = { ...msg, ...repPayload };

    await redisClient.hSet(
        `chats:${streamId}`,
        id,
        msgpack.encode(returnPayload).toString("binary")
    );

    global.io.to(streamId).emit(events.CHAT_CREATE, id, payload);
}

async function handleChatDelete(socket: Socket, id: string): Promise<void> {
    const streamId = socket.handshake.query.streamId as string;
    await redisClient.hDel(`chats:${streamId}`, id);
    global.io.to(streamId).emit(events.CHAT_DELETE, id);
}

function handleChatTyping(socket: Socket): void {
    global.io
        .to(socket.handshake.query.streamId as string)
        .emit(events.CHAT_TYPING, socket.user.username);
}

async function handleChatMarkDone(socket: Socket, id: string): Promise<void> {
    if (!hasPermission(socket.user, "chat:mark-read")) return;
    const streamId = socket.handshake.query.streamId as string;
    const message = await redisClient.hGet(`chats:${streamId}`, id);
    if (!message) {
        logger.info("Message not found", { streamId, id });
        return;
    }
    const msg = msgpack.decode(Buffer.from(message, "binary")) as chatMessageT;
    msg.mr = 1;
    await redisClient.hSet(
        `chats:${streamId}`,
        id,
        msgpack.encode(msg).toString("binary")
    );
    global.io.to(streamId).emit(events.CHAT_MARK_DONE, id);
}

async function handleChatPin(socket: Socket, id: string) {
    if (!hasPermission(socket.user, "chat:pin")) return;
    const streamId = socket.handshake.query.streamId as string;
    const message = await redisClient.hGet(`chats:${streamId}`, id);
    if (!message) {
        logger.info("Message not found", { streamId, id });
        return;
    }
    const msg = msgpack.decode(Buffer.from(message, "binary")) as chatMessageT;
    msg.pn = 1;
    await redisClient.hSet(
        `chats:${streamId}`,
        id,
        msgpack.encode(msg).toString("binary")
    );
    global.io.to(streamId).emit(events.CHAT_PIN, id);
}

async function handleGetViewer(socket: Socket) {
    logger.info("requested for viewers");
    console.warn(socket.handshake.query);
    console.warn(socket.handshake.query.streamId);
    const viewers = (
        await io.in(socket.handshake.query.streamId!).fetchSockets()
    ).length;
    io.to(socket.handshake.query.streamId!).emit(
        events.STREAM_VIEWERS,
        viewers
    );
}

async function handleUpvoteChat(socket: Socket, id: string) {
    if (!hasPermission(socket.user, "chat:own-upvote")) return;

    const streamId = socket.handshake.query.streamId as string;

    const ismem = await redisClient.sIsMember(
        `${streamId}:${id}:uvotes`,
        socket.user.id.toString()
    );
    if (ismem == 0) {
        await redisClient.sAdd(`chat:${id}:uvotes`, socket.user.id.toString());
        global.io.to(streamId).emit(events.CHAT_UVOTE, id);
    } else {
        await redisClient.sRem(`chat:${id}:uvotes`, socket.user.id.toString());
        global.io.to(streamId).emit(events.CHAT_REM_UVOTE, id);
    }
}

async function handleDownvoteChat(socket: Socket, id: string) {
    if (!hasPermission(socket.user, "chat:own-downvote")) return;

    const streamId = socket.handshake.query.streamId as string;

    const ismem = await redisClient.sIsMember(
        `${streamId}:${id}:dvotes`,
        socket.user.id.toString()
    );
    if (ismem == 0) {
        await redisClient.sAdd(`chat:${id}:dvotes`, socket.user.id.toString());
        global.io.to(streamId).emit(events.CHAT_DVOTE, id);
    } else {
        await redisClient.sRem(`chat:${id}:dvotes`, socket.user.id.toString());
        global.io.to(streamId).emit(events.CHAT_REM_DVOTE, id);
    }
}

function socketHandler(socket: Socket) {
    logger.info(`socket connection with username: ${socket.user?.username}`);
    try {
        socket.on(events.STREAM_JOIN, () => handleStreamJoin(socket));
        socket.on(events.STREAM_LEAVE, () => handleStreamLeave(socket));
        socket.on(
            events.CHAT_CREATE,
            async (payload) => await handleChatCreate(socket, payload)
        );
        socket.on(
            events.CHAT_DELETE,
            async (id: string) => await handleChatDelete(socket, id)
        );
        socket.on(
            events.STREAM_VIEWERS,
            async () => await handleGetViewer(socket)
        );
        socket.on(
            events.CHAT_UVOTE,
            async (id: string) => await handleUpvoteChat(socket, id)
        );
        socket.on(
            events.CHAT_DVOTE,
            async (id: string) => await handleDownvoteChat(socket, id)
        );
        socket.on(events.CHAT_TYPING, () => handleChatTyping(socket));
        socket.on(
            events.CHAT_MARK_DONE,
            async (id: string) => await handleChatMarkDone(socket, id)
        );
        socket.on(
            events.CHAT_PIN,
            async (id: string) => await handleChatPin(socket, id)
        );
    } catch (error: any) {
        // Internal error handling & emit errors to client
        logger.error(`Internal sockets error: ${error.message}`);
        socket.emit(
            events.SOCKET_ERROR,
            new ApiError(400, error.message ?? "Some error occured")
        );
    }
}

export { socketHandler };

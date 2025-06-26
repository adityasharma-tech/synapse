import { Socket } from "socket.io";
import { hasPermission, logger, chatMessageT, ApiError } from "@pkgs/lib";
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

const events = Object.freeze({
    CHAT_CREATE: "chat-create",
    CHAT_TYPING: "chat-typing",
    CHAT_MARK_DONE: "chat-mark-done",
    CHAT_PIN: "chat-pin",
    CHAT_DELETE: "chat-delete",
    STREAM_VIEWERS: "stream-viewers",
    CHAT_UVOTE: "chat-uv",
    CHAT_DVOTE: "chat-dv",
    CHAT_REM_UVOTE: "chat-rem-uv",
    CHAT_REM_DVOTE: "chat-rem-dv",
    STREAM_JOIN: "stream-join",
    STREAM_LEAVE: "stream-dis",
    SOCKET_ERROR: "socket-error",
});

async function getInc(streamId: string | number) {
    return await redisClient.incr(`message:${streamId}:inc`);
}

function handleStreamJoin(socket: Socket) {
    socket.join(socket.handshake.query.socketId as string);
}

function handleStreamLeave(socket: Socket) {
    socket.leave(socket.handshake.query.socketId as string);
    socket.disconnect(true);
}

async function handleChatCreate(socket: Socket, payload: Buffer) {
    if (!hasPermission(socket.user, "chat:create")) return;

    const streamId = socket.handshake.query.streamId as string;

    const id = (await getInc(streamId)).toString();

    await redisClient.hSet(`chats:${streamId}`, id, payload);

    global.io.to(streamId).emit(events.CHAT_CREATE, id, payload);
}

async function handleChatDelete(socket: Socket, id: number) {
    const streamId = socket.handshake.query.streamId as string;
    await redisClient.hDel(`chats:${streamId}`, id.toString());
    global.io.to(streamId).emit(events.CHAT_DELETE, id);
}

async function handleChatTyping(socket: Socket) {
    global.io
        .to(socket.handshake.query.streamId as string)
        .emit(events.CHAT_TYPING, socket.user.username);
}

async function handleChatMarkDone(socket: Socket, id: number) {
    if (!hasPermission(socket.user, "chat:mark-read")) return;
    const streamId = socket.handshake.query.streamId as string;
    const message = await redisClient.hGet(`chats:${streamId}`, id.toString());
    if (!message) {
        logger.info("Message not found", { streamId, id });
        return;
    }
    const msg = msgpack.decode(Buffer.from(message, "binary")) as chatMessageT;
    msg.mr = 1;
    await redisClient.hSet(
        `chats:${streamId}`,
        id.toString(),
        msgpack.encode(msg).toString("binary")
    );
    global.io.to(streamId).emit(events.CHAT_MARK_DONE, id);
}

async function handleChatPin(socket: Socket, id: number) {
    if (!hasPermission(socket.user, "chat:pin")) return;
    const streamId = socket.handshake.query.streamId as string;
    const message = await redisClient.hGet(`chats:${streamId}`, id.toString());
    if (!message) {
        logger.info("Message not found", { streamId, id });
        return;
    }
    const msg = msgpack.decode(Buffer.from(message, "binary")) as chatMessageT;
    msg.pn = 1;
    await redisClient.hSet(
        `chats:${streamId}`,
        id.toString(),
        msgpack.encode(msg).toString("binary")
    );
    global.io.to(streamId).emit(events.CHAT_PIN, id);
}

async function handleGetViewer(socket: Socket) {
    const viewers = (
        await io.in(socket.handshake.query.streamId!).fetchSockets()
    ).length;
    io.to(socket.handshake.query.streamId!).emit(
        events.STREAM_VIEWERS,
        viewers
    );
}

async function handleUpvoteChat(socket: Socket, id: number) {
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

async function handleDownvoteChat(socket: Socket, id: number) {
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
            async (id: number) => await handleChatDelete(socket, id)
        );
        socket.on(
            events.STREAM_VIEWERS,
            async () => await handleGetViewer(socket)
        );
        socket.on(
            events.CHAT_UVOTE,
            async (id: number) => await handleUpvoteChat(socket, id)
        );
        socket.on(
            events.CHAT_DVOTE,
            async (id) => await handleDownvoteChat(socket, id)
        );
        socket.on(
            events.CHAT_TYPING,
            async () => await handleChatTyping(socket)
        );
        socket.on(
            events.CHAT_MARK_DONE,
            async (id: number) => await handleChatMarkDone(socket, id)
        );
        socket.on(
            events.CHAT_PIN,
            async (id: number) => await handleChatPin(socket, id)
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

import { Socket, Server } from "socket.io";
import { logger } from "../lib/logger";
import { SocketEventEnum } from "../lib/constants";
import { ApiError } from "../lib/ApiError";

// basic data types to support
interface UserT {
  id: number;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  profilePicture?: string;
  phoneNumber: string;
  role: string;
  emailVerified: boolean;
}

interface BasicChatT {
  id: number;
  message: string;
  markRead?: boolean;
  votes: number;
  user: Partial<UserT>;
  pinned?: boolean;
}

interface PremiumChatT extends BasicChatT {
  amount: string;
  paymentStatus?: string;
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

interface ChatUpvotePaylaodT extends ChatDeletePayloadT {}
interface ChatDownVotePaylaodT extends ChatDeletePayloadT {}

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
function chatCreateHandler(
  io: Server,
  socket: Socket,
  payload: ChatCreateHandlerPayloadT
) {
  io.to(payload.streamId).emit(SocketEventEnum.CHAT_CREATE_EVENT, {
    ...payload,
    streamId: undefined,
    markRead: false,
    votes: 0,
    user: {
      fullName: `${socket.user?.firstName} ${socket.user?.lastName}`,
      username: socket.user?.username,
      profilePicture: socket.user?.profilePicture,
      role: socket.user?.role ?? "viewer",
    },
    pinned: false,
  });
}

// when user updates it's chat
function chatUpdateHandler(io: Server, payload: ChatUpdatePayloadT) {
  io.to(payload.streamId).emit(SocketEventEnum.CHAT_UPDATE_EVENT, {
    ...payload,
    streamId: undefined,
  });
}

// when user delete a chat
function chatDeleteHandler(io: Server, payload: ChatDeletePayloadT) {
  io.to(payload.streamId).emit(SocketEventEnum.CHAT_UPDATE_EVENT, {
    ...payload,
    streamId: undefined,
  });
}
function paymentChatCreateHandler() {}

// when a chat is being upvoted
function chatUpvoteHandler(io: Server, payload: ChatUpvotePaylaodT) {
  io.to(payload.streamId).emit(SocketEventEnum.CHAT_UPVOTE_EVENT, payload);
}

// when a chat is being down voted
function chatDownVoteHandler(io: Server, payload: ChatDownVotePaylaodT) {
  io.to(payload.streamId).emit(SocketEventEnum.CHAT_DOWNVOTE_EVENT, payload);
}

// when socket will be disconnected
function socketDisconnectHandler(socket: Socket) {
  if (socket.user?.id) {
    socket.leave(socket.user?.id);
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
      chatDeleteHandler(io, payload)
    );
    socket.on(
      SocketEventEnum.PAYMENT_CHAT_CREATE_EVENT,
      paymentChatCreateHandler
    );
    socket.on(SocketEventEnum.CHAT_UPVOTE_EVENT, chatUpvoteHandler);
    socket.on(SocketEventEnum.CHAT_DOWNVOTE_EVENT, chatDownVoteHandler);
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

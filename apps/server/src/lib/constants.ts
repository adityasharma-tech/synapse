import { env } from "zod-client";

const emailVerificationTokenExpiry = new Date(Date.now() + 6 * 60 * 60); // 6 hr

const msg91AuthKey = env.MSG91_AUTH_KEY;

const corsOrigins = [
  env.FRONTEND_URL,
  "https://synapse-local.adityasharma.live",
  "https://localport-3000.adityasharma.live",
  "https://alishanshowroom.vercel.app",
];

// RabbitMQ Channels
const RMQ_PAYOUT_QUEUE = "payout_queue";

// socket events
const SocketEventEnum = Object.freeze({
  CONNECTED_EVENT: "connection",
  DISCONNECT_EVENT: "disconnecting",
  JOIN_STREAM_EVENT: "stream:join",
  LEAVE_STREAM_EVENT: "stream:leave",
  SOCKET_ERROR_EVENT: "socket:error",
  STREAM_TYPING_EVENT: "stream:typing",
  STREAM_STOP_TYPING_EVENT: "stream:stop-typing",
  CHAT_CREATE_EVENT: "stream:chat:create",
  CHAT_DELETE_EVENT: "stream:chat:delete",
  CHAT_UPDATE_EVENT: "stream:chat:update",
  CHAT_UPVOTE_EVENT: "stream:chat:upvote",
  CHAT_DOWNVOTE_EVENT: "stream:chat:downvote",
  PAYMENT_CHAT_CREATE_EVENT: "stream:chat-payment:create",
  CHAT_MARK_DONE: "stream:chat:mark-done",
  CHAT_UPVOTE_DOWN_EVENT: "stream:chat:upvote-down",
  CHAT_DOWNVOTE_DOWN_EVENT: "stream:chat:downvote-down",
});

export {
  emailVerificationTokenExpiry,
  msg91AuthKey,
  corsOrigins,
  SocketEventEnum,
  RMQ_PAYOUT_QUEUE,
};

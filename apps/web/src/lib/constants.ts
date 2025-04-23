import { webEnv } from "zod-client";

// constant declaration for msg91 configuration
const msgWidgetId = webEnv.VITE_WIDGET_ID;
const msgAuthToken = webEnv.VITE_TOKEN_AUTH;

//
const hostBaseUrl = webEnv.VITE_BACKEND_HOST + "/api/v1";
const githubUrl = "https://github.com/adityasharma-tech/synapse.git";

// razorpay key id import only
const razorpayKeyId = webEnv.VITE_RAZORPAY_KEY_ID;

// socket events both on server side and client side, I also need to fix that so that
// we can only need to update one time thte SocketEventEnum
// so that it will sync to the server and client side both.
const SocketEventEnum = Object.freeze({
  CONNECTED_EVENT: "connected",
  DISCONNECT_EVENT: "disconnected",
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
  msgAuthToken,
  msgWidgetId,
  hostBaseUrl,
  SocketEventEnum,
  razorpayKeyId,
  githubUrl,
};

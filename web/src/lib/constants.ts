const msgWidgetId = import.meta.env.VITE_WIDGET_ID!;
const msgAuthToken = import.meta.env.VITE_TOKEN_AUTH!;

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

export { msgAuthToken, msgWidgetId, SocketEventEnum };

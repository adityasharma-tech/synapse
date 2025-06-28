"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.socketEvent = void 0;
const events = Object.freeze({
    CHAT_CREATE: "chat-create",
    CHAT_TYPING: "chat-typing",
    CHAT_MARK_DONE: "chat-mark-done",
    CHAT_PIN: "chat-pin",
    CHAT_PREMIUM: "chat-premium",
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
exports.socketEvent = events;

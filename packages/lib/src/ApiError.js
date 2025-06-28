"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrCodes = exports.ApiError = void 0;
// TODO: Have to add more error codes
const ErrCodes = Object.freeze({
    DEFAULT_RES: "DEFAULT_RES",
    INVALID_CREDS: "INVALID_CREDS",
    EMAIL_NOT_VERIFIED: "EMAIL_NOT_VERIFIED",
    VALIDATION_ERR: "VALIDATION_ERR",
    USER_EXISTS: "USER_EXISTS",
    DB_INSERT_ERR: "DB_INSERT_ERR",
    DB_UPDATE_ERR: "DB_UPDATE_ERR",
    DB_ROW_NOT_FOUND: "DB_ROW_NOT_FOUND",
    ALREADY_VERIFIED: "ALREADY_VERIFIED",
    EMAIL_SEND_ERR: "EMAIL_SEND_ERR",
    UNAUTHORIZED: "UNAUTHORIZED",
    REFRESH_TOKEN_EXPIRED: "REFRESH_TOKEN_EXPIRED",
    ACCESS_TOKEN_EXPIRED: "ACCESS_TOKEN_EXPIRED",
    STREAMER_TOKEN_EXPIRED: "STREAMER_TOKEN_EXPIRED",
    MSG91_ERROR: "MSG91_ERROR",
});
exports.ErrCodes = ErrCodes;
// class for ApiError to send custom messages
class ApiError extends Error {
    constructor(
        statusCode,
        message,
        errType = ErrCodes.DEFAULT_RES,
        errors = [],
        stack = ""
    ) {
        super();
        this.statusCode = statusCode;
        this.data = null;
        this.message = message;
        this.success = false;
        this.errType = errType;
        this.errors = errors;
        if (process.env.NODE_ENV == "development") {
            if (stack) this.stack = stack;
            else Error.captureStackTrace(this, this.constructor);
        } else {
            this.stack = "";
        }
    }
}
exports.ApiError = ApiError;

declare const ErrCodes: Readonly<{
    DEFAULT_RES: "DEFAULT_RES";
    INVALID_CREDS: "INVALID_CREDS";
    EMAIL_NOT_VERIFIED: "EMAIL_NOT_VERIFIED";
    VALIDATION_ERR: "VALIDATION_ERR";
    USER_EXISTS: "USER_EXISTS";
    DB_INSERT_ERR: "DB_INSERT_ERR";
    DB_UPDATE_ERR: "DB_UPDATE_ERR";
    DB_ROW_NOT_FOUND: "DB_ROW_NOT_FOUND";
    ALREADY_VERIFIED: "ALREADY_VERIFIED";
    EMAIL_SEND_ERR: "EMAIL_SEND_ERR";
    UNAUTHORIZED: "UNAUTHORIZED";
    REFRESH_TOKEN_EXPIRED: "REFRESH_TOKEN_EXPIRED";
    ACCESS_TOKEN_EXPIRED: "ACCESS_TOKEN_EXPIRED";
    STREAMER_TOKEN_EXPIRED: "STREAMER_TOKEN_EXPIRED";
    MSG91_ERROR: "MSG91_ERROR";
}>;
declare class ApiError extends Error {
    statusCode?: number;
    data?: any;
    message: string;
    success?: boolean;
    errType?: keyof typeof ErrCodes;
    errors?: any[];
    constructor(
        statusCode: number,
        message: string,
        errType?: keyof typeof ErrCodes,
        errors?: any[],
        stack?: string
    );
}
export { ApiError, ErrCodes };

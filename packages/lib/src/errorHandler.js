"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const logger_1 = require("./logger");
const ApiError_1 = require("./ApiError");
const errorHandler = (err, _, res, __) => {
    var _a;
    try {
        logger_1.logger.error(`Server: ${JSON.stringify(err)}`);
        if (JSON.stringify(err) == "{}") throw new Error();
    } catch (error) {
        console.error(err);
    }
    if (err instanceof ApiError_1.ApiError)
        return res
            .status((_a = err.statusCode) !== null && _a !== void 0 ? _a : 500)
            .json(err);
    res.status(500).json(
        new ApiError_1.ApiError(
            500,
            "Internal server error",
            ApiError_1.ErrCodes.DEFAULT_RES
        )
    );
};
exports.errorHandler = errorHandler;

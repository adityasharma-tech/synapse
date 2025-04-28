import { logger } from "./logger";
import { NextFunction, Request, Response } from "express";
import { ApiError, ErrCodes } from "./ApiError";

type ErrorHandler = (
    err: any,
    _: Request,
    res: Response,
    __: NextFunction
) => void;

const errorHandler: ErrorHandler = (err, _, res, __) => {
    try {
        logger.error(`Server: ${JSON.stringify(err)}`);
    } catch (error) {
        console.error(err);
    }
    if (err instanceof ApiError)
        return res.status(err.statusCode ?? 500).json(err);
    res.status(500).json(
        new ApiError(500, "Internal server error", ErrCodes.DEFAULT_RES)
    );
};

export { errorHandler };

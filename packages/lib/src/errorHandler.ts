import { logger } from "./logger";
import { Request, Response } from "express";
import { ApiError, ErrCodes } from "./ApiError";

type ErrorHandler = (err: any, _: Request, res: Response) => void;

const errorHandler: ErrorHandler = (err, _, res) => {
    if (err instanceof ApiError)
        return res.status(err.statusCode ?? 500).json(err);
    logger.error(`Server: ${JSON.stringify(err)}`);
    res.status(500).json(
        new ApiError(500, "Internal server error", ErrCodes.DEFAULT_RES)
    );
};

export { errorHandler };

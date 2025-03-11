import { NextFunction, Request, Response } from "express";
import { ApiError } from "./ApiError";
import { logger } from "./configs";

const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
    const errStatus = err.statusCode ?? 500;
    const errMsg = err.message || 'Internal server error';
    const error = new ApiError(errStatus, errMsg);
    logger.error(JSON.stringify(error));
    res.status(errStatus).json(JSON.parse(JSON.stringify(error)));
}

export default errorHandler
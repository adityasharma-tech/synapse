import { NextFunction, Request, Response } from "express";
import { ApiError, ErrCodes } from "./ApiError";
import { logger } from "./logger";

const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const errStatus = err.statusCode ?? 500;
  const errMsg = err.message || "Internal server error";
  const errType = err.errType || ErrCodes.DEFAULT_RES;
  const error = new ApiError(errStatus, errMsg, errType, err.errors ?? []);
  console.error(error);
  logger.error(JSON.stringify(err));
  res.status(errStatus).json(JSON.parse(JSON.stringify(error)));
};

export default errorHandler;

import { NextFunction, Request, Response } from "express";
type ErrorHandler = (
    err: any,
    _: Request,
    res: Response,
    __: NextFunction
) => void;
declare const errorHandler: ErrorHandler;
export { errorHandler };

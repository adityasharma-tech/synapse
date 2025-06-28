import { NextFunction, Response, Request } from "express";
declare const asyncHandler: (
    requestHander: (req: Request, res: Response, next: NextFunction) => void
) => (req: Request, res: Response, next: NextFunction) => void;
export { asyncHandler };

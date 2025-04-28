import { NextFunction, Response, Request } from "express";

const asyncHandler = (
    requestHander: (req: Request, res: Response, next: NextFunction) => void
) => {
    return (req: Request, res: Response, next: NextFunction) => {
        Promise.resolve(requestHander(req, res, next)).catch((err) =>
            next(err)
        );
    };
};

export { asyncHandler };

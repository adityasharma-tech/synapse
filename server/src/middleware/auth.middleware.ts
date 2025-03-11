import establishDbConnection from "../db";
import { ApiError } from "../lib/ApiError";
import { asyncHandler } from "../lib/asyncHandler";
import jwt from "jsonwebtoken"
import { User } from "../schemas/user.sql";
import { eq } from "drizzle-orm";
import { logger } from "../lib/configs";

const authMiddleware = asyncHandler(async (req, res, next) => {
    const cookies = req.cookies

    const accessToken = cookies?.accessToken || req.headers?.accessToken;

    if (!accessToken)
        throw new ApiError(401, "Unauthorized");
    try {
        const decodedUser:any = jwt.verify(cookies.accessToken, process.env.ACCESS_SECRET_KEY!);
        const db = establishDbConnection()

        const [user] = await db
            .select()
            .from(User)
            .where(
                eq(User.id, decodedUser.userId)
            ).execute();

        req.user = {
            ...user,
            password: undefined,
            profilePicture: undefined,
        }
    } catch (error: any) {
        logger.error(`Error during accessing middleware: ${error.message}`)
        throw new ApiError(401, "Unauthorized");
    }
    next()
})

export {
    authMiddleware
}
import jwt from "jsonwebtoken";
import establishDbConnection from "../db";

import { eq } from "drizzle-orm";
import { User } from "../schemas/user.sql";
import { logger } from "../lib/configs";
import { TokenTable } from "../schemas/tokenTable.sql";
import { asyncHandler } from "../lib/asyncHandler";
import { ApiError, ErrCodes } from "../lib/ApiError";

const authMiddleware = asyncHandler(async (req, _, next) => {
  const cookies = req.cookies;

  const accessToken = cookies?.accessToken || req.headers?.accessToken;

  if (!accessToken)
    throw new ApiError(401, "Unauthorized", ErrCodes.UNAUTHORIZED);
  try {
    const decodedUser: any = jwt.verify(
      cookies.accessToken,
      process.env.ACCESS_SECRET_KEY!
    );
    logger.warn(`Decoded user: ${JSON.stringify(decodedUser)}`);
    const db = establishDbConnection();

    const [user] = await db
      .select()
      .from(User)
      .where(eq(User.id, decodedUser.userId))
      .execute();

    if (!user) throw new ApiError(401, "Unauthorized", ErrCodes.UNAUTHORIZED);

    req.user = {
      ...user,
      password: undefined,
      profilePicture: undefined,
      updatedAt: undefined,
      createdAt: undefined,
    };
  } catch (error: any) {
    logger.error(`Error during accessing middleware: ${error.message}`);
    if (error instanceof jwt.TokenExpiredError)
      throw new ApiError(401, "Unauthorized", ErrCodes.ACCESS_TOKEN_EXPIRED);
    else if (error instanceof jwt.JsonWebTokenError)
      throw new ApiError(401, "Unauthorized: Invalid token");
    else throw new ApiError(401, "Unauthorized", ErrCodes.UNAUTHORIZED);
  }
  next();
});

const streamerAuthMiddeware = asyncHandler(async (req, _, next) => {
  if (!req.user) throw new ApiError(401, "Unauthorized");

  if (req.user.role != "streamer")
    throw new ApiError(401, "You are not authorized streamer.");

  const db = establishDbConnection();

  const tokens = await db
    .select()
    .from(TokenTable)
    .where(eq(TokenTable.userId, req.user.id))
    .limit(1)
    .execute();

  if (!tokens || tokens.length <= 0 || !tokens[0].streamerVerificationToken)
    throw new ApiError(
      401,
      "Streamer token not found. You may need to verify your details to start streaming."
    );

  try {
    const streamerPayload = jwt.verify(
      tokens[0].streamerVerificationToken,
      process.env.STREAMER_SECRET_KEY!
    );
    req.streamer = JSON.parse(JSON.stringify(streamerPayload));
  } catch (error: any) {
    logger.error(`Error during accessing middleware: ${error.message}`);
    if (error instanceof jwt.TokenExpiredError)
      throw new ApiError(401, "Unauthorized", ErrCodes.STREAMER_TOKEN_EXPIRED);
    else if (error instanceof jwt.JsonWebTokenError)
      throw new ApiError(
        401,
        "Unauthorized: Invalid token",
        ErrCodes.UNAUTHORIZED
      );
    else throw new ApiError(401, "Unauthorized", ErrCodes.UNAUTHORIZED);
  }
  next();
});

export { authMiddleware, streamerAuthMiddeware };

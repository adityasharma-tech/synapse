import jwt from "jsonwebtoken";
import establishDbConnection from "../db";

import { eq } from "drizzle-orm";
import { User } from "../schemas/user.sql";
import { logger } from "../lib/logger";
import { TokenTable } from "../schemas/tokenTable.sql";
import { asyncHandler } from "../lib/asyncHandler";
import { ApiError, ErrCodes } from "../lib/ApiError";

/**
 * authentication middleware to use the protected/secured routes to the authorized user only
 */
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
    const [user] = await db
      .select()
      .from(User)
      .where(eq(User.id, decodedUser.userId))
      .execute();

    if (!user) throw new ApiError(401, "Unauthorized", ErrCodes.UNAUTHORIZED);

    req.user = {
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      emailVerified: user.emailVerified,
      id: user.id,
      role: user.role ?? "viewer",
      username: user.username,
      profilePicture: user.profilePicture || undefined,
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

/**
 * specific middleware to verify streamer protected routes
 */
const streamerAuthMiddeware = asyncHandler(async (req, _, next) => {
  if (!req.user) throw new ApiError(401, "Unauthorized");
  if (req.user.role == "admin") return next();

  // checking the role which must be streamer
  if (req.user.role != "streamer")
    throw new ApiError(401, "You are not authorized streamer.");

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
    jwt.verify(
      tokens[0].streamerVerificationToken,
      process.env.STREAMER_SECRET_KEY!
    );
    // req.streamer = JSON.parse(JSON.stringify(streamerPayload));
  } catch (error: any) {
    logger.error(`Error during accessing middleware: ${error.message}`);
    // Error handling, makes sure (TokenExpiration, JSONWebTokenErr or other type of errors)
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

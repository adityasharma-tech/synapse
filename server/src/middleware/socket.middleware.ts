import jwt from "jsonwebtoken";
import cookie from "cookie";

import { logger } from "../lib/logger";
import { ApiError, ErrCodes } from "../lib/ApiError";
import { ExtendedError, Socket } from "socket.io";

const socketAuthMiddleware = async (
  socket: Socket,
  next: (err?: ExtendedError) => void
) => {
  try {
    // parsing all the cookies from the socket handshake headers
    const cookies = cookie.parse(socket.handshake.headers?.cookie ?? "");
    const accessToken =
      cookies?.accessToken || socket.handshake.headers?.accessToken;

    if (!accessToken)
      throw new ApiError(401, "Unauthorized", ErrCodes.UNAUTHORIZED);

    const decodedUser: any = jwt.verify(
      String(accessToken),
      process.env.ACCESS_SECRET_KEY!
    );
    socket.user = decodedUser;
  } catch (error: any) {
    logger.error(`Error during accessing middleware: ${error.message}`);
    if (error instanceof jwt.TokenExpiredError)
      next(new ApiError(401, "Unauthorized", ErrCodes.ACCESS_TOKEN_EXPIRED));
    else if (error instanceof jwt.JsonWebTokenError)
      next(
        new ApiError(401, "Unauthorized: Invalid token", ErrCodes.UNAUTHORIZED)
      );
    else if (error instanceof ApiError) next(error);
    else next(new ApiError(401, "Unauthorized", ErrCodes.UNAUTHORIZED));
  }
  next();
};

export { socketAuthMiddleware };

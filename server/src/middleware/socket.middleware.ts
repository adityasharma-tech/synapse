import jwt from "jsonwebtoken";

import { logger } from "../lib/logger";
import { ApiError, ErrCodes } from "../lib/ApiError";
import { ExtendedError, Socket } from "socket.io";
import { parse } from "cookie";

/**
 * @description A function to emit the socket event also disconnecting it so that user can't make any socket request.
 * @param {(import "socket.io").Socket} socket
 * @param {ApiError} error The ApiError to send error in specific format
 */
function disconnectSocketWithError(socket: Socket, error: ApiError) {
  socket.emit("connect_error", error);
  socket.disconnect();
}


/**
 * @description Socket.io middlware to verify the authenticated users only.
 * @param socket 
 * @param next 
 * @returns {void}
 */
const socketAuthMiddleware = (
  socket: Socket,
  next: (err?: ExtendedError) => void
) => {
  try {
    // parsing all the cookies from the socket handshake headers
    const cookies = parse(socket.handshake.headers.cookie ?? "");
    const accessToken =
      cookies?.accessToken || socket.handshake.headers?.accessToken;

    if (!accessToken)
      throw new ApiError(401, "Unauthorized", ErrCodes.UNAUTHORIZED);

    const decodedUser: any = jwt.verify(
      String(accessToken),
      process.env.ACCESS_SECRET_KEY!
    );
    socket.user = decodedUser;
    next();
  } catch (error: any) {
    logger.error(`Error during accessing middleware: ${error.message}`);
    
    // checking if token is expired then send unauthorized with access token expired code
    if (error instanceof jwt.TokenExpiredError)
      return disconnectSocketWithError(socket, new ApiError(401, "Unauthorized", ErrCodes.ACCESS_TOKEN_EXPIRED));

    // it may be json encrpyt-decrpyt error
    else if (error instanceof jwt.JsonWebTokenError)
      return disconnectSocketWithError(
        socket,
        new ApiError(401, "Unauthorized: Invalid token", ErrCodes.UNAUTHORIZED)
      );

    // If its an ApiError class Instance means directly we can throw it.
    else if (error instanceof ApiError)
      return disconnectSocketWithError(socket, error);

    // or may be some internal server errror can happen
    else
      return disconnectSocketWithError(
        socket,
        new ApiError(401, "Unauthorized", ErrCodes.UNAUTHORIZED)
      );
  }
};

export { socketAuthMiddleware };

import jwt from "jsonwebtoken";

import { parse } from "cookie";
import { logger } from "../lib/logger";
import { and, eq } from "drizzle-orm";
import { SocketEventEnum } from "../lib/constants";
import { ApiError, ErrCodes } from "../lib/ApiError";
import { ExtendedError, Socket } from "socket.io";
import { env } from "zod-client";
import { Stream, User } from "drizzle-client";

/**
 * @description A function to emit the socket event also disconnecting it so that user can't make any socket request.
 * @param {(import "socket.io").Socket} socket
 * @param {ApiError} error The ApiError to send error in specific format
 */
export function disconnectSocketWithError(socket: Socket, error: ApiError) {
  socket.emit(SocketEventEnum.SOCKET_ERROR_EVENT, error);
  socket.disconnect();
}

/**
 * @description Socket.io middlware to verify the authenticated users only.
 * @param socket
 * @param next
 * @returns {void}
 */
const socketAuthMiddleware = async (
  socket: Socket,
  next: (err?: ExtendedError) => void
) => {
  try {
    // parsing all the cookies from the socket handshake headers
    const cookies = parse(socket.handshake.headers.cookie ?? "");
    const accessToken =
      cookies?.accessToken || socket.handshake.headers?.accessToken;
    const streamId = socket.handshake.query.streamId as string;

    if (!accessToken)
      throw new ApiError(401, "Unauthorized", ErrCodes.UNAUTHORIZED);

    const decodedUser: any = jwt.verify(
      String(accessToken),
      env.ACCESS_SECRET_KEY
    );

    const [stream] = await db
      .select({ streamingUid: Stream.streamingUid })
      .from(Stream)
      .where(eq(Stream.streamingUid, streamId))
      .execute();

    if (!stream) throw new ApiError(400, "Stream not found");

    const [user] = await db
      .select({
        id: User.id,
        firstName: User.firstName,
        lastName: User.lastName,
        username: User.username,
        email: User.email,
        profilePicture: User.profilePicture,
        role: User.role,
        emailVerified: User.emailVerified,
      })
      .from(User)
      .where(eq(User.id, decodedUser.id))
      .execute();

    const [streamer] = await db
      .select({
        streamerId: Stream.streamerId,
        streamingUid: Stream.streamingUid,
      })
      .from(Stream)
      .where(
        and(eq(Stream.streamerId, user.id), eq(Stream.streamingUid, streamId))
      )
      .execute();

    socket.user = {
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      emailVerified: user.emailVerified,
      id: user.id,
      role: "viewer",
      username: user.username,
      profilePicture: user.profilePicture || undefined,
    };

    if (streamer) {
      socket.user.role = "streamer";
    }
    next();
  } catch (error: any) {
    logger.error(`Error during accessing middleware: ${error.message}`);

    // checking if token is expired then send unauthorized with access token expired code
    if (error instanceof jwt.TokenExpiredError)
      return disconnectSocketWithError(
        socket,
        new ApiError(401, "Unauthorized", ErrCodes.ACCESS_TOKEN_EXPIRED)
      );
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

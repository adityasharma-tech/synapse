import http from "http";
import cors from "cors";
import dotenv from "dotenv";
import morgan from "morgan";
import helmet from "helmet";
import express from "express";
import cookieParser from "cookie-parser";


import { rateLimit } from "express-rate-limit";
import { corsOrigins, SocketEventEnum } from './lib/constants';
import { ApiResponse } from "./lib/ApiResponse";
import { ApiError } from './lib/ApiError';
import { redisClient } from './services/redis.service';
import { createAdapter } from '@socket.io/redis-adapter';
import { Socket, Server as SocketIO } from "socket.io";
import { socketAuthMiddleware } from './middleware/socket.middleware';


/**
 * Http Express Server
 */
const app = express();
const server = http.createServer(app);

/**
 * Socket io server
 * using redis as a pub/sub for sockets
 */
const subClient = redisClient.duplicate();
(async ()=> await Promise.all([redisClient.connect(), subClient.connect()]))()

const io = new SocketIO(server, {
  cors: {
    origin: "*",
    credentials: true,
  },
  adapter: createAdapter(redisClient, subClient),
  cookie: true
});
// socket.io middlewares
io.engine.use(helmet())
// created /ws path to maintain paths, not to conflict with express server
// const ws = io.of('/ws');
// Authentication middleware for socket.io to let in authenticated users only and streamer verification
io.use(socketAuthMiddleware);

io.on(SocketEventEnum.CONNECTED_EVENT, (socket: Socket) => {
  logger.info(`socketid: ${socket.id} connected.`)
  try {
    socket.on(SocketEventEnum.JOIN_STREAM_EVENT, (roomId: string)=>{
      socket.join(roomId)
    })
    socket.on(SocketEventEnum.LEAVE_STREAM_EVENT, (roomId: string)=>{
      socket.leave(roomId)
    })
    socket.on(SocketEventEnum.CHAT_CREATE_EVENT, (chatMessage, roomId)=>{
      logger.info(`CHAT_CREATE_EVENT: ${chatMessage} ${roomId}`)
      io.to(roomId).emit(chatMessage, roomId, "Kuch to aaya")
      // socket.to(roomId).emit(SocketEvent, {
      //   user: {
      //     username: socket.user?.username,
      //     profilePicture: socket.user?.profilePicture,
      //     fullName: `${socket.user?.firstName} ${socket.user?.lastName}`
      //   },
      //   chatMessage
      // });
    })
  } catch (error: any) {
    logger.error(`Internal sockets error: ${error.message}`)
    socket.emit(SocketEventEnum.SOCKET_ERROR_EVENT, new ApiError(400, error.message ?? "Some error occured"))
  }

  socket.on(SocketEventEnum.DISCONNECT_EVENT, () => {
    if(socket.user?.id){
      socket.leave(socket.user?.id);
    }
  })
})

/**
 * Rate limiter configuration
 */
const limiter = rateLimit({
  windowMs: 1000 * 60,
  limit: 90,
  message: new ApiResponse(429, null, "Too many requests"),
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * middlewares
 */
app.use(cors({
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  credentials: true,
  origin: corsOrigins,
}))
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));
app.use(helmet());
app.use(limiter);

/**
 * Router imports
 */
import defaultRouter from "./routes/default.routes"
import authRouter from "./routes/auth.routes";
import userRouter from "./routes/user.routes";
import streamRouter from "./routes/stream.routes";

/**
 * Router handlers
*/
app.use(defaultRouter);
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/user", userRouter);
app.use("/api/v1/streams", streamRouter);


/**
 * Error handler
*/
import errorHandler from "./lib/errorHandler";
import { logger } from './lib/logger';
app.use(errorHandler);

export default server
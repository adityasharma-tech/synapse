import http from "http";
import cors from "cors";
import pm2 from "@pm2/io";
import morgan from "morgan";
import helmet from "helmet";
import express from "express";
import cookieParser from "cookie-parser";

import { errorHandler, corsOrigins, ApiResponse, logger } from "@pkgs/lib";
import { rateLimit } from "express-rate-limit";
import { redisClient } from "./services/redis.service";
import { socketHandler } from "./services/ws.service";
import { createAdapter } from "@socket.io/redis-adapter";
import { DrizzleClient } from "@pkgs/drizzle-client";
import { Server as SocketIO } from "socket.io";
import { socketAuthMiddleware } from "./middleware/socket.middleware";

/**
 * Http Express Server
 */
const app = express();
const server = http.createServer(app);
global.db = new DrizzleClient().db;
/**
 * Socket io server
 * using redis as a pub/sub for sockets
 */
const subClient = redisClient.duplicate();
(async () => await Promise.all([redisClient.connect(), subClient.connect()]))();

const io = new SocketIO(server, {
    cors: { origin: corsOrigins, credentials: true },
    adapter: createAdapter(redisClient, subClient), // only if you want to use redis as an adapter
    cookie: true,
    transports: ["websocket", "webtransport"],
});

// pm2
pm2.init();

// socket.io middlewares
io.engine.use(helmet());
// created /ws path to maintain paths for websocket
// const ws = io.of('/ws');
// Authentication middleware for socket.io to let in authenticated users only and streamer verification
io.use(socketAuthMiddleware);

// setting variable in express for the socketio
global.io = io;

// socket connection handlers
io.on("connection", (socket) => socketHandler(socket));

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
app.use(
    cors({
        methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
        credentials: true,
        origin: corsOrigins,
    })
);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(
    morgan(":method :url :status :response-time ms - :res[content-length]", {
        stream: {
            write: (message) => logger.http(message.trim().toString()),
        },
    })
);
app.use(helmet());
app.use(limiter);
app.use(pm2.expressErrorHandler());

// app.set("trust proxy", true);

/**
 * Router imports
 */
import defaultRouter from "./routes/default.routes";
import authRouter from "./routes/auth.routes";
import userRouter from "./routes/user.routes";
import streamRouter from "./routes/stream.routes";
import webhookRouter from "./routes/webhook.routes";
import adminRouter from "./routes/admin.routes";

/**
 * Router handlers
 */
app.use(defaultRouter);
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/user", userRouter);
app.use("/api/v1/streams", streamRouter);
app.use("/api/v1/webhook", webhookRouter);
app.use("/api/v1/admin", adminRouter);

/**
 * express error handler
 */
app.use(errorHandler);

export default server;

// imports
import http from "http";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";
import express from "express";
import cookieParser from "cookie-parser";

import { errorHandler, corsOrigins, ApiResponse } from "@pkgs/lib";
import { rateLimit } from "express-rate-limit";
import { DrizzleClient } from "@pkgs/drizzle-client";
// import { redisClient } from "./services/redis.service";
// import { createAdapter } from "@socket.io/redis-adapter";

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
// const subClient = redisClient.duplicate();
// (async () => await Promise.all([redisClient.connect(), subClient.connect()]))();

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
app.use(morgan("dev"));
app.use(helmet());
app.use(limiter);
// app.set("trust proxy", true);

/**
 * Router imports
 */
import authRouter from "./routes/auth.routes";

/**
 * Router handlers
 */
app.use("/api/v1/auth", authRouter);

/**
 * express error handler
 */
app.use(errorHandler);

export default server;

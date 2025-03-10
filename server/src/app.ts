import http from "http";
import morgan from "morgan";
import express from "express";
import cookieParser from "cookie-parser";

import { Server } from "socket.io";
import { rateLimit } from "express-rate-limit";
import { ApiResponse } from "./lib/ApiResponse";

/**
 * Http Express Server
 */
const app = express();
const server = http.createServer(app);

/**
 * Socket io server
 */
const io = new Server(server);
io.attach(server);


/**
 * Rate limiter configuration
 */
const limiter = rateLimit({
  windowMs: 1000 * 60,
  limit: 60,
  message: new ApiResponse(429, null, "Too many requests"),
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * middlewares
 */
app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));
app.use(limiter);

/**
 * Router imports
 */
import authRouter from "./routes/auth.routes";

/**
 * Router handlers
 */
app.use("/api/v1/auth", authRouter);

export default server;

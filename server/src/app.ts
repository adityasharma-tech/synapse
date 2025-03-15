import 'dotenv/config';
import http from "http";
import cors from "cors";
import morgan from "morgan";
import express from "express";
import helmet from "helmet";
import cookieParser from "cookie-parser";


import { Server } from "socket.io";
import { corsOrigins } from './lib/constants';
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
const io = new Server(server, {
  cors: {
    origin: "*",
    credentials: true,
  },
});

io.on("connection", (socket) => {
  
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
app.use(errorHandler);


export default server
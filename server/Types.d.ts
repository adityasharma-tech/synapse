import { Request } from "express";
import { MiddlewareUserT } from "./src/lib/types";
import { Server } from "socket.io"
declare global {
  namespace Express {
    interface Request {
      user: MiddlewareUserT | { [key: string]: any };
    }
  }
  var io: Socket
}

declare module "socket.io" {
  interface Socket {
    user: MiddlewareUserT;
  }
}

export {};

import { Request } from "express";
import { MiddlewareUserT } from "./src/lib/types";
declare global {
  namespace Express {
    interface Request {
      user: MiddlewareUserT | { [key: string]: any };
    }
  }
}

declare module "socket.io" {
  interface Socket {
    user: MiddlewareUserT;
  }
}

export {};

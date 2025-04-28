import { Request } from "express";
import { MiddlewareUserT } from "@pkgs/lib";
import { Server } from "socket.io";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
declare global {
  namespace Express {
    interface Request {
      user: MiddlewareUserT | { [key: string]: any };
    }
  }
  var io: Socket;
  var db: NodePgDatabase<Record<string, never>> & { $client: Pool };
}

declare module "socket.io" {
  interface Socket {
    user: MiddlewareUserT;
  }
}

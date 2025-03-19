import { Request } from "express";

interface UserT {
  id: number;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  profilePicture?: string;
  phoneNumber: string;
  role: string;
  emailVerified: boolean;
}

interface StreamerT {
  beneficiaryId: string;
  userId: string | number;
  addedAt: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: UserT | {[key: string]: any};
      streamer?: StreamerT | {[key: string]: any};
    }
  }
}

declare module "socket.io" {
  interface Socket {
    user?: UserT | {[key: string]: any};
  }
}

export {};

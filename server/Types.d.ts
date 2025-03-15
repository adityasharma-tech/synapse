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

declare global {
  namespace Express {
    interface Request {
      user?: UserT | {[key: string]: any};
    }
  }
}

export {};

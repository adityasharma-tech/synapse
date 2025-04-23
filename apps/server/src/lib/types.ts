import { Role } from "./utils";

interface MiddlewareUserT {
  id: number;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  profilePicture?: string;
  role: Role;
  emailVerified: boolean;
  streamerToken?: string;
  phoneNumber?: string;
}

export type { MiddlewareUserT };

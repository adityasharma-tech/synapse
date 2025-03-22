import { Role } from "./utils";

interface MUserT {
  id: number;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  profilePicture?: string;
  role: Role;
  emailVerified: boolean;
  streamerToken?: string;
}

type MiddlewareUserT = MUserT;

export type { MiddlewareUserT };

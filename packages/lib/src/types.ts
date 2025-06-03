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

type ActionT =
    | "view"
    | "update"
    | "delete"
    | "block"
    | "unblock"
    | "accept"
    | "reject"
    | "user:block"
    | "rating:create"
    | "rating:update:own"
    | "rating:delete:own"
    | "create"
    | "update:own"
    | "delete:own"
    | "upvote"
    | "downvote";

type rmqMailServiceType =
    | "confirmation"
    | "reset_password"
    | "recieve_streamer_application"
    | "streamer_application_rejected"
    | "streamer_application_accepted"
    | "subs_start_streaming";

export type { MiddlewareUserT, rmqMailServiceType, ActionT };

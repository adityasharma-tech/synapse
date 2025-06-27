import { Role } from "./utils";
import { PaymentStatusT } from "@pkgs/drizzle-client";

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
    | "welcome_email"
    | "streamer_application_rejected"
    | "streamer_application_accepted"
    | "subs_start_streaming";

type chatMessageT = {
    msg: string;
    mr: 0 | 1;
    rid?: string;
    pn: 0 | 1;
    ps?: PaymentStatusT;
    ts: Date;
    pa?: number;
    un: string;
    run?: string;
    rmsg?: string;
};

export type { MiddlewareUserT, rmqMailServiceType, ActionT, chatMessageT };

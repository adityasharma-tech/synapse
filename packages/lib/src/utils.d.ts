import { MiddlewareUserT } from "./types";
export type Role = keyof typeof ROLES;
type Permission = (typeof ROLES)[Role][number];
declare const ROLES: {
    readonly admin: readonly [
        "chat:create",
        "chat:delete",
        "chat:message:own-update",
        "chat:mark-read",
        "chat:view",
        "chat:pin",
        "stream:create",
        "stream:update",
        "stream:view",
        "stream:user:block",
        "plan:create",
        "plan:view",
        "plan:update",
        "emote:create",
        "emote:delete",
        "emote:delete-own",
    ];
    readonly streamer: readonly [
        "chat:create",
        "chat:delete",
        "chat:message:own-update",
        "chat:mark-read",
        "chat:view",
        "chat:pin",
        "plan:create",
        "plan:update",
        "plan:view",
        "stream:create",
        "stream:update",
        "stream:view",
        "stream:user:block",
        "emote:create",
        "emote:delete-own",
    ];
    readonly viewer: readonly [
        "chat:create",
        "chat:delete",
        "chat:message:own-update",
        "chat:view",
        "stream:view",
        "chat:own-upvote",
        "chat:own-downvote",
        "plan:view",
    ];
};
export declare const userRoles: string[];
/**
 * Function to check user role permissions
 * @param user
 * @param permission
 * @returns
 */
declare function hasPermission(
    user: MiddlewareUserT,
    permission: Permission
): boolean;
export { hasPermission };

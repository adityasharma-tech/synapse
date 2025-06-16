import { MiddlewareUserT } from "./types";
// Roles
export type Role = keyof typeof ROLES;
type Permission = (typeof ROLES)[Role][number];

const ROLES = {
    admin: [
        "chat:create",
        "chat:delete",
        "chat:message:own-update",
        "chat:mark-read",
        "chat:view",
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
    ],
    streamer: [
        "chat:create",
        "chat:delete",
        "chat:message:own-update", // self message update
        "chat:mark-read",
        "chat:view",
        "plan:create",
        "plan:update",
        "plan:view",
        "stream:create",
        "stream:update",
        "stream:view",
        "stream:user:block",
        "emote:create",
        "emote:delete-own",
    ],
    viewer: [
        "chat:create",
        "chat:delete",
        "chat:message:own-update", // self message update
        "chat:view",
        "stream:view",
        "chat:own-upvote",
        "chat:own-downvote",
        "plan:view",
    ],
} as const;

export const userRoles = Object.keys(ROLES);

/**
 * Function to check user role permissions
 * @param user
 * @param permission
 * @returns
 */
function hasPermission(user: MiddlewareUserT, permission: Permission) {
    return (ROLES[user.role] as readonly Permission[]).includes(permission);
}

export { hasPermission };

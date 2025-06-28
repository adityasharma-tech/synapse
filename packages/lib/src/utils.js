"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRoles = void 0;
exports.hasPermission = hasPermission;
const ROLES = {
    admin: [
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
    ],
    streamer: [
        "chat:create",
        "chat:delete",
        "chat:message:own-update", // self message update
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
};
exports.userRoles = Object.keys(ROLES);
/**
 * Function to check user role permissions
 * @param user
 * @param permission
 * @returns
 */
function hasPermission(user, permission) {
    return ROLES[user.role].includes(permission);
}

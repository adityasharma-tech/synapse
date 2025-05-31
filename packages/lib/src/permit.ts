import * as t from "drizzle-orm";
import {
    type TargetT,
    type ResourceT,
    DrizzleClient,
    Permissions,
} from "@pkgs/drizzle-client";

export type ActionT =
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

interface HasPermissionPropT {
    target: `${TargetT}:${number | "*"}`;
    resource: `${ResourceT}:${number | "*"}`;
    action: ActionT;
}

const { db } = new DrizzleClient();

async function hasPermission({ target, resource, action }: HasPermissionPropT) {
    // check if TargetT already has the permission if not then check it with targetId
    // while checking for target if resource is stream:* check if target has all stream permission else for the specific resource id

    const targetName = target.split(":")[0] as TargetT;
    const targetId = target.split(":")[1] as `${number}` | "*";

    const resourceName = resource.split(":")[0] as ResourceT;
    const resourceId = resource.split(":")[1] as `${number}` | "*";

    const [results] = await db
        .select()
        .from(Permissions)
        .where(
            t.and(
                t.eq(Permissions.target, targetName),
                t.eq(
                    Permissions.targetId,
                    targetId == "*" ? 0 : Number(targetId)
                ),
                t.eq(Permissions.resource, resourceName),
                t.eq(
                    Permissions.resourceId,
                    resourceId == "*" ? 0 : Number(resourceId)
                ),
                t.eq(Permissions.action, action)
            )
        )
        .execute();

    console.log(`${target} ${resource} ${action}`);
    console.log(results);
}

export { hasPermission };

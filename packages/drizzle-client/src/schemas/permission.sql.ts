import * as t from "drizzle-orm/pg-core";
import { schema, timestamps } from "./helpers.sql";
import { userRolesEnum } from "./user.sql";

export const resourceEnum = schema.enum("resources", [
    "stream",
    "user",
    "chat",
    "order",
    "streamer-requests",
]);

export type ResourceT = (typeof resourceEnum.enumValues)[number];

export const effectEnum = schema.enum("effects", ["allow", "disallow"]);
export type EffectT = (typeof effectEnum.enumValues)[number];

export const targetEnum = schema.enum("targets", [
    ...userRolesEnum.enumValues,
    "user",
]);
export type TargetT = (typeof targetEnum.enumValues)[number];

const Permissions = schema.table(
    "permissions",
    {
        id: t.integer().primaryKey().generatedAlwaysAsIdentity(),
        target: targetEnum().notNull(),
        targetId: t.integer().notNull(),
        resource: resourceEnum().notNull(),
        resourceId: t.integer().notNull(),
        effect: effectEnum().default("allow"),
        action: t.varchar({ length: 255 }).notNull(),
        ...timestamps,
    },
    (table) => {
        return [
            t
                .uniqueIndex("wholeIndex")
                .on(
                    table.target,
                    table.targetId,
                    table.resource,
                    table.resourceId,
                    table.effect,
                    table.action
                ),
        ];
    }
);

export { Permissions };

import * as t from "drizzle-orm/pg-core";
import { schema, timestamps } from "./helpers.sql";
import { User } from "./user.sql";

export const resourceEnum = schema.enum("resources", [
    "stream",
    "user",
    "chat",
    "order",
]);

export const effectEnum = schema.enum("effects", ["allow", "disallow"]);

const Permissions = schema.table("permissions", {
    id: t.integer().primaryKey().generatedAlwaysAsIdentity(),
    user: t
        .integer()
        .references(() => User.id)
        .notNull(),
    resource: resourceEnum().notNull(),
    effect: effectEnum().default("allow"),
    actions: t.varchar({ length: 255 }).notNull(),
    ...timestamps,
});

export { Permissions };

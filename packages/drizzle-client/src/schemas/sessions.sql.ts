import * as t from "drizzle-orm/pg-core";
import { schema, timestamps } from "./helpers.sql";
import { User } from "./user.sql";
import { sql } from "drizzle-orm";

export const authMethod = schema.enum("auth_method", [
    "email-password",
    "sso/google",
    "sso/github",
]);

const Session = schema.table(
    "session",
    {
        sessionId: t
            .uuid()
            .default(sql`gen_random_uuid()`)
            .notNull(),
        userId: t
            .integer()
            .references(() => User.id)
            .notNull(),
        authMethod: authMethod().default("email-password").notNull(),
        lastActive: t.timestamp().defaultNow().notNull(),
        invalid: t.boolean().default(false).notNull(),
        token: t.varchar({ length: 255 }).notNull(),
        userAgent: t.varchar({ length: 255 }).notNull(),
        ipAddress: t.varchar({ length: 255 }),
        platform: t.varchar({ length: 255 }),
        languages: t.varchar({ length: 255 }).array().default([]).notNull(),
        mobile: t.boolean().default(false),
        expireAt: t.timestamp().notNull(),
        city: t.varchar(),
        region: t.varchar(),
        timezone: t.varchar(),
        telecom: t.varchar(),
        country: t.varchar(),
        os: t.varchar(),
        ...timestamps,
    },
    (table) => [t.uniqueIndex().onOnly(table.token)]
);

export { Session };

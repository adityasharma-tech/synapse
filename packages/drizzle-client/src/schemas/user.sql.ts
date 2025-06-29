import * as t from "drizzle-orm/pg-core";
import { schema, timestamps } from "./helpers.sql";
import { sql } from "drizzle-orm";

export const userRolesEnum = schema.enum("roles", [
    "streamer",
    "viewer",
    "admin",
]);

export type UserRole = (typeof userRolesEnum.enumValues)[number];

export const lastLoginMethod = schema.enum("last_login_method", [
    "email-password",
    "sso/google",
    "sso/github",
]);

const User = schema.table(
    "users",
    {
        id: t.integer().primaryKey().generatedAlwaysAsIdentity(),
        firstName: t.varchar({ length: 255 }).notNull(),
        lastName: t.varchar({ length: 255 }).notNull(),
        username: t.varchar({ length: 255 }).notNull().unique(),
        email: t.varchar().notNull().unique(),
        profilePicture: t.varchar(),
        phoneNumber: t.varchar({ length: 45 }).notNull(),
        passwordHash: t.varchar().notNull(),
        role: userRolesEnum().default("viewer"),
        emailVerified: t.boolean().default(false).notNull(),
        refrenceId: t.varchar(),
        watchHistory: t
            .integer()
            .array()
            .notNull()
            .default(sql`ARRAY[]::integer[]`),
        ...timestamps,
        lastLoginMethod: lastLoginMethod().default("email-password"),
    },
    (table) => [
        t.uniqueIndex("emailIdx").on(table.email),
        t.uniqueIndex("usernameIdx").on(table.username),
    ]
);

export type SafeUserType = {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    profilePicture: string;
    phoneNumber: string;
    role: UserRole;
    emailVerified: boolean;
};

export { User };

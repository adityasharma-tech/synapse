import * as t from "drizzle-orm/pg-core";
import { schema, timestamps } from "./helpers.sql";
import { sql } from "drizzle-orm";

export const userRolesEnum = schema.enum("roles", [
  "streamer",
  "viewer",
  "admin",
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
  },
  (table) => [
    t.uniqueIndex("emailIdx").on(table.email),
    t.uniqueIndex("usernameIdx").on(table.username),
  ]
);

export { User };

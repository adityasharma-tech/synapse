import * as t from "drizzle-orm/pg-core";
import { timestamps } from "./helpers.sql";

export const userRolesEnum = t.pgEnum("roles", ["streamer", "viewer"])

const User = t.pgTable('users', {
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
  refreshToken: t.varchar(),
  ...timestamps
})

export {
  User
}
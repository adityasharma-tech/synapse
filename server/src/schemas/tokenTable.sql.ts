import * as t from "drizzle-orm/pg-core";
import { timestamps } from "./helpers.sql";
import { User } from "./user.sql";

const TokenTable = t.pgTable('token_table', {
  id: t.integer().primaryKey().generatedAlwaysAsIdentity(),
  userId: t.integer().references(()=>User.id).notNull(),
  userRefreshToken: t.varchar(),
  streamingVerificationToken: t.varchar(),
  emailVerificationToken: t.varchar(),
  emailVerificationTokenExpiry: t.integer().default(60*60*24),
  ...timestamps
})

export {
  TokenTable
}
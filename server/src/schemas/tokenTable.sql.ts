import * as t from "drizzle-orm/pg-core";
import { timestamps } from "./helpers.sql";
import { User } from "./user.sql";

const TokenTable = t.pgTable('token_table', {
  id: t.integer().primaryKey().generatedAlwaysAsIdentity(),
  userId: t.integer().references(()=>User.id).notNull(),
  userRefreshToken: t.varchar(),
  streamingVerificationToken: t.varchar(),
  resetPasswordToken: t.varchar(),
  resetPasswordTokenExpiry: t.integer().default(Date.now()+ 60*60*5*1000),
  emailVerificationToken: t.varchar(),
  emailVerificationTokenExpiry: t.integer().default(Date.now()+60*60*24*1000),
  ...timestamps
})

export {
  TokenTable
}
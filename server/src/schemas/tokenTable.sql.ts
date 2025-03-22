import * as t from "drizzle-orm/pg-core";
import { timestamps } from "./helpers.sql";
import { User } from "./user.sql";

const TokenTable = t.pgTable("token_table", {
  id: t.integer().primaryKey().generatedAlwaysAsIdentity(),
  userId: t
    .integer()
    .references(() => User.id)
    .notNull(),
  userRefreshToken: t.varchar(),
  streamerVerificationToken: t.varchar(),
  resetPasswordToken: t.varchar(),
  resetPasswordTokenExpiry: t.timestamp().default(new Date()),
  emailVerificationToken: t.varchar(),
  emailVerificationTokenExpiry: t.timestamp().default(new Date()),
  ...timestamps,
});

export { TokenTable };

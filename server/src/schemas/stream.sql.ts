import * as t from "drizzle-orm/pg-core";
import { timestamps } from "./helpers.sql";
import { User } from "./user.sql";

const Stream = t.pgTable("streams", {
  id: t.integer().primaryKey().generatedAlwaysAsIdentity(),
  streamingUid: t.varchar().notNull(),
  streamTitle: t.varchar().notNull(),
  streamingToken: t.varchar().notNull(),
  streamerId: t
    .integer()
    .references(() => User.id)
    .notNull(),
  ...timestamps,
});

export { Stream };

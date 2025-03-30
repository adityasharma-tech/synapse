import * as t from "drizzle-orm/pg-core";
import { schema, timestamps } from "./helpers.sql";
import { User } from "./user.sql";

const Stream = schema.table("streams", {
  id: t.integer().primaryKey().generatedAlwaysAsIdentity(),
  streamingUid: t.varchar().notNull(),
  streamTitle: t.varchar().notNull(),
  streamingToken: t.varchar().notNull(),
  streamerId: t
    .integer()
    .references(() => User.id)
    .notNull(),
  ...timestamps,
}, (table)=>([
  t.uniqueIndex("streamingUidIdx").on(table.streamingUid)
]));

export { Stream };

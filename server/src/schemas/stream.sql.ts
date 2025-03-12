import * as t from "drizzle-orm/pg-core";
import { timestamps } from "./helpers.sql";

const Stream = t.pgTable('streams', {
  id: t.integer().primaryKey().generatedAlwaysAsIdentity(),
  streamTitle: t.varchar().notNull(),
  ...timestamps
})

export {
  Stream
}
import * as t from "drizzle-orm/pg-core";
import { timestamps } from "./helpers.sql";
import { User } from "./user.sql";
import { Order } from "./order.sql";

const ChatMessage = t.pgTable("chats", {
  id: t.integer().primaryKey().generatedAlwaysAsIdentity(),
  streamUid: t.varchar(),
  userId: t
    .integer()
    .references(() => User.id)
    .notNull(),
  cfOrderId: t.varchar(),
  message: t.varchar().notNull(),
  markRead: t.boolean().default(false).notNull(),
  upVotes: t
    .integer()
    .references(() => User.id)
    .array()
    .default([])
    .notNull(),
  downVotes: t
    .integer()
    .references(() => User.id)
    .array()
    .default([])
    .notNull(),
  pinned: t.boolean().default(false).notNull(),
  paymentStatus: t.varchar().default("IDLE").notNull(),
  ...timestamps,
});

export { ChatMessage };

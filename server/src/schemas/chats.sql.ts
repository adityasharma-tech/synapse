import * as t from "drizzle-orm/pg-core";
import { timestamps } from "./helpers.sql";
import { User } from "./user.sql";
import { Order } from "./order.sql";

const ChatMessage = t.pgTable('chats', {
  id: t.integer().primaryKey().generatedAlwaysAsIdentity(),
  streamUid: t.varchar(), 
  userId: t.integer().references(()=> User.id).notNull(),
  orderId: t.integer().references(()=>Order.id),
  message: t.varchar().notNull(),
  markRead: t.boolean().default(false).notNull(),
  upVotes: t.integer().references(()=>User.id).array().default([]).notNull(),
  downVotes: t.integer().references(()=>User.id).array().default([]).notNull(),
  pinned: t.boolean().default(false).notNull(),
  ...timestamps
})

export {
  ChatMessage
}
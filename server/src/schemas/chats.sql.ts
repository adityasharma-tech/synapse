import * as t from "drizzle-orm/pg-core";
import { timestamps } from "./helpers.sql";
import { User } from "./user.sql";
import { Order } from "./order.sql";
import { Stream } from "./stream.sql";

const ChatMessage = t.pgTable('chats', {
  id: t.integer().primaryKey().generatedAlwaysAsIdentity(),
  streamId: t.integer().references(()=>Stream.id), 
  userId: t.integer().references(()=> User.id),
  orderId: t.integer().references(()=>Order.id),
  message: t.varchar(),
  ...timestamps
})

export {
  ChatMessage
}
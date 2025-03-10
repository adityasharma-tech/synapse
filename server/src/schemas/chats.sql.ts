import * as t from "drizzle-orm/pg-core";
import { timestamps } from "./helpers.sql";
import { User } from "./user.sql";
import { Order } from "./order.sql";

const ChatMessage = t.pgTable('chats', {
  id: t.integer().primaryKey().generatedAlwaysAsIdentity(),
  userId: t.integer().references(()=> User.id),
  orderId: t.integer().references(()=>Order.id),
  message: t.varchar(),
  ...timestamps
})

export {
  ChatMessage
}
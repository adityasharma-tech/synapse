import * as t from "drizzle-orm/pg-core";
import { timestamps } from "./helpers.sql";
import { User } from "./user.sql";

// ```typescript
// interface PaymentOrder {
//   id: string; // order id
//   paymentSessionId: string;
//   orderStatus: string;
//   cfOrderId: string;
//   userId: string;
//   orderAmount: string;
//   orderCurrency: string;
//   orderExpiryTime: string;
//   orderNote?: string; // may be user message
//   createdAt: Date;
//   updatedAt: Date;
// }
// ```

const Order = t.pgTable("orders", {
  id: t.integer().primaryKey().generatedAlwaysAsIdentity(),
  paymentSessionId: t.varchar(),
  orderStatus: t.varchar().notNull().default("PENDING"),
  cfOrderId: t.varchar().notNull(),
  userId: t
    .integer()
    .references(() => User.id)
    .notNull(),
  orderAmount: t.varchar({ length: 255 }).notNull(),
  orderCurrency: t.varchar({ length: 255 }).notNull().default("INR"),
  orderExpiryTime: t.varchar().notNull(),
  orderNote: t.varchar(),
  ...timestamps,
});

export { Order };

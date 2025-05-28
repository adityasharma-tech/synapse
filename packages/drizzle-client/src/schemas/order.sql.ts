import * as t from "drizzle-orm/pg-core";
import { schema, timestamps } from "./helpers.sql";
import { User } from "./user.sql";

const Order = schema.table(
    "orders",
    {
        id: t.integer().primaryKey().generatedAlwaysAsIdentity(),
        paymentSessionId: t.varchar(),
        orderStatus: t.varchar().notNull().default("PENDING"),
        cfOrderId: t.varchar().notNull(),
        userId: t
            .integer()
            .references(() => User.id)
            .notNull(),
        orderAmount: t.integer().notNull(),
        orderCurrency: t.varchar({ length: 255 }).notNull().default("INR"),
        orderExpiryTime: t.varchar().notNull(),
        orderNote: t.varchar(),
        ...timestamps,
    },
    (table) => [t.index("cfOrderIdIdx").on(table.cfOrderId)]
);

export { Order };

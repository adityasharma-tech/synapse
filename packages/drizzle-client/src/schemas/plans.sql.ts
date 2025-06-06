import * as t from "drizzle-orm/pg-core";
import { schema, timestamps } from "./helpers.sql";
import { User } from "./user.sql";

const Plans = schema.table("plans", {
    id: t.integer().primaryKey().generatedAlwaysAsIdentity(),
    name: t.varchar({ length: 255 }).notNull(),
    details: t.varchar().notNull(),
    amount: t.integer().notNull(),
    razorpayPlanId: t.varchar({ length: 255 }).default("").notNull().unique(),
    streamerId: t
        .integer()
        .references(() => User.id)
        .notNull()
        .unique(),
    ...timestamps,
});

export { Plans };

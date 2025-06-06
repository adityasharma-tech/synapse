import * as t from "drizzle-orm/pg-core";
import { schema, timestamps } from "./helpers.sql";
import { Plans } from "./plans.sql";
import { User } from "./user.sql";

const subStatus = schema.enum("subsStatusEnum", [
    "created",
    "authenticated",
    "active",
    "pending",
    "halted",
    "cancelled",
    "completed",
    "expired",
]);

const Subsciptions = schema.table(
    "subscriptions",
    {
        id: t.integer().primaryKey().generatedAlwaysAsIdentity(),
        planId: t
            .integer()
            .references(() => Plans.id)
            .notNull(),
        status: subStatus().notNull(),
        razorpaySubscriptionId: t.varchar({ length: 255 }).notNull().unique(),
        paymentUrl: t.varchar().notNull(),
        userId: t
            .integer()
            .references(() => User.id)
            .notNull(),
        ...timestamps,
    },
    (table) => [
        t.index("planIdIndex").on(table.planId),
        t.index("userIdIndex").on(table.userId),
    ]
);

export { Subsciptions };

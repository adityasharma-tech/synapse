import * as t from "drizzle-orm/pg-core";
import { User } from "./user.sql";
import { schema, timestamps } from "./helpers.sql";

export const paymentStatusEnum = schema.enum("payment_status_enum", [
    "idle",
    "created",
    "attempted",
    "paid",
]);

export type PaymentStatusT = (typeof paymentStatusEnum.enumValues)[number];

const ChatMessage = schema.table(
    "chats",
    {
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
        replyToId: t.integer(),
        pinned: t.boolean().default(false).notNull(),
        paymentStatus: paymentStatusEnum().default("idle").notNull(),
        ...timestamps,
    },
    (table) => [t.index("streamUidIdx").on(table.streamUid)]
);

export { ChatMessage };

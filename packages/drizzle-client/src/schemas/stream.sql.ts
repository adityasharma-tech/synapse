import * as t from "drizzle-orm/pg-core";
import { schema, timestamps } from "./helpers.sql";
import { User } from "./user.sql";

const Stream = schema.table(
    "streams",
    {
        id: t.integer().primaryKey().generatedAlwaysAsIdentity(),
        streamingUid: t.varchar().notNull(),
        streamTitle: t.varchar().notNull(),
        chatSlowMode: t.boolean().default(false),
        about: t.varchar().default(""),
        videoUrl: t.varchar(),
        streamerId: t
            .integer()
            .references(() => User.id)
            .notNull(),
        thumbnailUrl: t.varchar().notNull(),
        scheduledTime: t.timestamp(),
        isScheduled: t.boolean().default(false),
        endTime: t.timestamp(),
        ...timestamps,
    },
    (table) => [t.uniqueIndex("streamingUidIdx").on(table.streamingUid)]
);

export { Stream };

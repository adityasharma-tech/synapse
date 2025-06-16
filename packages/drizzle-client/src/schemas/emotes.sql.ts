import * as t from "drizzle-orm/pg-core";
import { timestamps, schema } from "./helpers.sql";
import { User } from "./user.sql";

const Emote = schema.table(
    "emotes",
    {
        id: t.integer().primaryKey().generatedAlwaysAsIdentity(),
        name: t.varchar({ length: 255 }).notNull(),
        code: t.varchar({ length: 255 }).unique().notNull(),
        imageUrl: t.varchar({ length: 255 }).notNull(),
        streamerId: t
            .integer()
            .references(() => User.id)
            .notNull(),
        ...timestamps,
    },
    (table) => [
        t.uniqueIndex("codeIndex").onOnly(table.code),
        t.index("userIndex").onOnly(table.streamerId),
    ]
);

export { Emote };

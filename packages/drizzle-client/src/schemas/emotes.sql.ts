import * as t from "drizzle-orm/pg-core";
import { timestamps, schema } from "./helpers.sql";

const Emote = schema.table(
    "emotes",
    {
        id: t.integer().primaryKey().generatedAlwaysAsIdentity(),
        name: t.varchar({ length: 255 }).notNull(),
        code: t.varchar({ length: 255 }).unique().notNull(),
        imageUrl: t.varchar({ length: 255 }).notNull(),
        ...timestamps,
    },
    (table) => [t.uniqueIndex("codeIndex").on(table.code)]
);

export { Emote };

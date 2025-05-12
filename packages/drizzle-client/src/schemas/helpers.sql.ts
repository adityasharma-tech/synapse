import { pgSchema, timestamp } from "drizzle-orm/pg-core";

const schema = pgSchema("upgrade");

const timestamps = {
    updatedAt: timestamp().$onUpdate(() => new Date()),
    createdAt: timestamp().defaultNow().notNull(),
};

export { timestamps, schema };

import { pgSchema, timestamp } from "drizzle-orm/pg-core";

const schema = pgSchema("upgrade");

const timestamps = {
  updatedAt: timestamp(),
  createdAt: timestamp().defaultNow().notNull(),
};

export { timestamps, schema };

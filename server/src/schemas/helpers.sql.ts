import { timestamp } from "drizzle-orm/pg-core";

const timestamps = {
  updatedAt: timestamp(),
  createdAt: timestamp().defaultNow().notNull(),
};

export { timestamps };

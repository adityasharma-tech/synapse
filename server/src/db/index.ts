import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

// Not exactly establish a connection to db
// but give the instance of the database using drizzle-kit
export default function establishDbConnection() {
  const pool = new Pool({
    host: process.env.DB_HOST!,
    port: +process.env.DB_PORT!,
    database: process.env.DB_NAME!,
    user: process.env.DB_USER!,
    password: process.env.DB_PASSWORD!,
    ssl: { ca: process.env.DB_SSL_CA!, rejectUnauthorized: true },
  });

  // Using casing: 'snake_case', setting this will convert all my camelCase keys to snake_case
  // So, I will use the camelCase but in the database it will be snake_case
  const db = drizzle({ client: pool, casing: "snake_case" });
  return db;
}

import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

export default function establishDbConnection() {
  const pool = new Pool({
    host: process.env.DB_HOST!,
    port: +process.env.DB_PORT!,
    database: process.env.DB_NAME!,
    user: process.env.DB_USER!,
    password: process.env.DB_PASSWORD!,
    ssl: { ca: process.env.DB_SSL_CA!, rejectUnauthorized: true },
  });
  const db = drizzle({ client: pool, casing: "snake_case" });
  return db;
}

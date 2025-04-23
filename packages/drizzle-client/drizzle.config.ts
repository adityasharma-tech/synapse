import { defineConfig } from "drizzle-kit";
import dotenv from "dotenv";
dotenv.config();

export default defineConfig({
  out: "./drizzle",
  schema: "./src/schemas/index",
  dialect: "postgresql",
  dbCredentials: {
    host: process.env.DB_HOST!,
    port: +process.env.DB_PORT!,
    database: process.env.DB_NAME!,
    password: process.env.DB_PASSWORD!,
    user: process.env.DB_USER!,
    ssl: { ca: process.env.DB_SSL_CA!, rejectUnauthorized: false },
  },
  casing: "snake_case",
});

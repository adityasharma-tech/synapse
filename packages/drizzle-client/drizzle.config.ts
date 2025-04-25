import { defineConfig } from "drizzle-kit";
import { env } from "@pkgs/zod-client";

export default defineConfig({
    out: "./drizzle",
    schema: "./src/schemas/index",
    dialect: "postgresql",
    dbCredentials: {
        host: env.DB_HOST,
        port: env.DB_PORT,
        database: env.DB_NAME,
        password: env.DB_PASSWORD,
        user: env.DB_USER,
        ssl: { ca: env.DB_SSL_CA, rejectUnauthorized: false },
    },
    casing: "snake_case",
});

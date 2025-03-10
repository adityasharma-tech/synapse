import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  out: './drizzle',
  schema: './src/schemas/',
  dialect: 'postgresql',
  dbCredentials: {
    host: process.env.DB_HOST!,
    port: +process.env.DB_PORT!,
    database: process.env.DB_NAME!,
    password: process.env.DB_PASSWORD!,
    ssl: {
      ca: process.env.DB_SSL_CA!,
      rejectUnauthorized: true
    }
  },
});

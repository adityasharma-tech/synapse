import { logger } from "../lib/configs";
import { drizzle } from 'drizzle-orm/node-postgres';

export default async function connectToPostgres() {
  try {
    const db = drizzle(process.env.DATABASE_URL!, {
      casing: "snake_case"
    }); 
    return db
  } catch (error: any) {
    logger.error(
      `Some error during connecting to postgres database: ${error.message}`
    );
    process.exit(1);
  }
}

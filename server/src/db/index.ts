import { logger } from "../lib/configs";

export default async function connectToPostgres() {
  try {
      
  } catch (error: any) {
    logger.error(
      `Some error during connecting to mongodb database: ${error.message}`
    );
    process.exit(1);
  }
}

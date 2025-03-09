import server from "./src/app";
import { config } from "dotenv";
import { logger } from "./src/lib/configs";
import connectToPostgres from "./src/db";

config({ path: "./.env", debug: true, encoding: "UTF-8" });

const PORT = process.env.PORT || 5174;

/**
 * Connect to pg db database.
 */
(async ()=>await connectToPostgres())();

/**
 * start server
 */
server.listen(PORT, () => {
  logger.info(`Server is running on port http://localhost:${PORT}`);
});
import server from "./src/app";
import { config } from "dotenv";
import { logger } from "./src/lib/logger";

config({ path: "./.env", debug: true, encoding: "UTF-8" });

const PORT = process.env.PORT || 5174;

/**
 * start server
 */
server.listen(PORT, () => {
  logger.info(`Server is running on port http://localhost:${PORT}`);
});
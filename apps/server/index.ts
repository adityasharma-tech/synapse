import server from "./src/app";
import { logger } from "./src/lib/logger";
import { env } from "zod-client"

const PORT = env.PORT || 5174;

/**
 * start server
 */
server.listen(PORT, () => {
  logger.info(`Server is running on port http://localhost:${PORT}`);
});

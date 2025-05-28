import server from "./src/app";
import { env } from "@pkgs/zod-client";
import { logger } from "@pkgs/lib";

const PORT = env.PORT || 5174;

/**
 * start server
 */
server.listen(PORT, () => {
    logger.info(`Server is running on port http://localhost:${PORT}`);
});

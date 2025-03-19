import { createClient as createRedisClient } from "redis";
import { logger } from "../lib/logger";

const redisClient = createRedisClient({
  password: process.env.REDIS_PASSWORD,
  socket: {
    host: process.env.REDIS_HOST,
    port: 16399,
    rejectUnauthorized: false,
  },
});

redisClient.on("error", (err) => {
  logger.error(`Redis Client Error: ${err.message}`);
  process.exit(1);
});

export { redisClient };

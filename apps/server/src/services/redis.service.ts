import { env } from "@pkgs/zod-client";
import { createClient as createRedisClient } from "redis";

const redisClient = createRedisClient({
  url: env.REDIS_CONNECT_URI,
  pingInterval: 3000,
});

redisClient.on("error", (err) => {
  console.error(`Redis Client Error: ${err.message}\n`, err);
  process.exit(1);
});

export { redisClient };

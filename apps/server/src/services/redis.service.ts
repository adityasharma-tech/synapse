import { createClient as createRedisClient } from "redis";
import "dotenv/config";
import { serverEnv } from "zod-client";

const redisClient = createRedisClient({
  url: serverEnv.REDIS_CONNECT_URI,
  pingInterval: 3000,
});

redisClient.on("error", (err) => {
  console.error(`Redis Client Error: ${err.message}\n`, err);
  process.exit(1);
});

export { redisClient };

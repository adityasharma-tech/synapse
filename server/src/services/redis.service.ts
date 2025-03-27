import { createClient as createRedisClient } from "redis";
import "dotenv/config";

const redisClient = createRedisClient({
  url: process.env.REDIS_CONNECT_URI!,
  pingInterval: 3000,
});

redisClient.on("error", (err) => {
  console.error(`Redis Client Error: ${err.message}\n`, err);
  process.exit(1);
});

export { redisClient };

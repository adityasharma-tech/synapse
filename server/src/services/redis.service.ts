import { createClient as createRedisClient } from "redis";


const redisClient = createRedisClient({
  url: process.env.REDIS_CONNECT_URI!,
  username: "default"
});

redisClient.on("error", (err) => {
  console.error(`Redis Client Error: ${err.message}\n`, err);
  process.exit(1);
});

export { redisClient };

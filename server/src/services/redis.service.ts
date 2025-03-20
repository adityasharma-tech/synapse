import { createClient as createRedisClient } from "redis";


const redisClient = createRedisClient({
  password: process.env.REDIS_PASSWORD,
  socket: {
    host: process.env.REDIS_HOST!,
    port: parseInt(process.env.REDIS_PORT ?? "6379"),
    rejectUnauthorized: false,
  },
  username: "default"
});

redisClient.on("error", (err) => {
  console.error(`Redis Client Error: ${err.message}\n`, err);
  process.exit(1);
});

export { redisClient };

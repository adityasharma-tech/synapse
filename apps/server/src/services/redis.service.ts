import { env } from "@pkgs/zod-client";
import { createClient, RESP_TYPES } from "@redis/client";

const redisClient = createClient({
    url: env.REDIS_CONNECT_URI,
    socket: {
        keepAlive: true,
    },
    pingInterval: 1000,
});

redisClient.on("error", (err) => {
    console.error(`Redis Client Error: ${err.message}\n`, err);
    process.exit(1);
});

(async () => {
    await redisClient.connect();

    process.on("exit", async () => {
        await redisClient.disconnect();
    });
})();

export { redisClient };

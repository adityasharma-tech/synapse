// const wsUrl = "ws://localhost:5174/socket.io/";

// let connectionStartTime: number | null = null;
// let connectionInterval: NodeJS.Timeout | null = null;

// const socket = new WebSocket(wsUrl);

// socket.onopen = () => {
//     connectionStartTime = Date.now();
//     console.log(
//         `[CONNECTED] WebSocket connection established at ${new Date(connectionStartTime).toLocaleTimeString()}`
//     );

//     connectionInterval = setInterval(() => {
//         if (connectionStartTime) {
//             const duration = Math.floor(
//                 (Date.now() - connectionStartTime) / 1000
//             );
//             console.log(`[STATUS] Connected for ${duration} seconds`);
//         }
//     }, 1000);
// };

// socket.onclose = () => {
//     if (connectionInterval) clearInterval(connectionInterval);
//     if (connectionStartTime) {
//         const totalDuration = Math.floor(
//             (Date.now() - connectionStartTime) / 1000
//         );
//         console.log(
//             `[DISCONNECTED] Total connection duration: ${totalDuration} seconds`
//         );
//     } else {
//         console.log(`[DISCONNECTED] Connection was not established`);
//     }
// };

// socket.onerror = (err) => {
//     console.error("[ERROR] WebSocket encountered an error:", err);
// };

// test 2

import { config } from "dotenv";
config({
    path: "./.env",
    debug: true,
});

import { env } from "@pkgs/zod-client";
import { createClient, RESP_TYPES } from "@redis/client";
import msgpack from "msgpack-lite";

const redisClient = createClient({
    url: env.REDIS_CONNECT_URI,
    socket: {
        keepAlive: true,
    },
    pingInterval: 1000,
});
const str = "some string";

(async () => {
    await redisClient.connect();

    await redisClient.hSet(
        "test",
        "1",
        msgpack.encode("message").toString("binary")
    );

    const result2 = await redisClient.hGet("test", "1");
    console.log(
        "result2",
        msgpack.decode(Buffer.from(result2 ?? "", "binary"))
    );

    await redisClient.disconnect();
})();

// test 3*

// const KV = {
//     stringify(data: Record<string, string | number | boolean | Buffer>): string {
//         const entries = Object.entries(data);
//         const result: string[] = new Array(entries.length);

//         for (let i = 0; i < entries.length; i++) {
//             const [key, value] = entries[i];
//             result[i] = `${key}>${value}`;
//         }

//         return result.join("&") + (result.length > 0 ? "&" : "");
//     },

//     jsonify(input: string): Record<string, string | number | boolean | Buffer> {
//         const result: Record<string, string | number | boolean> = {};

//         const pairs = input.split("&").filter(Boolean);
//         for (const pair of pairs) {
//             const [key, val] = pair.split(">");
//             if (!key || val === undefined) continue;

//             if (val === "true") {
//                 result[key] = true;
//             } else if (val === "false") {
//                 result[key] = false;
//             } else if (!isNaN(Number(val))) {
//                 result[key] = Number(val);
//             } else {
//                 result[key] = val;
//             }
//         }

//         return result;
//     },
// };

// console.log(KV.stringify({ key: "value1;;", key2: 1 }))

// test 4

// import msgpack from "msgpack-lite"

// // encode from JS Object to MessagePack (Buffer)
// let buffer = msgpack.encode({"foo": "bar"});

// console.log('buffer', buffer)
// console.log('string', buffer.toString('base64'));

// // decode from MessagePack (Buffer) to JS Object
// var data = msgpack.decode(Buffer.from(buffer.toString('base64'), "base64")); // => {"foo": "bar"}
// console.log(data);

// if encode/decode receives an invalid argument an error is thrown

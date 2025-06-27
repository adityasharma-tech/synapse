import { env } from "@pkgs/zod-client";
import { socketEvent } from "../shared";

const corsOrigins = [
    env.FRONTEND_URL,
    "https://synapse-local.adityasharma.live",
    "https://localport-3000.adityasharma.live",
    "https://alishanshowroom.vercel.app",
];

// RabbitMQ Channels
const RMQ_PAYOUT_QUEUE = "payout_queue";
const RMQ_MAIL_QUEUE = "mail_queue";

export { corsOrigins, RMQ_PAYOUT_QUEUE, RMQ_MAIL_QUEUE, socketEvent };

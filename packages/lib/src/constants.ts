import { env } from "@pkgs/zod-client";
import { socketEvent } from "../shared";
import { logger } from "./logger";

const corsOrigins = env.CORS_URLS.split(",");

logger.info("Allowed cors origins: " + JSON.stringify(corsOrigins));

// RabbitMQ Channels
const RMQ_PAYOUT_QUEUE = "payout_queue";
const RMQ_MAIL_QUEUE = "mail_queue";

export { corsOrigins, RMQ_PAYOUT_QUEUE, RMQ_MAIL_QUEUE, socketEvent };

import { socketEvent } from "../shared";
declare const corsOrigins: string[];
declare const RMQ_PAYOUT_QUEUE = "payout_queue";
declare const RMQ_MAIL_QUEUE = "mail_queue";
export { corsOrigins, RMQ_PAYOUT_QUEUE, RMQ_MAIL_QUEUE, socketEvent };

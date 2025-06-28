"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.socketEvent =
    exports.RMQ_MAIL_QUEUE =
    exports.RMQ_PAYOUT_QUEUE =
    exports.corsOrigins =
        void 0;
const zod_client_1 = require("@pkgs/zod-client");
const shared_1 = require("../shared");
Object.defineProperty(exports, "socketEvent", {
    enumerable: true,
    get: function () {
        return shared_1.socketEvent;
    },
});
const corsOrigins = [
    zod_client_1.env.FRONTEND_URL,
    "https://synapse-local.adityasharma.live",
    "https://localport-3000.adityasharma.live",
    "https://alishanshowroom.vercel.app",
];
exports.corsOrigins = corsOrigins;
// RabbitMQ Channels
const RMQ_PAYOUT_QUEUE = "payout_queue";
exports.RMQ_PAYOUT_QUEUE = RMQ_PAYOUT_QUEUE;
const RMQ_MAIL_QUEUE = "mail_queue";
exports.RMQ_MAIL_QUEUE = RMQ_MAIL_QUEUE;

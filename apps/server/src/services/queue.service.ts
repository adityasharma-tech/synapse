import amqplib from "amqplib";

import { env } from "@pkgs/zod-client";
import { RMQ_PAYOUT_QUEUE } from "@pkgs/lib";

/**
 * TODO: Work still left in queuing system
 */

let connection: amqplib.ChannelModel;
let payoutChannel: amqplib.Channel;

async function initRmq() {
  try {
    if (!connection) connection = await amqplib.connect(env.RABBITMQ_URI!);
  } catch (error: any) {
    console.error(`Failed to connect to rabbitmq server: ${error.message}`);
    process.exit(1);
  }
}

async function getPayoutChannel() {
  await initRmq();

  if (!payoutChannel) payoutChannel = await connection.createChannel();

  payoutChannel.assertQueue(RMQ_PAYOUT_QUEUE, { durable: true });

  return payoutChannel;
}

export { getPayoutChannel };

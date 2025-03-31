import type { RabbitMq } from "../rmq";
import type { ConsumeMessage } from "amqplib";
import { PAYOUT_WORKER_QUEUE, DEFAULT_CHANNEL } from "../lib/constants";
import { getRazorpayInstance } from "../lib/utils";

const razorpayInstance = getRazorpayInstance();

async function payoutWorker(rmq: RabbitMq) {
  if (!rmq.channel) throw new Error("Rabbit MQ not connected yet!");

  await rmq.loadChannel(DEFAULT_CHANNEL, {
    durable: true,
  });

  console.log(`Payout worker is running...`);

  rmq.channel.consume(PAYOUT_WORKER_QUEUE, payoutWorkerHandler);
}

async function payoutWorkerHandler(msg: ConsumeMessage | null) {
  if (!msg) return;

  console.log(`Payload worker message: ${JSON.stringify(msg)}`);

  const payload = JSON.parse(msg.content.toString()) as {
    orderId: string;
  };

  const orderId = payload.orderId;

  if (!orderId) return console.error(`Failed to get OrderID: ${orderId}`);

  try {
    const order = await razorpayInstance.orders.fetch(orderId);

    await razorpayInstance.transfers.create({
      account: "1",
      amount: 1,
      currency: "INR",
      notes: {
        orderId: order.id
      },
    });
  } catch (error: any) {
    console.error(`Failed to get message: ${error.message}`);
  }
}

export default payoutWorker;

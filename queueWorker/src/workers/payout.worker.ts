import type { RabbitMq } from "../rmq"
import type { ConsumeMessage } from "amqplib";
import { PAYOUT_WORKER_QUEUE, DEFAULT_CHANNEL } from "../lib/constants";

async function payoutWorker(rmq: RabbitMq){
    if(!rmq.channel) throw new Error("Rabbit MQ not connected yet!");
    
    await rmq.loadChannel(DEFAULT_CHANNEL, {
        durable: true
    })

    console.log(`Payout worker is running...`);

    rmq.channel.consume(PAYOUT_WORKER_QUEUE, payoutWorkerHandler)
}

function payoutWorkerHandler(msg: ConsumeMessage | null){
    if(!msg) return;

    
}

export default payoutWorker
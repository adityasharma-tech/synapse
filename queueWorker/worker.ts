import 'dotenv/config'
import { RabbitMq } from "./src/rmq";
import payoutWorker from "./src/workers/payout.worker";

async function worker() {
    const rmq = new RabbitMq();

    await rmq.connectRmq().then(()=>{
        console.log("Rabbit mq connected succesfully.");
    })
    if(!rmq.channel) throw new Error("Failed to connect to rabbit mq server");

    // Promise.all([payoutWorker.call(null, rmq)])
    await payoutWorker(rmq);
}

worker()
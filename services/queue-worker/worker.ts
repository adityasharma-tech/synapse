import amqp from "amqplib";
import { env } from "@pkgs/zod-client";
import { RMQ_MAIL_QUEUE } from "@pkgs/lib";

(async () => {
    const connection = await amqp.connect(
        env.RABBITMQ_URI ?? "amqp://localhost"
    );
    const channel = await connection.createChannel();
    await channel.assertQueue(RMQ_MAIL_QUEUE, {
        durable: true,
    });

    await channel.consume(
        RMQ_MAIL_QUEUE,
        (msg) => {
            if (!msg) return;
            const data = JSON.parse(msg.content.toString());
        },
        { noAck: true }
    );
})();

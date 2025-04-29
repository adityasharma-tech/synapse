import amqp from "amqplib";
import { env } from "@pkgs/zod-client";
import { logger, RMQ_MAIL_QUEUE, rmqMailServiceType } from "@pkgs/lib";
import { sendConfirmationMail, sendResetPasswordMail } from "./mail.service";

(async () => {
    const connection = await amqp.connect(
        env.RABBITMQ_URI ?? "amqp://rabbitmq"
    );
    const channel = await connection.createChannel();
    await channel.assertQueue(RMQ_MAIL_QUEUE, {
        durable: true,
    });

    await channel.consume(
        RMQ_MAIL_QUEUE,
        (msg) => {
            if (!msg) return;
            const data = JSON.parse(msg.content.toString()) as {
                email: string;
                token: string;
                type: rmqMailServiceType;
            };

            switch (data.type) {
                case "confirmation":
                    sendConfirmationMail(data.email, data.token);
                case "reset_password":
                    sendResetPasswordMail(data.email, data.token);
                default:
                    logger.warn("No such type exits for mail queue.");
            }
        },
        { noAck: true }
    );
})();

import { RMQClient } from "@pkgs/rmq-client";
import { logger, RMQ_MAIL_QUEUE, rmqMailServiceType } from "@pkgs/lib";
import { sendConfirmationMail, sendResetPasswordMail } from "./mail.service";

(async () => {
    const client = new RMQClient();
    await client.assertQueue(RMQ_MAIL_QUEUE);
    const channel = await client.getChannel();

    await channel.consume(
        RMQ_MAIL_QUEUE,
        (msg) => {
            if (!msg) return;
            const data = JSON.parse(msg.content.toString()) as {
                email: string;
                token: string;
                type: rmqMailServiceType;
            };

            console.log(data);

            switch (data.type) {
                case "confirmation":
                    sendConfirmationMail(data.email, data.token);
                    break;
                case "reset_password":
                    sendResetPasswordMail(data.email, data.token);
                    break;
                default:
                    logger.warn("No such type exits for mail queue.");
                    break;
            }
        },
        { noAck: true }
    );
})();

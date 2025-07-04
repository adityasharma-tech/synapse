import { RMQClient } from "@pkgs/rmq-client";
import { logger, RMQ_MAIL_QUEUE, rmqMailServiceType } from "@pkgs/lib";
import {
    applicationAcceptedEmail,
    applicationRejectedEmail,
    gotStreamerApplicationEmail,
    sendConfirmationMail,
    sendResetPasswordMail,
    sendWelcomeEmail,
    streamerStartStreamingEmail,
} from "./mail.service";

(async () => {
    const client = new RMQClient();
    const channel = await client.getChannel();

    channel.assertExchange(RMQ_MAIL_QUEUE, "fanout", {
        durable: true,
    });
    const queue = await channel.assertQueue("", {
        exclusive: true,
    });
    await channel.bindQueue(queue.queue, RMQ_MAIL_QUEUE, "");

    await channel.consume(
        queue.queue,
        async (msg) => {
            if (!msg) return;
            const data = JSON.parse(msg.content.toString()) as {
                email: string;
                name: string;
                token: string;
                streamerName?: string;
                streamingLink?: string;
                type: rmqMailServiceType;
            };

            console.log(data);

            switch (data.type) {
                case "confirmation":
                    await sendConfirmationMail(data.email, data.token);
                    break;
                case "reset_password":
                    await sendResetPasswordMail(data.email, data.token);
                    break;
                case "recieve_streamer_application":
                    await gotStreamerApplicationEmail({
                        email: data.email,
                        name: data.name,
                    });
                    break;

                case "welcome_email":
                    await sendWelcomeEmail({
                        name: data.name,
                        email: data.email,
                    });
                    break;
                case "streamer_application_accepted":
                    await applicationAcceptedEmail({
                        email: data.email,
                        name: data.name,
                    });
                    break;
                case "streamer_application_rejected":
                    await applicationRejectedEmail({
                        email: data.email,
                        name: data.name,
                    });
                    break;
                case "subs_start_streaming":
                    await streamerStartStreamingEmail({
                        email: data.email,
                        name: data.name,
                        streamerName: data.streamerName!,
                        streamingLink: data.streamingLink!,
                    });
                    break;
                default:
                    logger.warn("No such type exits for mail queue.");
                    break;
            }
        },
        { noAck: true }
    );
})();

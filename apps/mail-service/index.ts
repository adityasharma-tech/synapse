import * as grpc from "@grpc/grpc-js";
import { env } from "@pkgs/zod-client";
import { RMQClient } from "@pkgs/rmq-client";
import {
    DefaultMailRequest,
    DefaultMailResponse,
    MailService,
} from "@pkgs/lib/proto";
import { logger, RMQ_MAIL_QUEUE, rmqMailServiceType } from "@pkgs/lib";

const server = new grpc.Server();
const rmqClient = new RMQClient();

(async () => {
    await rmqClient.assertQueue(RMQ_MAIL_QUEUE);
    logger.info("I am here");
})();

server.addService(MailService, {
    SendSignupConfirmMail: SendSignupConfirmMail,
    SendResetPasswordMail: SendResetPasswordMail,
});

server.bindAsync(
    env.MAIL_GRPC_ADDRESS,
    grpc.ServerCredentials.createInsecure(),
    (error, port) => {
        if (error) logger.error(error.message);
        else logger.info(`Mail service is running on ${port}`);
    }
);

async function SendSignupConfirmMail(
    call: grpc.ServerUnaryCall<DefaultMailRequest, DefaultMailResponse>,
    callback: grpc.sendUnaryData<DefaultMailResponse>
) {
    const channel = await rmqClient.getChannel();
    channel.sendToQueue(
        RMQ_MAIL_QUEUE,
        Buffer.from(
            JSON.stringify({ ...call.request, type: "confirmation" } as {
                email: string;
                token: string;
                type: rmqMailServiceType;
            })
        )
    );

    callback(null, {
        success: true,
        error: "",
    });
}
async function SendResetPasswordMail(
    call: grpc.ServerUnaryCall<DefaultMailRequest, DefaultMailResponse>,
    callback: grpc.sendUnaryData<DefaultMailResponse>
) {
    const channel = await rmqClient.getChannel();
    channel.sendToQueue(
        RMQ_MAIL_QUEUE,
        Buffer.from(
            JSON.stringify({ ...call.request, type: "confirmation" } as {
                email: string;
                token: string;
                type: rmqMailServiceType;
            })
        )
    );

    callback(null, {
        success: true,
        error: "",
    });
}

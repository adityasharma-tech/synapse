import * as grpc from "@grpc/grpc-js";
import { env } from "@pkgs/zod-client";
import { RMQClient } from "@pkgs/rmq-client";
import { mailPkg } from "@pkgs/lib/proto";
import { RMQ_MAIL_QUEUE, rmqMailServiceType } from "@pkgs/lib";

const server = new grpc.Server();
const rmqClient = new RMQClient();

(async () => {
    await rmqClient.assertQueue(RMQ_MAIL_QUEUE);
})();

server.bind(env.MAIL_GRPC_ADDRESS, grpc.ServerCredentials.createInsecure());

server.addService((mailPkg as any).MailService.service, {
    SendSignupConfirmMail: SendSignupConfirmMail,
    SendResetPasswordMail: SendResetPasswordMail,
});

server.start();

async function SendSignupConfirmMail(
    call: grpc.ServerUnaryCall<any, any>,
    callback: grpc.requestCallback<any>
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
    call: any,
    callback: grpc.requestCallback<any>
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

import * as grpc from "@grpc/grpc-js";
import { env } from "@pkgs/zod-client";
import { mailPkg } from "@pkgs/lib/proto";

const server = new grpc.Server();

server.bind(env.MAIL_GRPC_ADDRESS, grpc.ServerCredentials.createInsecure());

server.addService((mailPkg as any).MailService.service, {
    SendSignupConfirmMail: SendSignupConfirmMail,
    SendResetPasswordMail: SendResetPasswordMail,
});

function SendSignupConfirmMail(
    call: grpc.ServerUnaryCall<any, any>,
    callback: grpc.requestCallback<any>
) {
    const data = call.request;

    callback(null, {
        success: true,
        error: "",
    });
}
function SendResetPasswordMail(
    call: any,
    callback: grpc.requestCallback<any>
) {}

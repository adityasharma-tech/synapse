import * as grpc from "@grpc/grpc-js";
import { env } from "@pkgs/zod-client";
import {
    HasPermissionRequest,
    HasPermissionResponse,
    PermitService,
} from "@pkgs/lib/proto";
import { logger } from "@pkgs/lib";
import { DrizzleClient } from "@pkgs/drizzle-client";

const server = new grpc.Server();
const { db } = new DrizzleClient();

server.addService(PermitService, {
    HasPermission,
    InsertTuple,
    RemoveTuple,
});

server.bindAsync(
    env.PERMIT_GRPC_ADDRESS,
    grpc.ServerCredentials.createInsecure(),
    (error, port) => {
        if (error) logger.error(error.message);
        else logger.info(`Mail service is running on ${port}`);
    }
);

async function HasPermission(
    call: grpc.ServerUnaryCall<HasPermissionRequest, HasPermissionResponse>,
    callback: grpc.sendUnaryData<HasPermissionResponse>
) {
    callback(null, {
        allowed: false,
    });
}

async function InsertTuple(
    call: grpc.ServerUnaryCall<HasPermissionRequest, HasPermissionResponse>,
    callback: grpc.sendUnaryData<HasPermissionResponse>
) {
    try {
    } catch (error) {}

    callback(null, {
        allowed: false,
    });
}

async function RemoveTuple(
    call: grpc.ServerUnaryCall<HasPermissionRequest, HasPermissionResponse>,
    callback: grpc.sendUnaryData<HasPermissionResponse>
) {
    callback(null, {
        allowed: false,
    });
}

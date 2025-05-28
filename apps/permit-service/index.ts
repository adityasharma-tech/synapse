import * as grpc from "@grpc/grpc-js";
import { env } from "@pkgs/zod-client";
import {
    HasPermissionRequest,
    HasPermissionResponse,
    InsertTupleRequest,
    InsertTupleResponse,
    PermitService,
} from "@pkgs/lib/proto";
import { logger } from "@pkgs/lib";
import {
    DrizzleClient,
    EffectT,
    Permissions,
    ResourceT,
} from "@pkgs/drizzle-client";
import { and, eq } from "drizzle-orm";

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
    const [result] = await db
        .select()
        .from(Permissions)
        .where(
            and(
                eq(Permissions.action, call.request.action.toString()),
                eq(Permissions.resource, call.request.resource as ResourceT),
                eq(Permissions.user, call.request.user),
                eq(
                    Permissions.effect,
                    (call.request.effect as EffectT | undefined) ?? "allow"
                )
            )
        )
        .execute();

    if (result)
        callback(null, {
            allowed: true,
        });

    callback(null, {
        allowed: false,
    });
}

async function InsertTuple(
    call: grpc.ServerUnaryCall<InsertTupleRequest, InsertTupleResponse>,
    callback: grpc.sendUnaryData<InsertTupleResponse>
) {
    try {
        await db
            .insert(Permissions)
            .values({
                action: call.request.action,
                resource: call.request.resource as ResourceT,
                user: call.request.user,
                effect: (call.request.effect as EffectT | undefined) ?? "allow",
            })
            .execute();

        callback(null, {
            success: true,
        });
    } catch (err) {}

    callback(null, {
        success: false,
    });
}

async function RemoveTuple(
    call: grpc.ServerUnaryCall<InsertTupleRequest, InsertTupleResponse>,
    callback: grpc.sendUnaryData<InsertTupleResponse>
) {
    try {
        await db
            .delete(Permissions)
            .where(
                and(
                    eq(Permissions.action, call.request.action),
                    eq(
                        Permissions.resource,
                        call.request.resource as ResourceT
                    ),
                    eq(Permissions.user, call.request.user),
                    eq(
                        Permissions.effect,
                        (call.request.effect as EffectT | undefined) ?? "allow"
                    )
                )
            )
            .execute();
        callback(null, {
            success: true,
        });
    } catch (err) {}

    callback(null, {
        success: false,
    });
}

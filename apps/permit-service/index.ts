import * as grpc from "@grpc/grpc-js";
import { env } from "@pkgs/zod-client";
import {
    HasPermissionRequest,
    HasPermissionResponse,
    InsertPolicyRequest,
    InsertPolicyResponse,
    PermitService,
} from "@pkgs/lib/proto";
import { ActionT, logger } from "@pkgs/lib";
import {
    DrizzleClient,
    EffectT,
    Permissions,
    ResourceT,
    TargetT,
} from "@pkgs/drizzle-client";
import * as t from "drizzle-orm";

const server = new grpc.Server();
const { db } = new DrizzleClient();

server.addService(PermitService, {
    HasPermission,
    InsertPolicy,
    RemovePolicy,
});

server.bindAsync(
    env.PERMIT_GRPC_ADDRESS,
    grpc.ServerCredentials.createInsecure(),
    (error, port) => {
        if (error) logger.error(error.message);
        else logger.info(`Permit service is running on ${port}`);
    }
);

async function HasPermission(
    call: grpc.ServerUnaryCall<HasPermissionRequest, HasPermissionResponse>,
    callback: grpc.sendUnaryData<HasPermissionResponse>
) {
    const targetName = call.request.target.split(":")[0] as TargetT;
    const targetId = call.request.target.split(":")[1] as `${number}` | "*";

    const resourceName = call.request.resource.split(":")[0] as ResourceT;
    const resourceId = call.request.resource.split(":")[1] as `${number}` | "*";

    logger.info(
        `has ${call.request.target} ${call.request.resource} for action ${call.request.action}`
    );

    if (targetId == "*" || resourceId == "*") {
        const results = await db
            .select()
            .from(Permissions)
            .where(
                t.and(
                    t.eq(Permissions.target, targetName),
                    t.eq(Permissions.resource, resourceName),
                    t.eq(Permissions.action, call.request.action),
                    t.eq(Permissions.effect, "allow")
                )
            )
            .execute();
        if (results.length >= 0) {
            return callback(null, {
                allowed: true,
            });
        }
    } else {
        const results = await db
            .select()
            .from(Permissions)
            .where(
                t.and(
                    t.eq(Permissions.target, targetName),
                    t.eq(Permissions.targetId, Number(targetId)),
                    t.eq(Permissions.resource, resourceName),
                    t.eq(Permissions.resourceId, Number(resourceId)),
                    t.eq(Permissions.action, call.request.action)
                )
            );
        if (results.length >= 0) {
            return callback(null, {
                allowed: true,
            });
        }
    }

    callback(null, {
        allowed: false,
    });
}

async function InsertPolicy(
    call: grpc.ServerUnaryCall<InsertPolicyRequest, InsertPolicyResponse>,
    callback: grpc.sendUnaryData<InsertPolicyResponse>
) {
    try {
        await db.insert(Permissions).values([
            {
                action: call.request.action as ActionT,
                resource: call.request.resource as ResourceT,
                resourceId: call.request.resourceId,
                targetId: call.request.targetId,
                target: call.request.target as TargetT,
            },
        ]);

        return callback(null, {
            success: true,
        });
    } catch (err: any) {
        logger.error(
            `Failed while inserting policy to db with error: ${err.message}`
        );
    }

    callback(null, {
        success: false,
    });
}

async function RemovePolicy(
    call: grpc.ServerUnaryCall<InsertPolicyRequest, InsertPolicyResponse>,
    callback: grpc.sendUnaryData<InsertPolicyResponse>
) {
    const data = call.request;
    try {
        await db
            .delete(Permissions)
            .where(
                t.and(
                    t.eq(Permissions.action, data.action),
                    t.eq(Permissions.effect, data.effect as EffectT),
                    t.eq(Permissions.resource, data.resource as ResourceT),
                    t.eq(Permissions.resourceId, data.resourceId),
                    t.eq(Permissions.target, data.target as TargetT),
                    t.eq(Permissions.targetId, data.targetId)
                )
            );

        return callback(null, {
            success: true,
        });
    } catch (err: any) {
        logger.error(
            `Failed while deleting policy to db with error: ${err.message}`
        );
    }

    callback(null, {
        success: false,
    });
}

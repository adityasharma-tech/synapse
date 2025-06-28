import * as t from "drizzle-orm/pg-core";
export declare const resourceEnum: t.PgEnum<
    ["stream", "user", "chat", "order", "streamer-requests"]
>;
export type ResourceT = (typeof resourceEnum.enumValues)[number];
export declare const effectEnum: t.PgEnum<["allow", "disallow"]>;
export type EffectT = (typeof effectEnum.enumValues)[number];
export declare const targetEnum: t.PgEnum<
    ["streamer", "viewer", "admin", "user"]
>;
export type TargetT = (typeof targetEnum.enumValues)[number];
declare const Permissions: t.PgTableWithColumns<{
    name: "permissions";
    schema: "upgrade";
    columns: {
        updatedAt: t.PgColumn<
            {
                name: "updatedAt";
                tableName: "permissions";
                dataType: "date";
                columnType: "PgTimestamp";
                data: Date;
                driverParam: string;
                notNull: false;
                hasDefault: true;
                isPrimaryKey: false;
                isAutoincrement: false;
                hasRuntimeDefault: false;
                enumValues: undefined;
                baseColumn: never;
                identity: undefined;
                generated: undefined;
            },
            {},
            {}
        >;
        createdAt: t.PgColumn<
            {
                name: "createdAt";
                tableName: "permissions";
                dataType: "date";
                columnType: "PgTimestamp";
                data: Date;
                driverParam: string;
                notNull: true;
                hasDefault: true;
                isPrimaryKey: false;
                isAutoincrement: false;
                hasRuntimeDefault: false;
                enumValues: undefined;
                baseColumn: never;
                identity: undefined;
                generated: undefined;
            },
            {},
            {}
        >;
        id: t.PgColumn<
            {
                name: "id";
                tableName: "permissions";
                dataType: "number";
                columnType: "PgInteger";
                data: number;
                driverParam: string | number;
                notNull: true;
                hasDefault: true;
                isPrimaryKey: true;
                isAutoincrement: false;
                hasRuntimeDefault: false;
                enumValues: undefined;
                baseColumn: never;
                identity: "always";
                generated: undefined;
            },
            {},
            {}
        >;
        target: t.PgColumn<
            {
                name: "target";
                tableName: "permissions";
                dataType: "string";
                columnType: "PgEnumColumn";
                data: "admin" | "streamer" | "viewer" | "user";
                driverParam: string;
                notNull: true;
                hasDefault: false;
                isPrimaryKey: false;
                isAutoincrement: false;
                hasRuntimeDefault: false;
                enumValues: ["streamer", "viewer", "admin", "user"];
                baseColumn: never;
                identity: undefined;
                generated: undefined;
            },
            {},
            {}
        >;
        targetId: t.PgColumn<
            {
                name: "targetId";
                tableName: "permissions";
                dataType: "number";
                columnType: "PgInteger";
                data: number;
                driverParam: string | number;
                notNull: true;
                hasDefault: false;
                isPrimaryKey: false;
                isAutoincrement: false;
                hasRuntimeDefault: false;
                enumValues: undefined;
                baseColumn: never;
                identity: undefined;
                generated: undefined;
            },
            {},
            {}
        >;
        resource: t.PgColumn<
            {
                name: "resource";
                tableName: "permissions";
                dataType: "string";
                columnType: "PgEnumColumn";
                data:
                    | "user"
                    | "stream"
                    | "chat"
                    | "order"
                    | "streamer-requests";
                driverParam: string;
                notNull: true;
                hasDefault: false;
                isPrimaryKey: false;
                isAutoincrement: false;
                hasRuntimeDefault: false;
                enumValues: [
                    "stream",
                    "user",
                    "chat",
                    "order",
                    "streamer-requests",
                ];
                baseColumn: never;
                identity: undefined;
                generated: undefined;
            },
            {},
            {}
        >;
        resourceId: t.PgColumn<
            {
                name: "resourceId";
                tableName: "permissions";
                dataType: "number";
                columnType: "PgInteger";
                data: number;
                driverParam: string | number;
                notNull: true;
                hasDefault: false;
                isPrimaryKey: false;
                isAutoincrement: false;
                hasRuntimeDefault: false;
                enumValues: undefined;
                baseColumn: never;
                identity: undefined;
                generated: undefined;
            },
            {},
            {}
        >;
        effect: t.PgColumn<
            {
                name: "effect";
                tableName: "permissions";
                dataType: "string";
                columnType: "PgEnumColumn";
                data: "allow" | "disallow";
                driverParam: string;
                notNull: false;
                hasDefault: true;
                isPrimaryKey: false;
                isAutoincrement: false;
                hasRuntimeDefault: false;
                enumValues: ["allow", "disallow"];
                baseColumn: never;
                identity: undefined;
                generated: undefined;
            },
            {},
            {}
        >;
        action: t.PgColumn<
            {
                name: "action";
                tableName: "permissions";
                dataType: "string";
                columnType: "PgVarchar";
                data: string;
                driverParam: string;
                notNull: true;
                hasDefault: false;
                isPrimaryKey: false;
                isAutoincrement: false;
                hasRuntimeDefault: false;
                enumValues: [string, ...string[]];
                baseColumn: never;
                identity: undefined;
                generated: undefined;
            },
            {},
            {
                length: 255;
            }
        >;
    };
    dialect: "pg";
}>;
export { Permissions };

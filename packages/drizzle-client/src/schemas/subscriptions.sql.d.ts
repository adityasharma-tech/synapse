import * as t from "drizzle-orm/pg-core";
export declare const subStatus: t.PgEnum<
    [
        "created",
        "authenticated",
        "active",
        "pending",
        "halted",
        "cancelled",
        "completed",
        "expired",
    ]
>;
export type SubsciptionStatusT = (typeof subStatus.enumValues)[number];
declare const Subsciptions: t.PgTableWithColumns<{
    name: "subscriptions";
    schema: "upgrade";
    columns: {
        updatedAt: t.PgColumn<
            {
                name: "updatedAt";
                tableName: "subscriptions";
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
                tableName: "subscriptions";
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
                tableName: "subscriptions";
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
        planId: t.PgColumn<
            {
                name: "planId";
                tableName: "subscriptions";
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
        status: t.PgColumn<
            {
                name: "status";
                tableName: "subscriptions";
                dataType: "string";
                columnType: "PgEnumColumn";
                data:
                    | "created"
                    | "pending"
                    | "authenticated"
                    | "active"
                    | "halted"
                    | "cancelled"
                    | "completed"
                    | "expired";
                driverParam: string;
                notNull: true;
                hasDefault: false;
                isPrimaryKey: false;
                isAutoincrement: false;
                hasRuntimeDefault: false;
                enumValues: [
                    "created",
                    "authenticated",
                    "active",
                    "pending",
                    "halted",
                    "cancelled",
                    "completed",
                    "expired",
                ];
                baseColumn: never;
                identity: undefined;
                generated: undefined;
            },
            {},
            {}
        >;
        razorpaySubscriptionId: t.PgColumn<
            {
                name: "razorpaySubscriptionId";
                tableName: "subscriptions";
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
        paymentUrl: t.PgColumn<
            {
                name: "paymentUrl";
                tableName: "subscriptions";
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
                length: undefined;
            }
        >;
        userId: t.PgColumn<
            {
                name: "userId";
                tableName: "subscriptions";
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
    };
    dialect: "pg";
}>;
export { Subsciptions };

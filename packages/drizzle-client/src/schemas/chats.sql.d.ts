import * as t from "drizzle-orm/pg-core";
export declare const paymentStatusEnum: t.PgEnum<
    ["idle", "created", "attempted", "paid"]
>;
export type PaymentStatusT = (typeof paymentStatusEnum.enumValues)[number];
declare const ChatMessage: t.PgTableWithColumns<{
    name: "chats";
    schema: "upgrade";
    columns: {
        updatedAt: t.PgColumn<
            {
                name: "updatedAt";
                tableName: "chats";
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
                tableName: "chats";
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
                tableName: "chats";
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
        streamUid: t.PgColumn<
            {
                name: "streamUid";
                tableName: "chats";
                dataType: "string";
                columnType: "PgVarchar";
                data: string;
                driverParam: string;
                notNull: false;
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
                tableName: "chats";
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
        cfOrderId: t.PgColumn<
            {
                name: "cfOrderId";
                tableName: "chats";
                dataType: "string";
                columnType: "PgVarchar";
                data: string;
                driverParam: string;
                notNull: false;
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
        message: t.PgColumn<
            {
                name: "message";
                tableName: "chats";
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
        markRead: t.PgColumn<
            {
                name: "markRead";
                tableName: "chats";
                dataType: "boolean";
                columnType: "PgBoolean";
                data: boolean;
                driverParam: boolean;
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
        upVotes: t.PgColumn<
            {
                name: "upVotes";
                tableName: "chats";
                dataType: "array";
                columnType: "PgArray";
                data: number[];
                driverParam: string | (string | number)[];
                notNull: true;
                hasDefault: true;
                isPrimaryKey: false;
                isAutoincrement: false;
                hasRuntimeDefault: false;
                enumValues: undefined;
                baseColumn: import("drizzle-orm").Column<
                    {
                        name: "";
                        tableName: "chats";
                        dataType: "number";
                        columnType: "PgInteger";
                        data: number;
                        driverParam: string | number;
                        notNull: false;
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
                identity: undefined;
                generated: undefined;
            },
            {},
            {
                baseBuilder: t.PgColumnBuilder<
                    {
                        name: "";
                        dataType: "number";
                        columnType: "PgInteger";
                        data: number;
                        driverParam: number | string;
                        enumValues: undefined;
                    },
                    {},
                    {},
                    import("drizzle-orm").ColumnBuilderExtraConfig
                >;
                size: undefined;
            }
        >;
        downVotes: t.PgColumn<
            {
                name: "downVotes";
                tableName: "chats";
                dataType: "array";
                columnType: "PgArray";
                data: number[];
                driverParam: string | (string | number)[];
                notNull: true;
                hasDefault: true;
                isPrimaryKey: false;
                isAutoincrement: false;
                hasRuntimeDefault: false;
                enumValues: undefined;
                baseColumn: import("drizzle-orm").Column<
                    {
                        name: "";
                        tableName: "chats";
                        dataType: "number";
                        columnType: "PgInteger";
                        data: number;
                        driverParam: string | number;
                        notNull: false;
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
                identity: undefined;
                generated: undefined;
            },
            {},
            {
                baseBuilder: t.PgColumnBuilder<
                    {
                        name: "";
                        dataType: "number";
                        columnType: "PgInteger";
                        data: number;
                        driverParam: number | string;
                        enumValues: undefined;
                    },
                    {},
                    {},
                    import("drizzle-orm").ColumnBuilderExtraConfig
                >;
                size: undefined;
            }
        >;
        replyToId: t.PgColumn<
            {
                name: "replyToId";
                tableName: "chats";
                dataType: "number";
                columnType: "PgInteger";
                data: number;
                driverParam: string | number;
                notNull: false;
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
        pinned: t.PgColumn<
            {
                name: "pinned";
                tableName: "chats";
                dataType: "boolean";
                columnType: "PgBoolean";
                data: boolean;
                driverParam: boolean;
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
        paymentStatus: t.PgColumn<
            {
                name: "paymentStatus";
                tableName: "chats";
                dataType: "string";
                columnType: "PgEnumColumn";
                data: "idle" | "created" | "attempted" | "paid";
                driverParam: string;
                notNull: true;
                hasDefault: true;
                isPrimaryKey: false;
                isAutoincrement: false;
                hasRuntimeDefault: false;
                enumValues: ["idle", "created", "attempted", "paid"];
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
export { ChatMessage };

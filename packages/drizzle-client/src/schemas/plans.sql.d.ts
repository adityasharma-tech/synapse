import * as t from "drizzle-orm/pg-core";
declare const Plans: t.PgTableWithColumns<{
    name: "plans";
    schema: "upgrade";
    columns: {
        updatedAt: t.PgColumn<
            {
                name: "updatedAt";
                tableName: "plans";
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
                tableName: "plans";
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
                tableName: "plans";
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
        name: t.PgColumn<
            {
                name: "name";
                tableName: "plans";
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
        details: t.PgColumn<
            {
                name: "details";
                tableName: "plans";
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
        amount: t.PgColumn<
            {
                name: "amount";
                tableName: "plans";
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
        razorpayPlanId: t.PgColumn<
            {
                name: "razorpayPlanId";
                tableName: "plans";
                dataType: "string";
                columnType: "PgVarchar";
                data: string;
                driverParam: string;
                notNull: true;
                hasDefault: true;
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
        streamerId: t.PgColumn<
            {
                name: "streamerId";
                tableName: "plans";
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
export { Plans };

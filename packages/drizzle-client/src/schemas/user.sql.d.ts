import * as t from "drizzle-orm/pg-core";
export declare const userRolesEnum: t.PgEnum<["streamer", "viewer", "admin"]>;
export type UserRole = (typeof userRolesEnum.enumValues)[number];
export declare const lastLoginMethod: t.PgEnum<
    ["email-password", "sso/google", "sso/github"]
>;
declare const User: t.PgTableWithColumns<{
    name: "users";
    schema: "upgrade";
    columns: {
        lastLoginMethod: t.PgColumn<
            {
                name: "lastLoginMethod";
                tableName: "users";
                dataType: "string";
                columnType: "PgEnumColumn";
                data: "email-password" | "sso/google" | "sso/github";
                driverParam: string;
                notNull: false;
                hasDefault: true;
                isPrimaryKey: false;
                isAutoincrement: false;
                hasRuntimeDefault: false;
                enumValues: ["email-password", "sso/google", "sso/github"];
                baseColumn: never;
                identity: undefined;
                generated: undefined;
            },
            {},
            {}
        >;
        updatedAt: t.PgColumn<
            {
                name: "updatedAt";
                tableName: "users";
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
                tableName: "users";
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
                tableName: "users";
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
        firstName: t.PgColumn<
            {
                name: "firstName";
                tableName: "users";
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
        lastName: t.PgColumn<
            {
                name: "lastName";
                tableName: "users";
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
        username: t.PgColumn<
            {
                name: "username";
                tableName: "users";
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
        email: t.PgColumn<
            {
                name: "email";
                tableName: "users";
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
        profilePicture: t.PgColumn<
            {
                name: "profilePicture";
                tableName: "users";
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
        phoneNumber: t.PgColumn<
            {
                name: "phoneNumber";
                tableName: "users";
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
                length: 45;
            }
        >;
        passwordHash: t.PgColumn<
            {
                name: "passwordHash";
                tableName: "users";
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
        role: t.PgColumn<
            {
                name: "role";
                tableName: "users";
                dataType: "string";
                columnType: "PgEnumColumn";
                data: "admin" | "streamer" | "viewer";
                driverParam: string;
                notNull: false;
                hasDefault: true;
                isPrimaryKey: false;
                isAutoincrement: false;
                hasRuntimeDefault: false;
                enumValues: ["streamer", "viewer", "admin"];
                baseColumn: never;
                identity: undefined;
                generated: undefined;
            },
            {},
            {}
        >;
        emailVerified: t.PgColumn<
            {
                name: "emailVerified";
                tableName: "users";
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
        refrenceId: t.PgColumn<
            {
                name: "refrenceId";
                tableName: "users";
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
        watchHistory: t.PgColumn<
            {
                name: "watchHistory";
                tableName: "users";
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
                        tableName: "users";
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
    };
    dialect: "pg";
}>;
export { User };

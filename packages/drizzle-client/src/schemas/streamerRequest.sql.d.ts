import * as t from "drizzle-orm/pg-core";
export declare const businessTypeEnum: t.PgEnum<
    [
        "llp",
        "ngo",
        "individual",
        "partnership",
        "proprietorship",
        "public_limited",
        "private_limited",
        "trust",
        "society",
        "not_yet_registered",
        "educational_institutes",
    ]
>;
export declare const requestStatusEnum: t.PgEnum<
    [
        "pending",
        "account_created",
        "stakeholder_created",
        "tnc_accepted",
        "account_added",
        "done",
    ]
>;
declare const StreamerRequest: t.PgTableWithColumns<{
    name: "streamer_request";
    schema: "upgrade";
    columns: {
        updatedAt: t.PgColumn<
            {
                name: "updatedAt";
                tableName: "streamer_request";
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
                tableName: "streamer_request";
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
                tableName: "streamer_request";
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
                identity: "byDefault";
                generated: undefined;
            },
            {},
            {}
        >;
        userId: t.PgColumn<
            {
                name: "userId";
                tableName: "streamer_request";
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
        razorpayAccountId: t.PgColumn<
            {
                name: "razorpayAccountId";
                tableName: "streamer_request";
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
                length: 255;
            }
        >;
        productConfigurationId: t.PgColumn<
            {
                name: "productConfigurationId";
                tableName: "streamer_request";
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
                length: 255;
            }
        >;
        stakeholderId: t.PgColumn<
            {
                name: "stakeholderId";
                tableName: "streamer_request";
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
                length: 255;
            }
        >;
        accountName: t.PgColumn<
            {
                name: "accountName";
                tableName: "streamer_request";
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
        accountEmail: t.PgColumn<
            {
                name: "accountEmail";
                tableName: "streamer_request";
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
        dashboardAccess: t.PgColumn<
            {
                name: "dashboardAccess";
                tableName: "streamer_request";
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
                length: undefined;
            }
        >;
        customerRefunds: t.PgColumn<
            {
                name: "customerRefunds";
                tableName: "streamer_request";
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
                length: undefined;
            }
        >;
        businessName: t.PgColumn<
            {
                name: "businessName";
                tableName: "streamer_request";
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
        businessType: t.PgColumn<
            {
                name: "businessType";
                tableName: "streamer_request";
                dataType: "string";
                columnType: "PgEnumColumn";
                data:
                    | "llp"
                    | "ngo"
                    | "individual"
                    | "partnership"
                    | "proprietorship"
                    | "public_limited"
                    | "private_limited"
                    | "trust"
                    | "society"
                    | "not_yet_registered"
                    | "educational_institutes";
                driverParam: string;
                notNull: true;
                hasDefault: true;
                isPrimaryKey: false;
                isAutoincrement: false;
                hasRuntimeDefault: false;
                enumValues: [
                    "llp",
                    "ngo",
                    "individual",
                    "partnership",
                    "proprietorship",
                    "public_limited",
                    "private_limited",
                    "trust",
                    "society",
                    "not_yet_registered",
                    "educational_institutes",
                ];
                baseColumn: never;
                identity: undefined;
                generated: undefined;
            },
            {},
            {}
        >;
        requestStatus: t.PgColumn<
            {
                name: "requestStatus";
                tableName: "streamer_request";
                dataType: "string";
                columnType: "PgEnumColumn";
                data:
                    | "pending"
                    | "account_created"
                    | "stakeholder_created"
                    | "tnc_accepted"
                    | "account_added"
                    | "done";
                driverParam: string;
                notNull: true;
                hasDefault: true;
                isPrimaryKey: false;
                isAutoincrement: false;
                hasRuntimeDefault: false;
                enumValues: [
                    "pending",
                    "account_created",
                    "stakeholder_created",
                    "tnc_accepted",
                    "account_added",
                    "done",
                ];
                baseColumn: never;
                identity: undefined;
                generated: undefined;
            },
            {},
            {}
        >;
        bankIfscCode: t.PgColumn<
            {
                name: "bankIfscCode";
                tableName: "streamer_request";
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
        bankAccountNumber: t.PgColumn<
            {
                name: "bankAccountNumber";
                tableName: "streamer_request";
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
        phoneNumber: t.PgColumn<
            {
                name: "phoneNumber";
                tableName: "streamer_request";
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
        streetAddress: t.PgColumn<
            {
                name: "streetAddress";
                tableName: "streamer_request";
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
        city: t.PgColumn<
            {
                name: "city";
                tableName: "streamer_request";
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
        state: t.PgColumn<
            {
                name: "state";
                tableName: "streamer_request";
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
        postalCode: t.PgColumn<
            {
                name: "postalCode";
                tableName: "streamer_request";
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
        panCard: t.PgColumn<
            {
                name: "panCard";
                tableName: "streamer_request";
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
        kycDocumentUrl: t.PgColumn<
            {
                name: "kycDocumentUrl";
                tableName: "streamer_request";
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
    };
    dialect: "pg";
}>;
export { StreamerRequest };

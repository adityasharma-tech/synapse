"use strict";
var __createBinding =
    (this && this.__createBinding) ||
    (Object.create
        ? function (o, m, k, k2) {
              if (k2 === undefined) k2 = k;
              var desc = Object.getOwnPropertyDescriptor(m, k);
              if (
                  !desc ||
                  ("get" in desc
                      ? !m.__esModule
                      : desc.writable || desc.configurable)
              ) {
                  desc = {
                      enumerable: true,
                      get: function () {
                          return m[k];
                      },
                  };
              }
              Object.defineProperty(o, k2, desc);
          }
        : function (o, m, k, k2) {
              if (k2 === undefined) k2 = k;
              o[k2] = m[k];
          });
var __setModuleDefault =
    (this && this.__setModuleDefault) ||
    (Object.create
        ? function (o, v) {
              Object.defineProperty(o, "default", {
                  enumerable: true,
                  value: v,
              });
          }
        : function (o, v) {
              o["default"] = v;
          });
var __importStar =
    (this && this.__importStar) ||
    (function () {
        var ownKeys = function (o) {
            ownKeys =
                Object.getOwnPropertyNames ||
                function (o) {
                    var ar = [];
                    for (var k in o)
                        if (Object.prototype.hasOwnProperty.call(o, k))
                            ar[ar.length] = k;
                    return ar;
                };
            return ownKeys(o);
        };
        return function (mod) {
            if (mod && mod.__esModule) return mod;
            var result = {};
            if (mod != null)
                for (var k = ownKeys(mod), i = 0; i < k.length; i++)
                    if (k[i] !== "default") __createBinding(result, mod, k[i]);
            __setModuleDefault(result, mod);
            return result;
        };
    })();
Object.defineProperty(exports, "__esModule", { value: true });
exports.StreamerRequest =
    exports.requestStatusEnum =
    exports.businessTypeEnum =
        void 0;
const user_sql_1 = require("./user.sql");
const t = __importStar(require("drizzle-orm/pg-core"));
const helpers_sql_1 = require("./helpers.sql");
exports.businessTypeEnum = helpers_sql_1.schema.enum("business_type", [
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
]);
exports.requestStatusEnum = helpers_sql_1.schema.enum("request_status", [
    "pending",
    "account_created",
    "stakeholder_created",
    "tnc_accepted",
    "account_added",
    "done",
]);
const StreamerRequest = helpers_sql_1.schema.table(
    "streamer_request",
    Object.assign(
        {
            id: t.integer().primaryKey().generatedByDefaultAsIdentity(),
            userId: t
                .integer()
                .references(() => user_sql_1.User.id)
                .notNull(),
            razorpayAccountId: t.varchar({ length: 255 }),
            productConfigurationId: t.varchar({ length: 255 }),
            stakeholderId: t.varchar({ length: 255 }),
            accountName: t.varchar().notNull(),
            accountEmail: t.varchar().notNull(),
            dashboardAccess: t.varchar().default("0").notNull(),
            customerRefunds: t.varchar().default("0").notNull(),
            businessName: t.varchar().notNull(),
            businessType: (0, exports.businessTypeEnum)()
                .default("individual")
                .notNull(),
            requestStatus: (0, exports.requestStatusEnum)()
                .default("pending")
                .notNull(),
            bankIfscCode: t.varchar().notNull(),
            bankAccountNumber: t.varchar().notNull(),
            phoneNumber: t.varchar().notNull(),
            streetAddress: t.varchar().notNull(),
            city: t.varchar().notNull(),
            state: t.varchar().notNull(),
            postalCode: t.varchar().notNull(),
            panCard: t.varchar().notNull(),
            kycDocumentUrl: t.varchar(),
        },
        helpers_sql_1.timestamps
    ),
    (table) => [
        t.uniqueIndex("razorpayAccountIdIdx").on(table.razorpayAccountId),
        t.index("accountEmailIdx").on(table.accountEmail),
    ]
);
exports.StreamerRequest = StreamerRequest;

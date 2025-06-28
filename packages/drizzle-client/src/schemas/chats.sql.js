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
exports.ChatMessage = exports.paymentStatusEnum = void 0;
const t = __importStar(require("drizzle-orm/pg-core"));
const user_sql_1 = require("./user.sql");
const helpers_sql_1 = require("./helpers.sql");
exports.paymentStatusEnum = helpers_sql_1.schema.enum("payment_status_enum", [
    "idle",
    "created",
    "attempted",
    "paid",
]);
const ChatMessage = helpers_sql_1.schema.table(
    "chats",
    Object.assign(
        {
            id: t.integer().primaryKey().generatedAlwaysAsIdentity(),
            streamUid: t.varchar(),
            userId: t
                .integer()
                .references(() => user_sql_1.User.id)
                .notNull(),
            cfOrderId: t.varchar(),
            message: t.varchar().notNull(),
            markRead: t.boolean().default(false).notNull(),
            upVotes: t
                .integer()
                .references(() => user_sql_1.User.id)
                .array()
                .default([])
                .notNull(),
            downVotes: t
                .integer()
                .references(() => user_sql_1.User.id)
                .array()
                .default([])
                .notNull(),
            replyToId: t.integer(),
            pinned: t.boolean().default(false).notNull(),
            paymentStatus: (0, exports.paymentStatusEnum)()
                .default("idle")
                .notNull(),
        },
        helpers_sql_1.timestamps
    ),
    (table) => [t.index("streamUidIdx").on(table.streamUid)]
);
exports.ChatMessage = ChatMessage;

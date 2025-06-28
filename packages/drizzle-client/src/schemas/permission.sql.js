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
exports.Permissions =
    exports.targetEnum =
    exports.effectEnum =
    exports.resourceEnum =
        void 0;
const t = __importStar(require("drizzle-orm/pg-core"));
const helpers_sql_1 = require("./helpers.sql");
const user_sql_1 = require("./user.sql");
exports.resourceEnum = helpers_sql_1.schema.enum("resources", [
    "stream",
    "user",
    "chat",
    "order",
    "streamer-requests",
]);
exports.effectEnum = helpers_sql_1.schema.enum("effects", [
    "allow",
    "disallow",
]);
exports.targetEnum = helpers_sql_1.schema.enum("targets", [
    ...user_sql_1.userRolesEnum.enumValues,
    "user",
]);
const Permissions = helpers_sql_1.schema.table(
    "permissions",
    Object.assign(
        {
            id: t.integer().primaryKey().generatedAlwaysAsIdentity(),
            target: (0, exports.targetEnum)().notNull(),
            targetId: t.integer().notNull(),
            resource: (0, exports.resourceEnum)().notNull(),
            resourceId: t.integer().notNull(),
            effect: (0, exports.effectEnum)().default("allow"),
            action: t.varchar({ length: 255 }).notNull(),
        },
        helpers_sql_1.timestamps
    ),
    (table) => {
        return [
            t
                .uniqueIndex("wholeIndex")
                .on(
                    table.target,
                    table.targetId,
                    table.resource,
                    table.resourceId,
                    table.effect,
                    table.action
                ),
        ];
    }
);
exports.Permissions = Permissions;

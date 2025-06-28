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
exports.User = exports.lastLoginMethod = exports.userRolesEnum = void 0;
const t = __importStar(require("drizzle-orm/pg-core"));
const helpers_sql_1 = require("./helpers.sql");
const drizzle_orm_1 = require("drizzle-orm");
exports.userRolesEnum = helpers_sql_1.schema.enum("roles", [
    "streamer",
    "viewer",
    "admin",
]);
exports.lastLoginMethod = helpers_sql_1.schema.enum("last_login_method", [
    "email-password",
    "sso/google",
    "sso/github",
]);
const User = helpers_sql_1.schema.table(
    "users",
    Object.assign(
        Object.assign(
            {
                id: t.integer().primaryKey().generatedAlwaysAsIdentity(),
                firstName: t.varchar({ length: 255 }).notNull(),
                lastName: t.varchar({ length: 255 }).notNull(),
                username: t.varchar({ length: 255 }).notNull().unique(),
                email: t.varchar().notNull().unique(),
                profilePicture: t.varchar(),
                phoneNumber: t.varchar({ length: 45 }).notNull(),
                passwordHash: t.varchar().notNull(),
                role: (0, exports.userRolesEnum)().default("viewer"),
                emailVerified: t.boolean().default(false).notNull(),
                refrenceId: t.varchar(),
                watchHistory: t
                    .integer()
                    .array()
                    .notNull()
                    .default((0, drizzle_orm_1.sql)`ARRAY[]::integer[]`),
            },
            helpers_sql_1.timestamps
        ),
        {
            lastLoginMethod: (0, exports.lastLoginMethod)().default(
                "email-password"
            ),
        }
    ),
    (table) => [
        t.uniqueIndex("emailIdx").on(table.email),
        t.uniqueIndex("usernameIdx").on(table.username),
    ]
);
exports.User = User;

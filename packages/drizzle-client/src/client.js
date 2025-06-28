"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DrizzleClient = void 0;
const dotenv_1 = require("dotenv");
const pg_1 = require("pg");
const node_postgres_1 = require("drizzle-orm/node-postgres");
const zod_client_1 = require("@pkgs/zod-client");
(0, dotenv_1.config)({ path: "../../.env" });
class DrizzleClient {
    constructor(replicaDb = false) {
        this.db = this.getDb(replicaDb);
    }
    getDb(replicaDb) {
        const host = replicaDb
            ? `replica-${zod_client_1.env.DB_HOST}`
            : zod_client_1.env.DB_HOST;
        const pool = new pg_1.Pool({
            host,
            port: zod_client_1.env.DB_PORT,
            database: zod_client_1.env.DB_NAME,
            user: zod_client_1.env.DB_USER,
            password: zod_client_1.env.DB_PASSWORD,
            ssl: { ca: zod_client_1.env.DB_SSL_CA, rejectUnauthorized: true },
        });
        // Using casing: 'snake_case', setting this will convert all my camelCase keys to snake_case
        // So, I will use the camelCase but in the database it will be snake_case
        const db = (0, node_postgres_1.drizzle)({
            client: pool,
            casing: "snake_case",
        });
        return db;
    }
}
exports.DrizzleClient = DrizzleClient;

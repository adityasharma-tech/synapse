"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.schema = exports.timestamps = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const schema = (0, pg_core_1.pgSchema)("upgrade");
exports.schema = schema;
const timestamps = {
    updatedAt: (0, pg_core_1.timestamp)().$onUpdate(() => new Date()),
    createdAt: (0, pg_core_1.timestamp)().defaultNow().notNull(),
};
exports.timestamps = timestamps;

import { Pool } from "pg";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
interface DrizzleClientInterface {
    db: NodePgDatabase<Record<string, never>> & {
        $client: Pool;
    };
}
declare class DrizzleClient implements DrizzleClientInterface {
    db: NodePgDatabase<Record<string, never>> & {
        $client: Pool;
    };
    constructor(replicaDb?: boolean);
    private getDb;
}
export { DrizzleClient };

import { Pool } from "pg";
import { drizzle, NodePgDatabase } from "drizzle-orm/node-postgres";
import { serverEnv } from "zod-client"

interface DrizzleClientInterface {
  db: NodePgDatabase<Record<string, never>> & {
    $client: Pool;
  };
}

class DrizzleClient implements DrizzleClientInterface {
  public db;

  constructor(replicaDb = false) {
    this.db = this.getDb(replicaDb);
  }

  private getDb(replicaDb: boolean) {
    const host = replicaDb ? `replica-${serverEnv.DB_HOST}` : serverEnv.DB_HOST;

    const pool = new Pool({
      host,
      port: serverEnv.DB_PORT,
      database: serverEnv.DB_NAME,
      user: serverEnv.DB_USER,
      password: serverEnv.DB_PASSWORD,
      ssl: { ca: serverEnv.DB_SSL_CA, rejectUnauthorized: true },
    });

    // Using casing: 'snake_case', setting this will convert all my camelCase keys to snake_case
    // So, I will use the camelCase but in the database it will be snake_case
    const db = drizzle({ client: pool, casing: "snake_case" });
    return db;
  }
}

export { DrizzleClient };

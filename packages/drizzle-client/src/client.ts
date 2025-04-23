import { Pool } from "pg";
import { drizzle, NodePgDatabase } from "drizzle-orm/node-postgres";

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
    const host = replicaDb ? `replica-${process.env.DB_HOST}` : process.env.DB_HOST!;

    const pool = new Pool({
      host,
      port: +process.env.DB_PORT!,
      database: process.env.DB_NAME!,
      user: process.env.DB_USER!,
      password: process.env.DB_PASSWORD!,
      ssl: { ca: process.env.DB_SSL_CA!, rejectUnauthorized: true },
    });

    // Using casing: 'snake_case', setting this will convert all my camelCase keys to snake_case
    // So, I will use the camelCase but in the database it will be snake_case
    const db = drizzle({ client: pool, casing: "snake_case" });
    return db;
  }
}

export { DrizzleClient };

import {config} from "dotenv"
import { Pool } from "pg";
import { drizzle, NodePgDatabase } from "drizzle-orm/node-postgres";
import { env } from "zod-client"

config({ path: "../../.env" })
// const serverEnv = zodServerEnv.parse(process.env);

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
    const host = replicaDb ? `replica-${env.DB_HOST}` : env.DB_HOST;

    const pool = new Pool({
      host,
      port: env.DB_PORT,
      database: env.DB_NAME,
      user: env.DB_USER,
      password: env.DB_PASSWORD,
      ssl: { ca: env.DB_SSL_CA, rejectUnauthorized: true },
    });

    // Using casing: 'snake_case', setting this will convert all my camelCase keys to snake_case
    // So, I will use the camelCase but in the database it will be snake_case
    const db = drizzle({ client: pool, casing: "snake_case" });
    return db;
  }
}

export { DrizzleClient };

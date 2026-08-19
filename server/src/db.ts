import { Pool, QueryResult } from "pg";
import { config } from "./config";

export const pool = new Pool({
  connectionString: config.databaseUrl,
});

// Errors on idle clients are emitted on the pool; without a listener they are
// thrown as uncaught exceptions and take the process down.
pool.on("error", (err) => {
  console.error("unexpected postgres pool error", err);
});

export async function query(text: string, params?: any[]): Promise<QueryResult> {
  try {
    return await pool.query(text, params);
  } catch (err) {
    console.error("database query failed", { text, err });
    throw err;
  }
}

export async function closePool(): Promise<void> {
  await pool.end();
}

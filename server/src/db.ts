import { Pool } from "pg";
import { getDatabaseUrl } from "./config";

export const pool = new Pool({
  connectionString: getDatabaseUrl(),
});

export async function query(text: string, params?: any[]) {
  return pool.query(text, params);
}

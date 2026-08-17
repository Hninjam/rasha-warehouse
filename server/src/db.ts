import { Pool } from "pg";
import dotenv from "dotenv";
dotenv.config();

const connectionString = process.env.DATABASE_URL || "postgres://rasha:rasha_pass@localhost:5432/rasha_db";

export const pool = new Pool({
  connectionString,
});

export async function query(text: string, params?: any[]) {
  return pool.query(text, params);
}

import dotenv from "dotenv";
dotenv.config();

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable ${name}`);
  }
  return value;
}

function port(name: string, fallback: number): number {
  const raw = process.env[name];
  if (!raw) return fallback;
  const parsed = Number(raw);
  if (!Number.isInteger(parsed) || parsed <= 0 || parsed > 65535) {
    throw new Error(`Invalid ${name}: expected a port number, got "${raw}"`);
  }
  return parsed;
}

export const config = {
  port: port("PORT", 8080),
  databaseUrl: process.env.DATABASE_URL || "postgres://rasha:rasha_pass@localhost:5432/rasha_db",
  jwtSecret: required("JWT_SECRET"),
};

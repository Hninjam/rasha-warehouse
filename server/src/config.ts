import dotenv from "dotenv";
dotenv.config();

export const databaseUrl = process.env.DATABASE_URL || "postgres://rasha:rasha_pass@localhost:5432/rasha_db";

export const port = ((): number => {
  const raw = process.env.PORT;
  if (!raw) return 8080;
  const parsed = Number(raw);
  if (!Number.isInteger(parsed) || parsed <= 0 || parsed > 65535) {
    throw new Error(`Invalid PORT: expected a port number, got "${raw}"`);
  }
  return parsed;
})();

export function jwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("Missing required environment variable JWT_SECRET");
  }
  return secret;
}

/** Fails fast at startup rather than on the first request that needs a secret. */
export function validateConfig(): void {
  jwtSecret();
}

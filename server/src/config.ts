import dotenv from "dotenv";
dotenv.config();

const INSECURE_SECRETS = new Set(["change_me", "change_me_long_secret"]);

export function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32 || INSECURE_SECRETS.has(secret)) {
    throw new Error(
      "JWT_SECRET must be set to a strong value (at least 32 characters). Refusing to start with a missing or default secret."
    );
  }
  return secret;
}

export function getDatabaseUrl(): string {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL must be set (e.g. postgres://user:pass@host:5432/dbname).");
  }
  return url;
}

export function getCorsOrigins(): string[] {
  return (process.env.CORS_ORIGINS || "")
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean);
}

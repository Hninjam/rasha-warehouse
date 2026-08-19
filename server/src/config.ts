import dotenv from "dotenv";

dotenv.config();

/** Env is read on access so tests (and runtime reloads) see the current values. */
export const config = {
  get databaseUrl(): string {
    return process.env.DATABASE_URL || "postgres://rasha:rasha_pass@localhost:5432/rasha_db";
  },
  get port(): number {
    return Number(process.env.PORT) || 8080;
  },
  get jwtSecret(): string {
    return process.env.JWT_SECRET || "change_me";
  },
  get jwtExpiresIn(): string {
    return process.env.JWT_EXPIRES_IN || "8h";
  },
};

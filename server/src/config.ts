import dotenv from "dotenv";

dotenv.config();

export const config = {
  databaseUrl: process.env.DATABASE_URL || "postgres://rasha:rasha_pass@localhost:5432/rasha_db",
  port: Number(process.env.PORT) || 8080,
  jwtSecret: process.env.JWT_SECRET || "change_me",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "8h",
};

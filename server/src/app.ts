import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth";
import inventoryRoutes from "./routes/inventory";

export function createApp() {
  const app = express();
  app.use(cors());
  app.use(express.json());

  // health
  app.get("/api/health", (_, res) => res.json({ status: "ok", time: new Date().toISOString() }));

  // routes
  app.use("/api/auth", authRoutes);
  app.use("/api/inventory", inventoryRoutes);

  // simple fallback
  app.use((_, res) => res.status(404).json({ error: "not found" }));

  return app;
}

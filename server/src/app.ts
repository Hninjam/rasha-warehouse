import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth";
import inventoryRoutes from "./routes/inventory";
import { notFound, sendError } from "./http";

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
  app.use((_, res) => notFound(res));

  app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error(err);
    sendError(res, 500, "internal error");
  });

  return app;
}

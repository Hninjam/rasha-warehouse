import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth";
import inventoryRoutes from "./routes/inventory";
import { createServer } from "http";
import { WebSocketServer } from "ws";
import { getJwtSecret, getDatabaseUrl, getCorsOrigins } from "./config";

// Fail fast on missing/insecure configuration.
getJwtSecret();
getDatabaseUrl();

const app = express();
app.disable("x-powered-by");

const allowedOrigins = getCorsOrigins();
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow same-origin / non-browser requests (no Origin header).
      if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error("origin not allowed by CORS"));
    },
  })
);
app.use(express.json({ limit: "100kb" }));

// health
app.get("/api/health", (_, res) => res.json({ status: "ok", time: new Date().toISOString() }));

// routes
app.use("/api/auth", authRoutes);
app.use("/api/inventory", inventoryRoutes);

// simple fallback
app.use((_, res) => res.status(404).json({ error: "not found" }));

// error handler (avoid leaking stack traces)
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  if (err.message === "origin not allowed by CORS") {
    return res.status(403).json({ error: "origin not allowed" });
  }
  console.error(err);
  res.status(500).json({ error: "internal server error" });
});

const server = createServer(app);
const port = process.env.PORT || 8080;

// WebSocket server (stub for real-time chat & sync)
const wss = new WebSocketServer({ server, path: "/ws", maxPayload: 64 * 1024 });
wss.on("connection", (ws) => {
  console.log("ws connected");
  ws.on("message", (msg) => {
    // echo for now
    ws.send(`echo: ${msg}`);
  });
});

server.listen(port, () => {
  console.log(`API listening on http://0.0.0.0:${port}`);
});

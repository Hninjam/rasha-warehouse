import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth";
import inventoryRoutes from "./routes/inventory";
import { createServer } from "http";
import { WebSocketServer } from "ws";

dotenv.config();

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

const server = createServer(app);
const port = process.env.PORT || 8080;

// WebSocket server (stub for real-time chat & sync)
const wss = new WebSocketServer({ server, path: "/ws" });
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

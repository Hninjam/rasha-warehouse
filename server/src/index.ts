import { createServer } from "http";
import { WebSocketServer } from "ws";
import { createApp } from "./app";
import { port, validateConfig } from "./config";
import { closePool } from "./db";

validateConfig();

const app = createApp();

const server = createServer(app);

// WebSocket server (stub for real-time chat & sync)
const wss = new WebSocketServer({ server, path: "/ws" });
wss.on("error", (err) => {
  console.error("websocket server error", err);
});
wss.on("connection", (ws) => {
  console.log("ws connected");
  ws.on("error", (err) => {
    console.error("websocket connection error", err);
  });
  ws.on("message", (msg) => {
    // echo for now
    ws.send(`echo: ${msg}`, (err) => {
      if (err) console.error("failed to send websocket message", err);
    });
  });
});

server.on("error", (err) => {
  console.error(`failed to listen on port ${port}`, err);
  process.exit(1);
});

server.listen(port, () => {
  console.log(`API listening on http://0.0.0.0:${port}`);
});

let shuttingDown = false;
async function shutdown(signal: string): Promise<void> {
  if (shuttingDown) return;
  shuttingDown = true;
  console.log(`received ${signal}, shutting down`);
  try {
    await new Promise<void>((resolve, reject) => {
      server.close((err) => (err ? reject(err) : resolve()));
    });
    await closePool();
    process.exit(0);
  } catch (err) {
    console.error("error during shutdown", err);
    process.exit(1);
  }
}

process.on("SIGTERM", () => void shutdown("SIGTERM"));
process.on("SIGINT", () => void shutdown("SIGINT"));

process.on("unhandledRejection", (reason) => {
  console.error("unhandled promise rejection", reason);
  process.exit(1);
});

process.on("uncaughtException", (err) => {
  console.error("uncaught exception", err);
  process.exit(1);
});

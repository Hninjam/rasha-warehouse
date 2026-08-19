import dotenv from "dotenv";
import { createServer } from "http";
import { WebSocketServer } from "ws";
import { createApp } from "./app";

dotenv.config();

const app = createApp();

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

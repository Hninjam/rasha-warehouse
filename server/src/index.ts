import { createServer } from "http";
import { WebSocketServer } from "ws";
import { createApp } from "./app";
import { config } from "./config";

const app = createApp();

const server = createServer(app);

// WebSocket server (stub for real-time chat & sync)
const wss = new WebSocketServer({ server, path: "/ws" });
wss.on("connection", (ws) => {
  console.log("ws connected");
  ws.on("message", (msg) => {
    // echo for now
    ws.send(`echo: ${msg}`);
  });
});

server.listen(config.port, () => {
  console.log(`API listening on http://0.0.0.0:${config.port}`);
});

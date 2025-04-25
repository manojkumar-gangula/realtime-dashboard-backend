import express from "express";
import { createServer } from "node:http";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { Server } from "socket.io";

const app = express();
const server = createServer(app);
const io = new Server(server);

app.get("/", (req, res) => {
  const dir_name = dirname(fileURLToPath(import.meta.url));
  res.sendFile(join(dir_name, "index.html"));
});

io.on("connection", (socket) => {
  console.log("user connected");
  socket.on("message", (msg) => {
    socket.broadcast.emit("message", msg);
  });
});

server.listen(8000, () => {
  console.log("Running on 8000");
});

import express from "express";
import { createServer } from "node:http";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { Server } from "socket.io";

const app = express();
const server = createServer(app);
// 1 -> 1 Mapping, one socket can be only one room.
const socketToRoom = new Map();
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  // console.log("user connected, socket: " + JSON.stringify(socket));
  // console.log(util.inspect(socket, { depth: null, colors: true }));
  //Receiving messages from Client
  socket.on("send_msg", (msg) => {
    socket.to(socketToRoom.get(socket.id)).emit("receive_msg", msg);
  });

  //Joining room
  socket.on("join_room", (roomId) => {
    console.log("Joined room");
    //We are maintaining 1 -> 1 mapping. Meaning one socket is associated with only one Room.
    socketToRoom.set(socket.id, roomId);
    console.log(JSON.stringify(socketToRoom));

    socket.join(roomId);
  });

  //Leaving room
  socket.on("leave_room", (roomId) => {
    console.log("Left room");
    socketToRoom.delete(socket.id);
    socket.leave(roomId);
  });
});

server.listen(8000, () => {
  console.log("Running on 8000");
});

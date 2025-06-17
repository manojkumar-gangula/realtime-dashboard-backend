import express from "express";
import { createServer } from "node:http";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { Server } from "socket.io";

const app = express();
const server = createServer(app);
// 1 -> 1 Mapping, one socket can be only in one room.
const socketToRoom = new Map();
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  //Receiving messages from Client
  socket.on("send_msg", (msg) => {
    socket.to(socketToRoom.get(socket.id)).emit("receive_msg", msg);
  });

  socket.on("send_shape", (shape) => {
    socket.to(socketToRoom.get(socket.id)).emit("receive_shape", shape);
    console.log("Received & emitting shape: " + shape);
  });

  socket.on("send_dragshape_data", (dragShapeData) => {
    socket
      .to(socketToRoom.get(socket.id))
      .emit("receive_dragshape_data", dragShapeData);
  });
  //Joining room
  socket.on("join_room", (roomId) => {
    console.log("Joined room");
    //We are maintaining 1 -> 1 mapping. Meaning one socket is associated with only one Room.
    if (socketToRoom.get(socket.id)) {
      socket.leave(socketToRoom.get(socket.id));
      socketToRoom.delete(socket.id);
    }
    console.log("new room: " + roomId);
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

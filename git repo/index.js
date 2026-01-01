import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";

const app = express();
const server = createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*", // Allow connections from any tab/device
    methods: ["GET", "POST"],
  },
});

let users = [];

io.on("connection", (socket) => {
  console.log(`Socket connected: ${socket.id}`);

  socket.on("join", (username) => {
    // 1. Add user to list
    const user = { id: socket.id, username };
    users.push(user);

    // 2. Broadcast updated user list
    io.emit("users", users.map((u) => u.username));

    // 3. Broadcast "User Joined" Notification to EVERYONE
    io.emit("message", {
      username: "System",
      message: `${username} has joined the chat.`,
      type: "notification" // Helper tag for frontend
    });
  });

  socket.on("sendMessage", (data) => {
    // 4. Broadcast the message to EVERYONE (including sender)
    io.emit("message", {
      username: data.username,
      message: data.message,
      type: "chat"
    });
  });

  socket.on("disconnect", () => {
    const user = users.find((u) => u.id === socket.id);
    if (user) {
      users = users.filter((u) => u.id !== socket.id);
      
      // Update list
      io.emit("users", users.map((u) => u.username));
      
      // Broadcast "User Left" Notification
      io.emit("message", {
        username: "System",
        message: `${user.username} has left the chat.`,
        type: "notification"
      });
    }
  });
});

server.listen(5000, () => {
  console.log("SERVER RUNNING ON PORT 5000");
});
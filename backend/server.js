const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");

const app = express();
const server = http.createServer(app);

const io = socketIo(server, {
  cors: {
    origin: "*",  // Accept connections from any origin
  },
});

app.use(cors());

io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);

  socket.on("canvasImage", (data) => {
    // Broadcast the drawing data to all other clients
    socket.broadcast.emit("canvasImage", data);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

// Use the port provided by Render or fallback to 5000 for local dev
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

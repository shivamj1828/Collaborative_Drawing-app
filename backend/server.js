const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");

const app = express();
const server = http.createServer(app);
const io = socketIo(server, { cors: { origin: "*" } }); // origin(*) means accepted from everywhere

app.use(cors());

io.on("connection", function (socket) {
  socket.on("canvasImage", (data) => {
    socket.broadcast.emit("canvasImage", data);
  });
});

io.listen(5000);
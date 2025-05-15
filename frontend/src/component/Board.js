import React, { useRef, useEffect, useState } from "react";
import io from "socket.io-client";

const Board = (props) => {
  const { brushColor, brushSize } = props;
  const canvasRef = useRef(null);

  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const newSocket = io("http://localhost:5000");
    console.log(newSocket, "Connected to socket");
    setSocket(newSocket);
  }, []);

  useEffect(() => {
    if (socket) {
      socket.on("canvasImage", (data) => {
        const image = new Image();
        image.src = data;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        image.onload = () => {
          ctx.drawImage(image, 0, 0);
        };
      });
    }
  }, [socket]);

  useEffect(() => {
    let isDrawing = false;
    let lastX = 0;
    let lastY = 0;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");

    // Set initial drawing styles
    if (ctx) {
      ctx.strokeStyle = brushColor;
      ctx.lineWidth = brushSize;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
    }

    const startDrawing = (e) => {
      isDrawing = true;
      [lastX, lastY] = [e.offsetX, e.offsetY];
    };

    const draw = (e) => {
      if (!isDrawing) return;
      if (ctx) {
        ctx.beginPath();
        ctx.moveTo(lastX, lastY);
        ctx.lineTo(e.offsetX, e.offsetY);
        ctx.stroke();
      }
      [lastX, lastY] = [e.offsetX, e.offsetY];
    };

    const endDrawing = () => {
      const dataURL = canvas.toDataURL();
      if (socket) {
        socket.emit("canvasImage", dataURL);
      }
      isDrawing = false;
    };

    canvas.addEventListener("mousedown", startDrawing);
    canvas.addEventListener("mousemove", draw);
    canvas.addEventListener("mouseup", endDrawing);
    canvas.addEventListener("mouseout", endDrawing);

    return () => {
      canvas.removeEventListener("mousedown", startDrawing);
      canvas.removeEventListener("mousemove", draw);
      canvas.removeEventListener("mouseup", endDrawing);
      canvas.removeEventListener("mouseout", endDrawing);
    };
  }, [brushColor, brushSize, socket]);

  const [windowSize, setWindowSize] = useState([
    window.innerWidth,
    window.innerHeight,
  ]);

  useEffect(() => {
    const handleWindowResize = () => {
      setWindowSize([window.innerWidth, window.innerHeight]);
    };

    window.addEventListener("resize", handleWindowResize);

    return () => {
      window.removeEventListener("resize", handleWindowResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      width={windowSize[0] > 600 ? 600 : 300}
      height={windowSize[1] > 400 ? 400 : 200}
      style={{ backgroundColor: "white", border: "1px solid #000" }}
    />
  );
};

export default Board;
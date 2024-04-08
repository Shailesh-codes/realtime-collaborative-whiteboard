import React, { useRef, useEffect, useState } from "react";
import { fabric } from "fabric";
import { io } from "socket.io-client";

const Whiteboard: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [canvas, setCanvas] = useState<fabric.Canvas | null>(null);
  const [socket, setSocket] = useState<io.Socket | null>(null);

  useEffect(() => {
    const newCanvas = new fabric.Canvas(canvasRef.current!, {
      isDrawingMode: true,
    });
    setCanvas(newCanvas);

    const newSocket = io("http://localhost:300");
    setSocket(newSocket);

    return () => {
      newCanvas.dispose();
      newSocket.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!socket || !canvas) return;

    socket.on("drawing", (data: any) => {
      if (!data || !data.path) return;
      canvas!.loadFromJSON(data.path, () => canvas!.renderAll());
    });

    return () => {
      socket.off("drawing");
    };
  }, [socket, canvas]);

  const handleCanvasChange = () => {
    if (!socket || !canvas) return;
    const path = JSON.stringify(canvas.toJSON(["path"]));
    socket.emit("drawing", { path });
  };

  return (
    <canvas
      ref={canvasRef}
      onMouseUp={handleCanvasChange}
      onTouchEnd={handleCanvasChange}
    ></canvas>
  );
};

export default Whiteboard;

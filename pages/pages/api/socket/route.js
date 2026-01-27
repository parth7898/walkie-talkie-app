import { Server } from "socket.io";

export default function handler(req, res) {
  if (!res.socket.server.io) {
    console.log("🟢 Socket server starting...");

    const io = new Server(res.socket.server, {
      path: "/api/socket",
      cors: {
        origin: "*",
      },
    });

    res.socket.server.io = io;

    io.on("connection", (socket) => {
      console.log("✅ User connected:", socket.id);

      socket.on("join-room", (roomId) => {
        socket.join(roomId);
        console.log("👥 Joined room:", roomId);
      });

      socket.on("audio-message", (data) => {
        console.log("📡 Audio received, forwarding...");
        socket.to(data.roomId).emit("audio-message", data);
      });

      socket.on("disconnect", () => {
        console.log("❌ User disconnected:", socket.id);
      });
    });
  }

  res.end();
}

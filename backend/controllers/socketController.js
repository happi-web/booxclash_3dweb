// socketHandler.js
import GameRoom from "../models/GameRoom.js";

export default function socketHandler(io, socket) {
  socket.on("joinRoom", async ({ code, name, country }) => {
    try {
      const room = await GameRoom.findOne({ code });

      if (!room) {
        socket.emit("errorMessage", "Room not found.");
        return;
      }

      if (room.players.some((p) => p.name === name)) {
        socket.emit("errorMessage", "Name already taken.");
        return;
      }

      if (room.players.length >= room.participants) {
        socket.emit("errorMessage", "Room is full.");
        return;
      }

      const newPlayer = { name, country, socketId: socket.id };
      room.players.push(newPlayer);
      await room.save();

      socket.join(code);
      console.log(`[joinRoom] ${name} joined room ${code}`);
      io.to(code).emit("playerListUpdate", room.players);
    } catch (err) {
      console.error("[joinRoom error]:", err);
      socket.emit("errorMessage", "Error joining room.");
    }
  });

  socket.on("startGame", async ({ code }) => {
    try {
      console.log(`[startGame] Starting game in room ${code}`);
      io.to(code).emit("gameStarted");
    } catch (err) {
      console.error("[startGame error]:", err);
    }
  });

  socket.on("disconnect", async () => {
    try {
      const room = await GameRoom.findOne({ "players.socketId": socket.id });
      if (!room) return;

      room.players = room.players.filter((p) => p.socketId !== socket.id);
      await room.save();

      console.log(`[disconnect] Socket ${socket.id} disconnected from room ${room.code}`);
      io.to(room.code).emit("playerListUpdate", room.players);
    } catch (err) {
      console.error("[disconnect error]:", err);
    }
  });
}

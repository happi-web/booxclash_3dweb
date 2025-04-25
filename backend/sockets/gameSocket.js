const rooms = new Map(); // Map<roomId, { players: Array<{ socketId, name, country }>, maxPlayers }>

const registerGameHandlers = (io) => {
  io.on("connection", (socket) => {
    console.log("🔌 New socket connected:", socket.id);

    // Assign socket ID to client
    socket.emit("assignId", socket.id);

    // Host joins the room
    socket.on("hostJoinRoom", ({ roomId, maxPlayers }) => {
      socket.join(roomId);
      console.log(`👑 Host joined room ${roomId}`);

      if (!rooms.has(roomId)) {
        rooms.set(roomId, { players: [], maxPlayers });
      } else {
        rooms.get(roomId).maxPlayers = maxPlayers;
      }

      const room = rooms.get(roomId);

      io.to(roomId).emit("playerListUpdate", {
        players: room.players,
        joinedCount: room.players.length,
        maxPlayers: room.maxPlayers,
      });
    });

    // Player joins the room
    socket.on("joinRoom", ({ roomId, name, country }) => {
      const room = rooms.get(roomId);
      if (!room) {
        console.warn(`❌ Attempt to join nonexistent room: ${roomId}`);
        socket.emit("error", { message: "Room not found." });
        return;
      }

      if (room.players.length >= room.maxPlayers) {
        console.warn(`🚫 Room ${roomId} full. Rejecting player ${name}`);
        socket.emit("roomFull", { message: "Room is already full." });
        return;
      }

      socket.join(roomId);

      const alreadyJoined = room.players.find((p) => p.socketId === socket.id);
      if (!alreadyJoined) {
        room.players.push({ socketId: socket.id, name, country });
        console.log(`✅ ${name} joined room ${roomId}`);
      }

      // Broadcast updated player list
      io.to(roomId).emit("playerListUpdate", {
        players: room.players,
        joinedCount: room.players.length,
        maxPlayers: room.maxPlayers,
      });

      socket.emit("playerWaiting", {
        message: "Waiting for host to start the game...",
        current: room.players.length,
        max: room.maxPlayers,
      });

      if (room.players.length === room.maxPlayers) {
        console.log(`📣 Room ${roomId} is full.`);
        io.to(roomId).emit("roomFull", {
          message: "Room is full. Waiting for host to start...",
        });
      }
    });

    // Host starts the game
    socket.on("startGame", ({ roomId }) => {
      const room = rooms.get(roomId);
      if (room) {
        console.log(`🎮 Game started in room ${roomId}`);
        io.to(roomId).emit("startGame");

        // Trigger first knockout round
        startKnockoutRound(io, roomId, room.players);
      } else {
        console.warn(`⚠️ Tried to start game for nonexistent room ${roomId}`);
      }
    });

    // Continue knockout with winners
    socket.on("startNextRound", ({ roomId, players }) => {
      console.log(`🔁 Starting next knockout round in ${roomId} with ${players.length} players`);
      startKnockoutRound(io, roomId, players);
    });

    socket.on("disconnect", () => {
      console.log("❌ Socket disconnected:", socket.id);

      // Clean up player from any room
      for (const [roomId, room] of rooms) {
        const index = room.players.findIndex(p => p.socketId === socket.id);
        if (index !== -1) {
          const removed = room.players.splice(index, 1);
          console.log(`🧹 Removed player ${removed[0].name} from room ${roomId}`);

          io.to(roomId).emit("playerListUpdate", {
            players: room.players,
            joinedCount: room.players.length,
            maxPlayers: room.maxPlayers,
          });

          // If room is empty, delete it
          if (room.players.length === 0) {
            rooms.delete(roomId);
            console.log(`🗑️ Deleted empty room ${roomId}`);
          }

          break;
        }
      }
    });
  });
};

// Utility: Knockout pairing and round logic
const startKnockoutRound = (io, roomId, players) => {
  const shuffled = [...players].sort(() => Math.random() - 0.5);
  const pairs = [];

  for (let i = 0; i < shuffled.length; i += 2) {
    if (shuffled[i + 1]) {
      pairs.push({ player1: shuffled[i], player2: shuffled[i + 1] });
    } else {
      // Odd player gets auto-advance (could be customized)
      io.to(shuffled[i].socketId).emit("autoAdvance", { message: "You advance to next round!" });
    }
  }

  pairs.forEach((pair, index) => {
    setTimeout(() => {
      io.to(roomId).emit("roundData", {
        pair,
        index
      });
    }, index * 20000); // space rounds every 20s
  });
};

export default registerGameHandlers;

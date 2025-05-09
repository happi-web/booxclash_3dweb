const rooms = new Map(); // Map<roomId, { players: Array<{ socketId, name, country }>, maxPlayers, currentPlayerIndex, questionTimer }>

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

const updatePlayerList = (io, roomId) => {
    const room = rooms.get(roomId);
    if (!room) return;
  
    io.to(roomId).emit("playerListUpdate", {
      players: room.players,
      joinedCount: room.players.length,
      maxPlayers: room.maxPlayers,
    });
  };

const sendNextQuestion = (io, roomId) => {
  const room = rooms.get(roomId);
  if (!room) return;

  const currentIndex = room.currentPlayerIndex;
  const currentPlayer = room.players[currentIndex];

  const sampleQuestion = {
    question: "Is 17 a prime number?",
    options: ["Yes", "No"],
    correctAnswer: "Yes"
  };

  // Get current scores for leaderboard
  const leaderboard = room.players.map(player => ({
    ...player,
    score: room.scores.get(player.socketId) || 0,
    isCurrent: player.socketId === currentPlayer.socketId
  })).sort((a, b) => b.score - a.score);

  room.players.forEach((player) => {
    io.to(player.socketId).emit("newQuestion", {
      question: sampleQuestion,
      yourTurn: player.socketId === currentPlayer.socketId,
      currentPlayer: currentPlayer.name,
      leaderboard,
      timeLeft: 20
    });
  });

  console.log(`📨 Sent question to all in room ${roomId}. It's ${currentPlayer.name}'s turn.`);
  startTurnTimer(io, roomId, currentPlayer.socketId);
};

const startTurnTimer = (io, roomId, currentPlayerSocketId) => {
  const room = rooms.get(roomId);
  if (!room) return;

  // Clear any existing timer
  if (room.questionTimer) {
    clearTimeout(room.questionTimer);
    room.questionTimer = null;
  }

  let timeLeft = 20;
  
  // Update timer every second
  const interval = setInterval(() => {
    timeLeft--;
    io.to(currentPlayerSocketId).emit("timerUpdate", { timeLeft });

    if (timeLeft <= 0) {
      clearInterval(interval);
    }
  }, 1000);

  room.questionTimer = setTimeout(() => {
    clearInterval(interval);
    io.to(currentPlayerSocketId).emit("timeUp");

    // Move to next player automatically
    const room = rooms.get(roomId);
    if (!room) return;

    room.currentPlayerIndex++;
    if (room.currentPlayerIndex >= room.players.length) {
      // Round ended
      const leaderboard = Array.from(room.scores.entries())
        .map(([socketId, score]) => {
          const player = room.players.find(p => p.socketId === socketId);
          return { ...player, score };
        })
        .sort((a, b) => b.score - a.score);

      io.to(roomId).emit("roundEnded", { leaderboard });
    } else {
      sendNextQuestion(io, roomId);
    }
  }, 20000);
};

// Utility: Individual round logic for knockout quiz
const startKnockoutRound = (io, roomId, players) => {
    const shuffled = [...players].sort(() => Math.random() - 0.5);
  
    // Notify players one-by-one with questions
    shuffled.forEach((player, index) => {
      setTimeout(() => {
        io.to(player.socketId).emit("askQuestion", {
          playerId: player.id,
          playerName: player.name
        });
      }, index * 10000); // Ask a question every 10s
    });
  
    // After all players have had their turn, calculate lowest score
    setTimeout(() => {
      const scores = shuffled.map(p => ({ id: p.id, score: p.score || 0 }));
      const minScore = Math.min(...scores.map(s => s.score));
      const losers = scores.filter(s => s.score === minScore);
  
      losers.forEach(loser => {
        const player = players.find(p => p.id === loser.id);
        if (player) {
          io.to(player.socketId).emit("eliminated", {
            message: "You have been eliminated.",
            score: loser.score
          });
        }
      });
  
      const remainingPlayers = players.filter(p => !losers.some(l => l.id === p.id));
      io.to(roomId).emit("roundEnded", {
        remainingPlayers
      });
    }, shuffled.length * 10000 + 2000); // Wait for all questions + 2s buffer
  };
  

export default registerGameHandlers;


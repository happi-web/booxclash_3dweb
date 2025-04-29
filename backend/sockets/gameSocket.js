const rooms = new Map(); 

const registerGameHandlers = (io) => {
  io.on("connection", (socket) => {
    console.log("🔌 New socket connected:", socket.id);
    socket.emit("assignId", socket.id);

    socket.on("hostJoinRoom", ({ roomId, maxPlayers }) => {
      socket.join(roomId);
      console.log(`👑 Host joined room ${roomId}`);

      if (!rooms.has(roomId)) {
        rooms.set(roomId, { 
          players: [], 
          maxPlayers, 
          currentQuestion: null, 
          currentPlayerIndex: 0, 
          roundIndex: 0,
          questions: [],
          currentQuestionIndex: 0
        });
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

    socket.on("joinRoom", ({ roomId, name, country }) => {
      const room = rooms.get(roomId);
      if (!room) {
        socket.emit("error", { message: "Room not found." });
        return;
      }

      if (room.players.length >= room.maxPlayers) {
        socket.emit("roomFull", { message: "Room is already full." });
        return;
      }

      socket.join(roomId);
      const alreadyJoined = room.players.find((p) => p.socketId === socket.id);
      if (!alreadyJoined) {
        room.players.push({ socketId: socket.id, name, country, _id: socket.id });
      }

      io.to(roomId).emit("playerListUpdate", {
        players: room.players,
        joinedCount: room.players.length,
        maxPlayers: room.maxPlayers,
      });
    });

    socket.on("questionsLoaded", ({ roomId, questions }) => {
      const room = rooms.get(roomId);
      if (room) {
        room.questions = questions;
        room.currentQuestion = questions[0];
        io.to(roomId).emit("questionUpdate", room.currentQuestion);
      }
    });

    socket.on("startFirstQuestion", ({ roomId }) => {
      const room = rooms.get(roomId);
      if (room) {
        room.currentQuestion = room.questions[0];
        room.currentPlayerIndex = 0;
        io.to(roomId).emit("questionUpdate", room.currentQuestion);
        io.to(roomId).emit("playerTurnUpdate", {
          playerIndex: 0,
          roundIndex: 0
        });
      }
    });

    socket.on("playerAnswered", ({ roomId, playerId, isCorrect, option }) => {
      const room = rooms.get(roomId);
      if (!room) return;

      // Update player points if correct
      if (isCorrect) {
        const player = room.players.find(p => p._id === playerId);
        if (player) {
          player.points = (player.points || 0) + 10;
        }
      }

      // Move to next player or next round
      setTimeout(() => {
        if (room.currentPlayerIndex + 1 < room.players.length) {
          room.currentPlayerIndex++;
          io.to(roomId).emit("playerTurnUpdate", {
            playerIndex: room.currentPlayerIndex,
            roundIndex: room.roundIndex
          });
        } else {
          // End of round logic
          const maxPoints = Math.max(...room.players.map(p => p.points || 0));
          const survivors = room.players.filter(p => (p.points || 0) === maxPoints);

          if (survivors.length <= 1 || room.currentQuestionIndex + 1 >= room.questions.length) {
            // Game over
            io.to(roomId).emit("gameOver", { survivors });
          } else {
            // Next round
            room.roundIndex++;
            room.currentQuestionIndex++;
            room.currentQuestion = room.questions[room.currentQuestionIndex];
            room.currentPlayerIndex = 0;
            room.players = survivors;

            io.to(roomId).emit("questionUpdate", room.currentQuestion);
            io.to(roomId).emit("playerTurnUpdate", {
              playerIndex: 0,
              roundIndex: room.roundIndex
            });
            io.to(roomId).emit("leaderboardUpdate", room.players);
          }
        }
      }, 1000);
    });

    socket.on("updateLeaderboard", ({ roomId, leaderboard }) => {
      io.to(roomId).emit("leaderboardUpdate", leaderboard);
    });

    socket.on("disconnect", () => {
      for (const [roomId, room] of rooms) {
        const index = room.players.findIndex(p => p.socketId === socket.id);
        if (index !== -1) {
          room.players.splice(index, 1);
          io.to(roomId).emit("playerListUpdate", {
            players: room.players,
            joinedCount: room.players.length,
            maxPlayers: room.maxPlayers,
          });
          break;
        }
      }
    });
  });
};

export default registerGameHandlers;
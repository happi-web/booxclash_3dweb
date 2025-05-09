import fs from 'fs';

const rooms = new Map(); // roomId -> { players, maxPlayers, currentPlayerIndex, scores, answers, round, questionTimer }
const questionsDB = JSON.parse(fs.readFileSync('./data/questions.json', 'utf-8'));

/**
 * Utility: Sanitize player list to remove invalid/undefined players
 */
const sanitizePlayerList = (room) => {
  if (!room || !Array.isArray(room.players)) return;

  const originalLength = room.players.length;
  room.players = room.players.filter(p => p && p.socketId);
  if (room.players.length !== originalLength) {
    console.warn(`⚠️ Removed ${originalLength - room.players.length} invalid player(s) from room.`);
  }
};

/**
 * Registers Socket.IO game event handlers
 */
const registerGameHandlers = (io) => {
  io.on("connection", (socket) => {
    console.log("🔌 Connected:", socket.id);
    socket.emit("assignId", socket.id);

    socket.on("hostJoinRoom", ({ roomId, maxPlayers, hostName, hostCountry }) => {
      socket.join(roomId);
      const hostPlayer = { socketId: socket.id, name: hostName, country: hostCountry };
    
      if (!rooms.has(roomId)) {
        rooms.set(roomId, {
          players: [hostPlayer],
          maxPlayers,
          currentPlayerIndex: 0,
          scores: new Map([[socket.id, 0]]),
          answers: new Map(),
          round: 1,
          subject: 'math',
        });
      } else {
        const room = rooms.get(roomId);
        room.maxPlayers = maxPlayers;
    
        const alreadyExists = room.players.some(p => p.socketId === socket.id);
        if (!alreadyExists) {
          room.players.push(hostPlayer);
          room.scores.set(socket.id, 0);
        }
      }
    
      updatePlayerList(io, roomId);
    });
    

    socket.on("joinRoom", ({ roomId, name, country }) => {
      const room = rooms.get(roomId);
      if (!room) return socket.emit("error", { message: "Room not found." });
    
      // Reject invalid name or country
      if (!name?.trim() || !country?.trim()) {
        return socket.emit("error", { message: "Name and country are required." });
      }
    
      // Check if room is full
      if (room.players.length >= room.maxPlayers) {
        return socket.emit("roomFull", { message: "Room is full." });
      }
    
      // Check if player already joined
      const alreadyJoined = room.players.some(p => p.socketId === socket.id);
      if (alreadyJoined) {
        return socket.emit("error", { message: "You have already joined the room." });
      }
    
      socket.join(roomId);
    
      // Add player safely
      room.players.push({ socketId: socket.id, name: name.trim(), country: country.trim() });
      room.scores.set(socket.id, 0);
    
      updatePlayerList(io, roomId);
    
      socket.emit("playerWaiting", {
        message: "Waiting for host...",
        current: room.players.length,
        max: room.maxPlayers,
      });
    
      if (room.players.length === room.maxPlayers) {
        io.to(roomId).emit("roomFull", {
          message: "Room is full. Waiting for host...",
        });
      }
    });
    

    socket.on("startGame", ({ roomId }) => {
      const room = rooms.get(roomId);
      if (room) {
        sanitizePlayerList(room);
        io.to(roomId).emit("gameStarting");
        setTimeout(() => {
          sendNextQuestion(io, roomId);
        }, 4000);
      }
    });

    socket.on("startNextRound", ({ roomId }) => {
      const room = rooms.get(roomId);
      if (room) {
        sanitizePlayerList(room);
        room.currentPlayerIndex = 0;
        room.answers.clear();
        room.round += 1;
        console.log(`🚀 Starting round ${room.round} in room ${roomId}`);
        io.to(roomId).emit("roundStarting", { round: room.round });
        setTimeout(() => {
          sendNextQuestion(io, roomId);
        }, 2000);
      }
    });

    socket.on("answer", ({ roomId, socketId, isCorrect, answer }) => {
      const room = rooms.get(roomId);
      if (!room) return;

      sanitizePlayerList(room);

      room.answers.set(socketId, answer);
      const currentScore = room.scores.get(socketId) || 0;
      if (isCorrect) room.scores.set(socketId, currentScore + 10);

      io.to(roomId).emit("playerAnswersUpdate", {
        answers: Array.from(room.answers.entries()).map(([id, ans]) => ({
          playerId: id,
          answer: ans
        })),
      });

      updatePlayerList(io, roomId);

      if (room.answers.size === room.players.length) {
        const leaderboard = room.players
          .map(p => ({
            ...p,
            score: room.scores.get(p.socketId) || 0,
          }))
          .sort((a, b) => b.score - a.score);

        io.to(roomId).emit("roundEnded", { leaderboard });
      }
    });

    socket.on("disconnect", () => {
      console.log("❌ Disconnected:", socket.id);
      for (const [roomId, room] of rooms.entries()) {
        const index = room.players.findIndex(p => p.socketId === socket.id);
        if (index !== -1) {
          room.players.splice(index, 1);
          room.scores.delete(socket.id);
          room.answers.delete(socket.id);
          sanitizePlayerList(room);
          updatePlayerList(io, roomId);

          if (room.players.length === 0) {
            clearTimeout(room.questionTimer);
            rooms.delete(roomId);
          }
          break;
        }
      }
    });
  });
};

/**
 * Sends the next question to players and starts a timer for the current player's turn.
 */
const sendNextQuestion = (io, roomId) => {
  const room = rooms.get(roomId);
  if (!room) return;

  sanitizePlayerList(room);

  const currentIndex = room.currentPlayerIndex;
  const currentPlayer = room.players[currentIndex];
  const level = String(room.round);

  const levelQuestions = questionsDB.math?.[level];
  if (!levelQuestions || levelQuestions.length === 0) {
    console.warn(`⚠️ No questions found for level ${level}`);
    io.to(roomId).emit("error", { message: `No questions for level ${level}` });
    return;
  }

  const shuffledQuestions = [...levelQuestions].sort(() => Math.random() - 0.5);
  const question = shuffledQuestions[0];

  const leaderboard = room.players
    .map(player => ({
      ...player,
      score: room.scores.get(player.socketId) || 0,
      isCurrent: player.socketId === currentPlayer.socketId,
    }))
    .sort((a, b) => b.score - a.score);

  io.to(roomId).emit("newQuestion", {
    question,
    currentPlayer,
    leaderboard,
    timeLeft: 20,
  });

  startTurnTimer(io, roomId);
};

/**
 * Starts a timer for the current player's turn
 */
const startTurnTimer = (io, roomId) => {
  const room = rooms.get(roomId);
  if (!room) return;

  sanitizePlayerList(room);

  const currentPlayer = room.players[room.currentPlayerIndex];
  let timeLeft = 20;

  const interval = setInterval(() => {
    timeLeft--;
    io.to(roomId).emit("timerUpdate", { timeLeft });
    if (timeLeft <= 0) clearInterval(interval);
  }, 1000);

  room.questionTimer = setTimeout(() => {
    clearInterval(interval);
    io.to(roomId).emit("timeUp");

    room.currentPlayerIndex++;
    if (room.currentPlayerIndex >= room.players.length) {
      const leaderboard = room.players
        .map(p => ({
          ...p,
          score: room.scores.get(p.socketId) || 0,
        }))
        .sort((a, b) => b.score - a.score);

      io.to(roomId).emit("roundEnded", { leaderboard });
    } else {
      sendNextQuestion(io, roomId);
    }
  }, 20000);
};

/**
 * Sends updated player list to clients in the room
 */
const updatePlayerList = (io, roomId) => {
  const room = rooms.get(roomId);
  if (!room) return;

  sanitizePlayerList(room);

  io.to(roomId).emit("playerListUpdate", {
    players: room.players.map(player => ({
      socketId: player.socketId,
      name: player.name,
      country: player.country,
      score: room.scores.get(player.socketId) || 0,
    })),
    joinedCount: room.players.length,
    maxPlayers: room.maxPlayers,
  });
};

export default registerGameHandlers;

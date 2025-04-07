import Room from '../models/Room.js';
import Player from '../models/Players.js';

const getRandomQuestion = (subject) => {
  const mathQuestions = [
    {
      question: "What is 7 x 6?",
      options: ["36", "42", "48", "52"],
      answer: "42",
    },
    {
      question: "Solve: 12 + 8 ÷ 4",
      options: ["5", "14", "16", "20"],
      answer: "14",
    },
  ];

  const scienceQuestions = [
    {
      question: "What part of the plant conducts photosynthesis?",
      options: ["Root", "Stem", "Leaf", "Flower"],
      answer: "Leaf",
    },
    {
      question: "Which gas do plants absorb?",
      options: ["Oxygen", "Carbon Dioxide", "Nitrogen", "Hydrogen"],
      answer: "Carbon Dioxide",
    },
  ];

  const pool = subject === 'Math' ? mathQuestions : scienceQuestions;
  return pool[Math.floor(Math.random() * pool.length)];
};

const setupSocket = (io) => {
  io.on('connection', (socket) => {
    console.log('Socket connected:', socket.id);

    socket.on('join-room', async ({ code, name }) => {
      try {
        socket.join(code);
        const player = await Player.findOne({ name, roomCode: code });

        if (!player) {
          console.error(`Player not found: name=${name}, roomCode=${code}`);
          return;
        }

        player.socketId = socket.id;
        await player.save();

        const room = await Room.findOne({ code }).populate('players');
        if (room) {
          io.to(code).emit('update-players', room.players);
        } else {
          console.error(`Room not found with code: ${code}`);
        }
      } catch (err) {
        console.error('Error in join-room:', err);
      }
    });

    socket.on('rejoin-room', async ({ code }) => {
      try {
        const room = await Room.findOne({ code }).populate('players');
        if (room && room.isGameStarted) {
          io.to(code).emit('game-started', room.players);
        }
      } catch (err) {
        console.error('Error in rejoin-room:', err);
      }
    });

    // 🔥 Start Knockout Game
    socket.on('start-knockout-game', async ({ code, subject, contentType, contentList }) => {
      try {
        const room = await Room.findOne({ code }).populate('players');
        if (!room) {
          console.error(`Room not found with code: ${code}`);
          return;
        }

        room.subject = subject;
        room.contentType = contentType;
        room.contentList = contentList;
        room.isGameStarted = true;
        await room.save();

        io.to(code).emit('game-started', room.players);
        io.to(code).emit('redirect-to-game', { code });

        // ⚔️ Pair two players randomly
        const players = room.players;
        if (players.length < 2) {
          console.warn('Not enough players to start a game.');
          return;
        }

        const shuffled = players.sort(() => 0.5 - Math.random());
        const [player1, player2] = shuffled;

        const question = getRandomQuestion(subject);

        // 🎯 Emit to both players the question
        if (player1.socketId) {
          io.to(player1.socketId).emit('new-question', {
            question,
            opponent: player2.name,
            timer: 30,
          });
        }

        if (player2.socketId) {
          io.to(player2.socketId).emit('new-question', {
            question,
            opponent: player1.name,
            timer: 30,
          });
        }

        // ⏳ Timer logic — to handle answers after 30s (expand later)
        setTimeout(() => {
          // Placeholder — later handle answer checking
          console.log(`Timer ended for ${player1.name} vs ${player2.name}`);
        }, 30000);

        io.in(code).emit('round-started', {
          playersPaired: [player1.name, player2.name],
          subject,
        });

      } catch (err) {
        console.error('Error in start-knockout-game:', err);
      }
    });

    // Optional legacy
    socket.on('start-game', async (code) => {
      try {
        const room = await Room.findOne({ code }).populate('players');
        if (!room) {
          console.error(`Room not found with code: ${code}`);
          return;
        }

        room.isGameStarted = true;
        await room.save();

        io.to(code).emit('game-started', room.players);
        io.to(code).emit('redirect-to-game', { code });
      } catch (err) {
        console.error('Error in start-game:', err);
      }
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected:', socket.id);
    });
  });
};

export default setupSocket;

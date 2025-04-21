import fs from 'fs'; 
import path from 'path';
import Room from '../models/Room.js';
import Player from '../models/Players.js';

// Load questions from JSON
const questionsPath = path.resolve('./questions.json');
let questionBank = {};

try {
  const data = fs.readFileSync(questionsPath, 'utf8');
  questionBank = JSON.parse(data);
  console.log('✅ Questions loaded successfully.');
} catch (err) {
  console.error('❌ Failed to load questions.json:', err);
}

// Utility to get a random question
const getRandomQuestion = (subject) => {
  const pool = questionBank[subject] || [];
  return pool.length ? pool[Math.floor(Math.random() * pool.length)] : null;
};

// Knockout states per room
const knockoutStates = new Map();

const setupSocket = (io) => {
  io.on('connection', (socket) => {
    console.log('🔌 Socket connected:', socket.id);

    // When a player joins the room
    socket.on('join-room', async ({ code, name }) => {
      try {
        socket.join(code);
        const player = await Player.findOne({ name, roomCode: code });

        if (!player) {
          console.error(`❌ Player not found: name=${name}, roomCode=${code}`);
          return;
        }

        player.socketId = socket.id;
        await player.save();

        socket.emit('joined-room', {
          playerId: player._id.toString(),
          playerName: player.name,
        });

        const room = await Room.findOne({ code }).populate('players');
        if (room) {
          io.to(code).emit('update-players', room.players);
        } else {
          console.error(`❌ Room not found with code: ${code}`);
        }
      } catch (err) {
        console.error('❌ Error in join-room:', err);
      }
    });

    // When the game is started
    socket.on('start-knockout-game', async ({ code, subject }) => {
      try {
        const room = await Room.findOne({ code }).populate('players');
        if (!room) {
          console.error(`❌ Room not found with code: ${code}`);
          return;
        }

        room.subject = subject;
        room.isGameStarted = true;
        await room.save();

        io.to(code).emit('game-started', room.players);

        const players = room.players.map(p => ({ id: p._id.toString(), name: p.name }));
        if (players.length < 2) {
          io.to(code).emit('error', 'Not enough players to start.');
          return;
        }

        // Initialize knockout state
        knockoutStates.set(code, {
          subject,
          remaining: [...players.sort(() => 0.5 - Math.random())],
        });

        console.log(`🟢 Knockout game started in room ${code} with subject: ${subject}`);
        startNextPair(io, code);
      } catch (err) {
        console.error('❌ Error in start-knockout-game:', err);
      }
    });

    // When a player answers a question
    socket.on('player-answer', ({ code, playerId, answer }) => {
      const state = knockoutStates.get(code);
      if (!state || !state.currentPair?.some(p => p.id === playerId)) return;

      state.answers = state.answers || {};
      if (state.answers[playerId]) return;

      state.answers[playerId] = { answer, time: Date.now() };

      console.log(`✅ Answer received from ${playerId}: ${answer}`);

      const [p1, p2] = state.currentPair;
      if (state.answers[p1.id] && state.answers[p2.id]) {
        decideRoundWinner(io, code);
      }
    });

    // When the game is started
    socket.on('start-game', async (code) => {
      try {
        const room = await Room.findOne({ code }).populate('players');
        if (!room) {
          console.error(`❌ Room not found with code: ${code}`);
          return;
        }

        room.isGameStarted = true;
        await room.save();

        io.to(code).emit('game-started', room.players);
        io.to(code).emit('redirect-to-game', { code });
      } catch (err) {
        console.error('❌ Error in start-game:', err);
      }
    });

    // When the socket disconnects
    socket.on('disconnect', () => {
      console.log('🚫 Socket disconnected:', socket.id);
    });
  });
};

// Helper to start the next round
const startNextPair = (io, code) => {
  const state = knockoutStates.get(code);
  if (!state || state.remaining.length < 2) {
    io.to(code).emit('game-ended', {
      winner: state?.remaining?.[0] || null,
    });
    knockoutStates.delete(code);
    console.log(`🏁 Game ended in room ${code}`);
    return;
  }

  const [p1, p2, ...rest] = state.remaining;
  const question = getRandomQuestion(state.subject);

  if (!question) {
    console.error(`❌ No questions found for subject: ${state.subject}`);
    io.to(code).emit('error', 'No questions found.');
    return;
  }

  const timer = 30;

  state.currentPair = [p1, p2];
  state.remaining = rest;
  state.lastQuestion = question;
  state.answers = {};
  knockoutStates.set(code, state);

  // Log round details
  console.log(`▶️ New round in room ${code}`);
  console.log(`👥 Current Pair: ${p1.name} vs ${p2.name}`);
  console.log(`❓ Question: ${question.question}`);
  console.log(`🔢 Options:`, question.options);

  // Emit to frontend with allowed player IDs for this pair
  io.to(code).emit('knockout-round-started', {
    players: [p1, p2],
    question,
    timer,
    allowedPlayerIds: [p1.id, p2.id], // Send the allowed player IDs
  });

  setTimeout(() => {
    const currentState = knockoutStates.get(code);
    if (
      currentState?.answers?.[p1.id] &&
      currentState?.answers?.[p2.id]
    ) return;

    decideRoundWinner(io, code);
  }, timer * 1000);
};

// Decide winner of the round
const decideRoundWinner = (io, code) => {
  const state = knockoutStates.get(code);

  if (!state || !Array.isArray(state.currentPair) || state.currentPair.length !== 2) {
    console.error(`❌ Invalid currentPair for room ${code}:`, state?.currentPair);
    return;
  }

  const [p1, p2] = state.currentPair;
  const correct = state.lastQuestion.answer;

  const a1 = state.answers[p1.id];
  const a2 = state.answers[p2.id];

  const p1Correct = a1?.answer === correct;
  const p2Correct = a2?.answer === correct;

  let winner;

  if (p1Correct && !p2Correct) {
    winner = p1;
  } else if (!p1Correct && p2Correct) {
    winner = p2;
  } else if (p1Correct && p2Correct) {
    winner = a1.time < a2.time ? p1 : p2;
  } else {
    winner = Math.random() > 0.5 ? p1 : p2;
  }

  const loser = winner.id === p1.id ? p2 : p1;

  // Log round result
  console.log(`🏁 Round Result in room ${code}`);
  console.log(`✅ Correct answer: ${correct}`);
  console.log(`📊 ${p1.name}: ${a1?.answer} (${p1Correct ? '✔️' : '❌'})`);
  console.log(`📊 ${p2.name}: ${a2?.answer} (${p2Correct ? '✔️' : '❌'})`);
  console.log(`🏆 Winner: ${winner.name}, ❌ Eliminated: ${loser.name}`);

  state.remaining.push(winner);
  delete state.answers;
  delete state.currentPair;
  knockoutStates.set(code, state);

  setTimeout(() => startNextPair(io, code), 2000);
};

export default setupSocket;

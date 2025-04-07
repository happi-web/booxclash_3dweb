import Room from '../models/Room.js';
import Player from '../models/Players.js';

const setupSocket = (io) => {
  io.on('connection', (socket) => {
    console.log('Socket connected:', socket.id);

    // When a player joins a room
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

    // When a player re-joins the room
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

    // NEW: When the host starts the knockout game
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
      } catch (err) {
        console.error('Error in start-knockout-game:', err);
      }
    });

    // Optional: legacy support if using 'start-game' separately
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

    // Handle disconnections
    socket.on('disconnect', () => {
      console.log('Socket disconnected:', socket.id);
    });
  });
};

export default setupSocket;

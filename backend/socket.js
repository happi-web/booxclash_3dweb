import GameRoom from './models/GameRoom.js';

const handleSocketConnection = (io) => {
  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    socket.on('host-room', async ({ roomCode, hostName }) => {
      socket.join(roomCode);
      console.log(`Host ${hostName} created room ${roomCode}`);
    });

    socket.on('join-room', async ({ roomCode, playerName }) => {
      socket.join(roomCode);

      const room = await GameRoom.findOne({ roomCode });

      if (!room || !room.isActive) {
        socket.emit('error', 'Room not found or inactive');
        return;
      }

      if (room.players.length >= room.maxPlayers) {
        socket.emit('room-full');
        return;
      }

      room.players.push({ name: playerName, socketId: socket.id });
      await room.save();

      io.to(roomCode).emit('update-players', room.players);
    });

    socket.on('disconnect', async () => {
      const room = await GameRoom.findOne({ 'players.socketId': socket.id });
      if (room) {
        room.players = room.players.filter(p => p.socketId !== socket.id);
        await room.save();
        io.to(room.roomCode).emit('update-players', room.players);
      }
    });
  });
};

export default handleSocketConnection;

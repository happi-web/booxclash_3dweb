import Room from '../models/Room.js';
import Player from '../models/Players.js';

// Create a new room
export const createRoom = async (req, res) => {
  const { hostName, numberOfPlayers, questionType, difficultyLevel, includeHost } = req.body;

  if (!numberOfPlayers || isNaN(numberOfPlayers)) {
    return res.status(400).json({ error: 'Number of players is required and must be a valid number.' });
  }

  const code = Math.random().toString(36).substring(2, 7).toUpperCase();

  const room = new Room({
    code,
    host: hostName,
    numberOfPlayers: parseInt(numberOfPlayers, 10),
    questionType,
    difficultyLevel,
    includeHost,
    players: [], // Initially no players
  });

  // Add the host to the players list if 'includeHost' is true
  if (includeHost) {
    const hostPlayer = new Player({ name: hostName, roomCode: code });
    await hostPlayer.save();
    room.players.push(hostPlayer._id);
  }

  await room.save();

  res.json({ code });
};


// Join an existing room
export const joinRoom = async (req, res) => {
  const { name, code } = req.body;

  // Find the room by its code
  const room = await Room.findOne({ code }).populate('players');
  if (!room) return res.status(404).json({ error: 'Room not found' });

  // Get the current number of players in the room
  const currentPlayerCount = room.players.length;

  // Determine the maximum number of players (including host if necessary)
  const maxPlayers = room.includeHost ? room.numberOfPlayers : room.numberOfPlayers;

  // Check if the room is full
  if (currentPlayerCount >= maxPlayers) {
    return res.status(400).json({ error: 'Room is full' });
  }

  // Create a new player and save it to the database
  const player = new Player({ name, roomCode: code });
  await player.save();

  // Add the player to the room's players list
  room.players.push(player._id);
  await room.save();

  res.json({ success: true });
};

import Room from '../models/Room.js';

export const createRoom = async (req, res) => {
  try {
    const {
      roomId,
      subject,
      numPlayers,
      hostName,
      hostCountry,
      hostIsPlayer,
      players = [],
    } = req.body;

    const existing = await Room.findOne({ roomId });
    if (existing) {
      return res.status(400).json({ message: 'Room already exists.' });
    }

    const initialPlayers = hostIsPlayer
      ? [{ name: hostName, country: hostCountry }]
      : [];

    const room = await Room.create({
      roomId,
      subject,
      numPlayers,
      hostName,
      hostCountry,
      hostIsPlayer,
      players: initialPlayers,
    });

    res.status(201).json({ roomId: room.roomId });
  } catch (error) {
    console.error('Error creating room:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getRoomById = async (req, res) => {
  try {
    const { roomId } = req.params;
    const room = await Room.findOne({ roomId });

    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    res.json({
      roomId: room.roomId,
      subject: room.subject,
      numPlayers: room.numPlayers,
      hostName: room.hostName,
      hostCountry: room.hostCountry,
      hostIsPlayer: room.hostIsPlayer,
      players: room.players,
    });
  } catch (error) {
    console.error('Error fetching room:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
// Get players by roomId
export const getPlayersInRoom = async (req, res) => {
  try {
    const { roomId } = req.params;
    const room = await Room.findOne({ roomId });

    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    res.status(200).json({ players: room.players });
  } catch (err) {
    console.error("Error fetching players:", err);
    res.status(500).json({ message: "Server error" });
  }
};


export const joinRoom = async (req, res) => {
  const { roomId, name, country } = req.body;

  if (!roomId || !name || !country) {
    return res.status(400).json({ message: "All fields are required." });
  }

  try {
    const room = await Room.findOne({ roomId });

    if (!room) {
      return res.status(404).json({ message: "Room not found." });
    }

    // Check if room is full
    if (room.players.length >= room.numPlayers) {
      return res.status(400).json({ message: "Room is full." });
    }

    // Check if player already exists
    const alreadyJoined = room.players.some((player) => player.name === name);
    if (alreadyJoined) {
      return res.status(200).json({ message: "Player already in room." });
    }

    // Add player to the room
    room.players.push({ name, country });
    await room.save();

    return res.status(200).json({ message: "Joined the room successfully." });
  } catch (err) {
    console.error("Join room error:", err);
    return res.status(500).json({ message: "Server error. Try again later." });
  }
};

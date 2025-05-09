import GameRoom from '../models/GameRoom.js';

export const createRoom = async (req, res) => {
  try {
    const { roomCode, hostName, subject, maxPlayers } = req.body;

    const room = new GameRoom({
      roomCode,
      hostName,
      subject,
      maxPlayers,
      players: [{ name: hostName }],
    });

    await room.save();
    res.status(201).json(room);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create room' });
  }
};

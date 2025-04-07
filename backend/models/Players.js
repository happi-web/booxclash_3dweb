import mongoose from 'mongoose';

const PlayerSchema = new mongoose.Schema({
  name: String,
  socketId: String,
  roomCode: String,
  eliminated: { type: Boolean, default: false },
});

const Player = mongoose.model('Player', PlayerSchema);
export default Player;

import mongoose from 'mongoose';

const playerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  country: { type: String, required: true },
});

const roomSchema = new mongoose.Schema({
  roomId: { type: String, required: true, unique: true },
  subject: { type: String, required: true },
  numPlayers: { type: Number, required: true }, // Max total players
  hostName: { type: String, required: true },
  hostCountry: { type: String, required: true },
  hostIsPlayer: { type: Boolean, default: false },
  players: [playerSchema],
});

const Room = mongoose.model('Room', roomSchema);
export default Room;

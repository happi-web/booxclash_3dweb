import mongoose from 'mongoose';

const roomSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  host: { type: String, required: true },
  players: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Player' }],
  isGameStarted: { type: Boolean, default: false },
  numberOfPlayers: { type: Number, required: true },

  questionType: {
    type: String,
    enum: ['Math', 'Science', 'General'],
    required: true
  },

  difficultyLevel: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    required: true
  },

  // ✅ New fields to store selected quiz options
  subject: { type: String },
  contentType: { type: String },
  contentList: [{ type: String }],
});

export default mongoose.model('Room', roomSchema);

import mongoose from "mongoose";

const MaterialSchema = new mongoose.Schema({
  label: { type: String, required: true },
  type: { type: String, enum: ["image"], required: true },
  src: { type: String, required: true },
});

const QuestionSchema = new mongoose.Schema({
  prompt: { type: String, required: true },
  answer: { type: String, required: true },
});

const LessonContentSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    subject: { type: String, required: true },
    topic: { type: String, required: true },
    level: { type: Number, required: true },
    explanation: { type: String },
    videoLink: { type: String },
    instructions: { type: String },

    // Newly added fields
    materials: { type: [MaterialSchema], default: [] },
    questions: { type: [QuestionSchema], default: [] },
  },
  { timestamps: true }
);

const LessonContent =
  mongoose.models.LessonContent ||
  mongoose.model("LessonContent", LessonContentSchema);

export default LessonContent;

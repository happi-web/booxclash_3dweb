import mongoose from "mongoose";

const LessonContentSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    subject: { type: String, required: true },
    topic: { type: String, required: true },
    level: { type: Number, required: true },
    explanation: { type: String },
    videoLink: { type: String },
    instructions: { type: String },

    // Updated fields
    componentLink: { type: String, required: true }, // New field for the component link
  },
  { timestamps: true }
);

const LessonContent =
  mongoose.models.LessonContent ||
  mongoose.model("LessonContent", LessonContentSchema);

export default LessonContent;

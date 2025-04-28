import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    country: { type: String },
    city: { type: String },
    role: { type: String, required: true }, // e.g., "student", "educator", "admin"
    gradeLevel: { type: String }, // Optional: for students, e.g., "Grade 7" to "Grade 12"
    verified: { type: Boolean, default: false },
    profilePic: { type: String, default: "" }, // Optional: profile picture path
  },
  {
    timestamps: true,
  }
);

// Main model
const User = mongoose.model("User", userSchema);

// Optional helper methods for reuse
const findOne = (query) => User.findOne(query);
const findById = (id) => User.findById(id);
const findByIdAndUpdate = (id, update, options = { new: true }) =>
  User.findByIdAndUpdate(id, update, options);
const findByIdAndDelete = (id) => User.findByIdAndDelete(id);
const find = (filter = {}) => User.find(filter);

export default User;
export {
  findOne,
  findById,
  findByIdAndUpdate,
  findByIdAndDelete,
  find,
};

import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  country: { type: String },
  city: { type: String },
  role: { type: String, required: true },
  verified: { type: Boolean, default: false },
}, {
  timestamps: true,
});

const User = mongoose.model("User", userSchema);

// Helper methods (optional, but clean)
const findOne = (query) => User.findOne(query);
const findByIdAndUpdate = (id, update) => User.findByIdAndUpdate(id, update);

export default User;
export { findOne, findByIdAndUpdate };

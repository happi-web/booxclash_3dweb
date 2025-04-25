import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const JWT_SECRET = process.env.JWT_SECRET;

export const signup = async (req, res) => {
  try {
    const { email, password } = req.body;

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ error: "Email already used" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({ ...req.body, password: hashedPassword });
    await user.save();

    const safeUser = {
      _id: user._id,
      email: user.email,
      name: user.name,
      username: user.username,
      country: user.country,
      city: user.city,
      role: user.role,
    };

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

    res
      .cookie("token", token, {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        maxAge: 3600000,
      })
      .status(201)
      .json({ message: "Signup successful", user: safeUser, token });

  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ error: "Server error during signup" });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "User not found" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: "Invalid credentials" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

    console.log("Generated Token:", token);

    const safeUser = {
      _id: user._id,
      email: user.email,
      name: user.name,
      username: user.username,
      country: user.country,
      city: user.city,
      role: user.role,
    };

    res
      .cookie("token", token, {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        maxAge: 3600000,
      })
      .json({ message: "Login successful", user: safeUser, token });

  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Server error during login" });
  }
};

export const logout = (req, res) => {
  res.clearCookie("token").json({ message: "Logged out" });
};

export const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("name country email");
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (err) {
    console.error("Error in getCurrentUser:", err);
    res.status(500).json({ error: "Server error" });
  }
};

export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ error: "User not found" });

    res.json(user);
  } catch (err) {
    console.error("Error in getProfile:", err);
    res.status(500).json({ error: "Server error" });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) return res.status(404).json({ error: "User not found" });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return res.status(401).json({ error: "Incorrect current password" });

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ message: "Password updated successfully" });
  } catch (err) {
    console.error("Change password error:", err);
    res.status(500).json({ error: "Server error while changing password" });
  }
};

export const uploadProfilePic = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded." });
    }

    const imageUrl = req.file.filename; // Save only filename in DB

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { profilePic: imageUrl },
      { new: true }
    ).select("-password");

    res.json(updatedUser);
  } catch (err) {
    console.error("Profile picture upload error:", err);
    res.status(500).json({ error: "Failed to update profile picture." });
  }
};

export const getAllStudents = async (req, res) => {
  try {
    const students = await User.find({ role: 'student' });
    res.status(200).json(students);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch students' });
  }
};

export const deleteStudent = async (req, res) => {
  const { id } = req.params;
  try {
    await User.findByIdAndDelete(id);
    res.status(200).json({ message: 'Student removed' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete student' });
  }
};

export const addStudent = async (req, res) => {
  try {
    const newStudent = new User({ ...req.body, role: 'student' });
    await newStudent.save();
    res.status(201).json(newStudent);
  } catch (err) {
    res.status(500).json({ error: 'Failed to add student' });
  }
};

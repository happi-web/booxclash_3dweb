import jwt from "jsonwebtoken";
import User from "../models/User.js"; // 👈 import your User model

const JWT_SECRET = process.env.JWT_SECRET;

export const protect = async (req, res, next) => {
  const token = req.cookies.token;

  if (!token) return res.status(401).json({ error: "Access denied" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id); // 👈 fetch full user from DB

    if (!user) return res.status(401).json({ error: "User not found" });

    req.user = user; // 👈 now req.user has full Mongo document (with _id)
    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid token" });
  }
};

import express from "express";
import { signup, login, logout,getCurrentUser } from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);
router.get('/current-user', protect, getCurrentUser);

// Example protected route
router.get("/profile", protect, (req, res) => {
  res.json({ message: "Protected profile route", user: req.user });
});

export default router;

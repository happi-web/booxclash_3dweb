import { Router } from "express";
import fs from "fs";
import path from "path";
const router = Router();

import {
  signup,
  login,
  logout,
  getProfile,
  uploadProfilePic,
  changePassword,
  getAllStudents,
  deleteStudent,
  addStudent
} from "../controllers/authController.js";
import multer from "multer";

import { protect } from "../middleware/authMiddleware.js";

// Public routes
router.post("/signup", signup);
router.post("/login", login);

// Protected routes
router.get("/logout", protect, logout);
router.get("/profile", protect, getProfile);
router.post("/change-password", protect, changePassword);

router.get('/students', getAllStudents);
router.delete('/students:id', deleteStudent);
router.post('/students', addStudent);

const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}
// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Only image files are allowed!"), false);
    }
    cb(null, true);
  },
});

router.post("/upload-profile-pic", protect, upload.single("profilePic"), uploadProfilePic);


export default router;

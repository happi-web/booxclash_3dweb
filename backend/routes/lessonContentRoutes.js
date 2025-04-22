import express from "express";
import {
  saveLessonContent,
  getLessonContent,
  getAllLessonContent,
  deleteLessonContent,
} from "../controllers/lessonContentController.js";

const router = express.Router();

router.post("/save", saveLessonContent);           // Create or update
router.get("/get", getLessonContent);              // Get one by query
router.get("/get-all", getAllLessonContent);       // Get all
router.delete("/delete/:id", deleteLessonContent); // Delete by ID

export default router;

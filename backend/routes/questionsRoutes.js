import express from "express";
import { getQuestions } from "../controllers/questionsController.js";

const router = express.Router();

// Route: /api/questions/:subject/:level
router.get("/:subject/:level", getQuestions);

export default router;

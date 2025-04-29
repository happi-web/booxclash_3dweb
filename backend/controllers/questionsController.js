import { promises as fs } from "fs";
import path from "path";

export const getQuestions = async (req, res) => {
  const { subject, level } = req.params;

  console.log(`Request received for subject: ${subject}, level: ${level}`);

  const filePath = path.resolve("data", "questions.json");

  try {
    const data = await fs.readFile(filePath, "utf8");
    const questionsData = JSON.parse(data);
    const subjectQuestions = questionsData[subject]?.[level];

    if (!subjectQuestions || !Array.isArray(subjectQuestions) || subjectQuestions.length === 0) {
      console.warn(`No questions found for ${subject} - ${level}`);
      return res.status(404).json({ message: "Questions not found." });
    }

    // Shuffle questions
    const shuffled = subjectQuestions.sort(() => Math.random() - 0.5);

    // Limit to first 10 questions (or fewer)
    const selectedQuestions = shuffled.slice(0, 10);

    console.log(`Sending ${selectedQuestions.length} questions for ${subject} - ${level}`);
    res.json(selectedQuestions);
  } catch (err) {
    console.error("Error loading or parsing questions:", err);
    res.status(500).json({ error: "Failed to load questions." });
  }
};

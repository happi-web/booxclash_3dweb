import fs from "fs";
import path from "path";

export const getQuestions = (req, res) => {
  const { subject, level } = req.params;

  console.log(`Request received for subject: ${subject}, level: ${level}`);

  const filePath = path.resolve("data", "questions.json");

  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) {
      console.error("Error reading questions file:", err);
      return res.status(500).json({ error: "Failed to read questions." });
    }

    try {
      const questionsData = JSON.parse(data);

      if (!questionsData[subject] || !questionsData[subject][level]) {
        console.warn(`No questions found for ${subject} - ${level}`);
        return res.status(404).json({ message: "Questions not found." });
      }

      const questions = questionsData[subject][level];
      console.log(`Sending ${questions.length} questions for ${subject} - ${level}`);
      res.json(questions);
    } catch (parseError) {
      console.error("Error parsing questions JSON:", parseError);
      res.status(500).json({ error: "Invalid question format." });
    }
  });
};

import LessonContent from "../models/LessonContent.js";

// Save or Update Lesson Content
export const saveLessonContent = async (req, res) => {
  const {
    id,
    subject,
    topic,
    level,
    explanation,
    videoLink,
    instructions,
    componentLink,  // Use componentLink instead of materials and questions
  } = req.body;

  try {
    const updated = await LessonContent.findOneAndUpdate(
      { id },
      {
        subject,
        topic,
        level,
        explanation,
        videoLink,
        instructions,
        componentLink,  // Store the component link
      },
      { new: true, upsert: true }
    );
    res.status(200).json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to save lesson content" });
  }
};

// Get one lesson content by query
export const getLessonContent = async (req, res) => {
  const { subject, topic, level } = req.query;

  try {
    const query = {};
    if (subject) query.subject = subject;
    if (topic) query.topic = topic;
    if (level) query.level = Number(level);

    const content = await LessonContent.findOne(query);
    if (!content) return res.status(404).json({ error: "Content not found" });

    res.status(200).json(content);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error fetching lesson content" });
  }
};

// Get all lessons
export const getAllLessonContent = async (req, res) => {
  try {
    const all = await LessonContent.find();
    res.status(200).json(all);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch lesson contents" });
  }
};

// Delete a lesson by ID
export const deleteLessonContent = async (req, res) => {
  const { id } = req.params;
  try {
    const deleted = await LessonContent.findOneAndDelete({ id });
    if (!deleted) return res.status(404).json({ error: "Lesson not found" });
    res.status(200).json({ message: "Deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete lesson" });
  }
};

// No need for getQuestionsByTopic anymore since we removed the questions field

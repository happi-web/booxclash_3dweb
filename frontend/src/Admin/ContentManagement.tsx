import React, { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import GamesUpload from "./GamesUpload";

type Lesson = {
  id: string;
  subject: string;
  topic: string;
  level: number;
  explanation: string;
  videoLink: string;
  instructions: string;
  componentLink: string;
};

const fields: (keyof Pick<
  Lesson,
  "topic" | "level" | "explanation" | "videoLink" | "instructions" | "componentLink"
>)[] = ["topic", "level", "explanation", "videoLink", "instructions", "componentLink"];

const defaultLesson = (): Lesson => ({
  id: uuidv4(),
  subject: "Math",
  topic: "",
  level: 1,
  explanation: "",
  videoLink: "",
  instructions: "",
  componentLink: "",
});

const ContentManagement: React.FC = () => {
  const [content, setContent] = useState<Lesson>(defaultLesson());
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const API_BASE = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    fetchLessons();
  }, []);

  const fetchLessons = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/lesson-content/get-all`);
      const data = await res.json();
      setLessons(data);
    } catch (err) {
      console.error("Error fetching lessons:", err);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setContent((prev) => ({
      ...prev,
      [name]: name === "level" ? +value : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_BASE}/api/lesson-content/save`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(content),
      });

      if (!response.ok) throw new Error("Failed to save");

      await fetchLessons();
      setContent(defaultLesson()); // reset
      setEditingId(null);
      alert("Content saved!");
    } catch (err) {
      console.error(err);
      alert("Save failed.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this lesson?")) return;
    try {
      await fetch(`${API_BASE}/api/lesson-content/delete/${id}`, {
        method: "DELETE",
      });
      await fetchLessons();
    } catch (err) {
      console.error("Error deleting lesson:", err);
    }
  };

  const handleEdit = (lesson: Lesson) => {
    setContent(lesson);
    setEditingId(lesson.id);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-xl shadow-md">
      <h2 className="text-2xl font-bold mb-4">
        {editingId ? "Edit Content" : "Create Content"}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">ID (auto-generated)</label>
          <input
            type="text"
            name="id"
            value={content.id}
            readOnly
            className="w-full mt-1 border rounded p-2 bg-gray-100 cursor-not-allowed"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Subject</label>
          <select
            name="subject"
            value={content.subject}
            onChange={handleChange}
            className="w-full mt-1 border rounded p-2"
          >
            <option value="Math">Math</option>
            <option value="Chemistry">Chemistry</option>
            <option value="Physics">Physics</option>
            <option value="Biology">Biology</option>
          </select>
        </div>

        {fields.map((field) => (
          <div key={field}>
            <label className="block text-sm font-medium capitalize">{field}</label>
            {field === "explanation" || field === "instructions" ? (
              <textarea
                name={field}
                value={content[field]}
                onChange={handleChange}
                rows={3}
                className="w-full mt-1 border rounded p-2"
              />
            ) : (
              <input
                type={field === "level" ? "number" : "text"}
                name={field}
                value={content[field]}
                onChange={handleChange}
                className="w-full mt-1 border rounded p-2"
              />
            )}
          </div>
        ))}

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
        >
          {editingId ? "Update" : "Save"} Content
        </button>
      </form>
        <GamesUpload/>
      <div className="mt-10">
        <h3 className="text-xl font-semibold mb-2">Saved Lessons</h3>
        {lessons.length === 0 ? (
          <p className="text-gray-500">No lessons available.</p>
        ) : (
          <ul className="space-y-3">
            {lessons.map((lesson) => (
              <li
                key={lesson.id}
                className="border rounded p-3 bg-gray-50 flex justify-between items-start"
              >
                <div>
                  <strong>{lesson.topic}</strong> ({lesson.subject} - Level {lesson.level})
                  <p className="text-sm mt-1">
                    {lesson.instructions.slice(0, 100)}...
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    Component Link: {lesson.componentLink}
                  </p>
                </div>
                <div className="space-x-2">
                  <button
                    onClick={() => handleEdit(lesson)}
                    className="px-3 py-1 bg-yellow-500 text-white rounded text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(lesson.id)}
                    className="px-3 py-1 bg-red-600 text-white rounded text-sm"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default ContentManagement;

import React, { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid"; // npm install uuid

type Material = {
  label: string;
  type: "image";
  src: string;
};

type Question = {
  prompt: string;
  answer: string;
};

type Lesson = {
  id: string;
  subject: string;
  topic: string;
  level: number;
  explanation: string;
  videoLink: string;
  instructions: string;
  materials: Material[];
  questions: Question[];
};

// Only include fields that are string or number
const fields: (keyof Pick<
  Lesson,
  "topic" | "level" | "explanation" | "videoLink" | "instructions"
>)[] = ["topic", "level", "explanation", "videoLink", "instructions"];

const defaultLesson = (): Lesson => ({
  id: uuidv4(),
  subject: "Math",
  topic: "",
  level: 1,
  explanation: "",
  videoLink: "",
  instructions: "",
  materials: [],
  questions: Array.from({ length: 5 }, () => ({ prompt: "", answer: "" })),
});

const ContentManagement: React.FC = () => {
  const [content, setContent] = useState<Lesson>(defaultLesson());
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    fetchLessons();
  }, []);

  const fetchLessons = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/lesson-content/get-all");
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
      const response = await fetch("http://localhost:5000/api/lesson-content/save", {
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
      await fetch(`http://localhost:5000/api/lesson-content/delete/${id}`, {
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
        {/* ID Field */}
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

        {/* Subject Dropdown */}
        <div>
          <label className="block text-sm font-medium">Subject</label>
          <select
            name="subject"
            value={content.subject}
            onChange={handleChange}
            className="w-full mt-1 border rounded p-2"
          >
            <option value="Math">Math</option>
            <option value="English">English</option>
            <option value="Science">Science</option>
          </select>
        </div>

        {/* Fields */}
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

        {/* Upload Materials */}
        <div>
          <label className="block text-sm font-medium">Materials (images)</label>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => {
              const files = Array.from(e.target.files || []);
              const newMaterials: Material[] = files.map((file) => ({
                label: file.name,
                type: "image",
                src: URL.createObjectURL(file),
              }));

              setContent((prev) => ({
                ...prev,
                materials: [...prev.materials, ...newMaterials],
              }));
            }}
          />
          <div className="mt-2 flex gap-2 flex-wrap">
            {content.materials.map((mat, i) => (
              <div key={i} className="border rounded p-1">
                <img
                  src={mat.src}
                  alt={mat.label}
                  className="w-16 h-16 object-cover"
                />
                <p className="text-xs text-center">{mat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Questions */}
        <div>
          <label className="block text-sm font-medium mb-2">Lesson Questions (5)</label>
          {content.questions.map((q, idx) => (
            <div key={idx} className="mb-2">
              <label className="block text-xs font-semibold">
                Question {idx + 1}
              </label>
              <input
                type="text"
                placeholder="Prompt"
                value={q.prompt}
                onChange={(e) => {
                  const updated = [...content.questions];
                  updated[idx].prompt = e.target.value;
                  setContent((prev) => ({ ...prev, questions: updated }));
                }}
                className="w-full border rounded p-1 mt-1 mb-1"
              />
              <input
                type="text"
                placeholder="Answer"
                value={q.answer}
                onChange={(e) => {
                  const updated = [...content.questions];
                  updated[idx].answer = e.target.value;
                  setContent((prev) => ({ ...prev, questions: updated }));
                }}
                className="w-full border rounded p-1"
              />
            </div>
          ))}
        </div>

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
        >
          {editingId ? "Update" : "Save"} Content
        </button>
      </form>

      {/* Lesson List */}
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
                  <strong>{lesson.topic}</strong> ({lesson.subject} - Level{" "}
                  {lesson.level})
                  <p className="text-sm mt-1">
                    {lesson.instructions.slice(0, 100)}...
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

import React, { useEffect, useState } from "react";

type TopicsGridProps = {
  subject: string;
  level: number;
  onTopicSelect: (topic: string) => void;
};

type LessonContent = {
  id: string;
  subject: string;
  topic: string;
  level: number;
  explanation: string;
  videoLink: string;
  instructions: string;
};

const TopicsGrid: React.FC<TopicsGridProps> = ({ subject, level, onTopicSelect }) => {
  const [topics, setTopics] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const API_BASE = import.meta.env.VITE_API_BASE_URL;
  const colors = [
    "bg-purple-500 hover:bg-purple-600",
    "bg-orange-500 hover:bg-orange-600",
    "bg-blue-500 hover:bg-blue-600",
  ];

  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/lesson-content/get-all`);
        const data: LessonContent[] = await res.json();

        const filteredTopics = data
          .filter((item) => item.subject === subject && item.level === level)
          .map((item) => item.topic);

        const uniqueTopics = Array.from(new Set(filteredTopics));
        setTopics(uniqueTopics);
      } catch (err) {
        console.error("Failed to fetch topics", err);
        setError("Failed to load topics.");
      } finally {
        setLoading(false);
      }
    };

    fetchTopics();
  }, [subject, level]);

  if (loading) return <p className="p-4">Loading topics...</p>;
  if (error) return <p className="p-4 text-red-600">{error}</p>;

  return (
    <div className="p-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
      {topics.map((topic, index) => {
        const colorClass = colors[index % colors.length];

        return (
          <div
            key={topic}
            onClick={() => onTopicSelect(topic)}
            className={`text-white p-6 rounded-xl shadow-lg cursor-pointer transition-all transform hover:scale-105 ${colorClass}`}
          >
            <h3 className="text-lg font-bold text-center capitalize">{topic}</h3>
          </div>
        );
      })}
    </div>
  );
};

export default TopicsGrid;

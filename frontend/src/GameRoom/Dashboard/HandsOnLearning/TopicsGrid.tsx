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

  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/lesson-content/get-all");
        const data: LessonContent[] = await res.json();

        const filteredTopics = data
          .filter((item) => item.subject === subject && item.level === level)
          .map((item) => item.topic);

        const uniqueTopics = Array.from(new Set(filteredTopics)); // remove duplicates

        setTopics(uniqueTopics);
        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch topics", err);
        setError("Failed to load topics.");
        setLoading(false);
      }
    };

    fetchTopics();
  }, [subject, level]);

  if (loading) return <p className="p-4">Loading topics...</p>;
  if (error) return <p className="p-4 text-red-600">{error}</p>;

  return (
    <div className="p-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {topics.map((topic) => (
        <div
          key={topic}
          onClick={() => onTopicSelect(topic)}
          className="bg-white p-6 rounded-lg shadow cursor-pointer hover:bg-blue-100 transition"
        >
          <h3 className="text-lg font-bold text-center">{topic}</h3>
        </div>
      ))}
    </div>
  );
};

export default TopicsGrid;

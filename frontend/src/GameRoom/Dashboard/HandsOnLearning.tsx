// HandsOnActivities.tsx
import { useState } from "react";
import TopicsGrid from "./HandsOnLearning/TopicsGrid";
import LessonInterface from "./HandsOnLearning/LessonInterface";
import NavBar from "./HandsOnLearning/Navbar";

export default function HandsOnActivities() {
  const [selectedSubject, setSelectedSubject] = useState<string>("Math");
  const [selectedLevel, setSelectedLevel] = useState<number>(1);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);

  return (
    <div className="w-full min-h-screen bg-gray-50">
      <NavBar
        selectedSubject={selectedSubject}
        setSelectedSubject={setSelectedSubject}
        selectedLevel={selectedLevel}
        setSelectedLevel={setSelectedLevel}
      />

      {!selectedTopic ? (
        <TopicsGrid
          subject={selectedSubject}
          level={selectedLevel}
          onTopicSelect={(topic: string) => setSelectedTopic(topic)}
        />
      ) : (
        <LessonInterface
          subject={selectedSubject}
          level={selectedLevel}
          topic={selectedTopic}
          onBack={() => setSelectedTopic(null)}
        />
      )}
    </div>
  );
}
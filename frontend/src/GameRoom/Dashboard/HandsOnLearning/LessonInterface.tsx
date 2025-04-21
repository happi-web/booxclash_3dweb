import React, { useEffect, useState } from "react";
import CanvasInterface from "./CanvasInterface";

type LessonInterfaceProps = {
  subject: string;
  level: number;
  topic: string;
  onBack: () => void;
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

const LessonInterface: React.FC<LessonInterfaceProps> = ({
  subject,
  level,
  topic,
  onBack,
}) => {
  const [lessonContent, setLessonContent] = useState<LessonContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchLessonContent = async () => {
      try {
        const res = await fetch(
          `http://localhost:5000/api/lesson-content/get?subject=${subject}&level=${level}&topic=${topic}`
        );
        const data: LessonContent = await res.json();

        if (data) {
          setLessonContent(data);
        } else {
          setError("No content found for the selected topic.");
        }

        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch lesson content", err);
        setError("Failed to load content.");
        setLoading(false);
      }
    };

    fetchLessonContent();
  }, [subject, level, topic]);

  const extractYouTubeID = (url: string): string | null => {
    const regex =
      /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };
  

  if (loading) return <p className="p-4">Loading lesson content...</p>;
  if (error) return <p className="p-4 text-red-600">{error}</p>;

  // Check if lessonContent is not null before rendering
  if (!lessonContent) return <p className="p-4 text-red-600">No lesson content available.</p>;

  return (
    <div className="flex w-full h-[calc(100vh-100px)]">
      {/* Left Panel: KNOW / WATCH / DO */}
      <div className="w-1/2 p-6 bg-white border-r overflow-y-auto space-y-6">
        <button
          onClick={onBack}
          className="mb-4 text-blue-600 underline text-sm"
        >
          ← Back to topics
        </button>
  
        {/* KNOW Section */}
        <div>
          <h2 className="text-xl font-bold mb-2">KNOW</h2>
          <div className="bg-gray-50 p-4 rounded border">
            <p>{lessonContent.explanation}</p>
          </div>
        </div>
  
        {/* WATCH Section */}
        {lessonContent.videoLink && (
          <div>
            <h2 className="text-xl font-bold mb-2">WATCH</h2>
            <div className="bg-gray-50 p-4 rounded border">
              <p className="mb-2">Watch the video:</p>
              <div className="aspect-w-16 aspect-h-9">
                <iframe
                  className="w-full h-64 rounded"
                  src={`https://www.youtube.com/embed/${extractYouTubeID(lessonContent.videoLink)}`}
                  title="YouTube video player"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>
          </div>
        )}

  
        {/* DO Section */}
        <div>
          <h2 className="text-xl font-bold mb-2">DO</h2>
          <div className="bg-gray-50 p-4 rounded border">
            <ol className="list-decimal ml-6 space-y-1">
              {lessonContent.instructions
                .split("\n")
                .filter((line) => line.trim() !== "")
                .map((step, index) => (
                  <li key={index}>{step.trim()}</li>
                ))}
            </ol>
          </div>
        </div>

      </div>
  
      {/* Right Panel: Interactive Canvas */}
      <div className="w-1/2 p-6 bg-gray-100 overflow-y-auto">
        <h2 className="text-xl font-semibold mb-2">{lessonContent.topic} Canvas</h2>
        <div className="border rounded-lg bg-white p-4 shadow min-h-[300px]">
          <CanvasInterface/>
        </div>
      </div>
      </div>
  );

};

export default LessonInterface;

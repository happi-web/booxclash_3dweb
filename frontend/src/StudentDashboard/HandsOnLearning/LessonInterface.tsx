import React, { useEffect, useState, Suspense } from "react";
import { lessonComponentMap } from "./asserts/Lessons/lessonComponentMap";

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
  componentLink?: string;
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
  const [DynamicComponent, setDynamicComponent] = useState<React.ComponentType | null>(null);
  const API_BASE = import.meta.env.VITE_API_BASE_URL;
  const [step, setStep] = useState<"START" | "KNOW" | "WATCH" | "DO">("START");

  useEffect(() => {
    const fetchLessonContent = async () => {
      try {
        const res = await fetch(
          `${API_BASE}/api/lesson-content/get?subject=${subject}&level=${level}&topic=${topic}`
        );
        if (!res.ok) throw new Error("Network response was not ok");
        const data: LessonContent = await res.json();

        if (data) setLessonContent(data);
        else setError("No content found for the selected topic.");
      } catch (err) {
        console.error("Failed to fetch lesson content", err);
        setError("Failed to load content.");
      } finally {
        setLoading(false);
      }
    };

    fetchLessonContent();
  }, [subject, level, topic]);

useEffect(() => {
  if (lessonContent?.componentLink) {
    const Component = lessonComponentMap[lessonContent.componentLink];
    if (Component) {
      setDynamicComponent(() => Component);
    } else {
      console.warn("Component not found in map for:", lessonContent.componentLink);
      setDynamicComponent(null);
    }
  }
}, [lessonContent]);

  const extractYouTubeID = (url: string): string | null => {
    const regex = /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  if (loading) return <p className="p-4">Loading lesson content...</p>;
  if (error) return <p className="p-4 text-red-600">{error}</p>;
  if (!lessonContent) return <p className="p-4 text-red-600">No lesson content available.</p>;

  return (
    <div className="w-full h-[calc(100vh-100px)] bg-black text-orange-400 relative">
      {step === "START" && (
        <div className="flex flex-col items-center justify-center h-full space-y-4">
          <button
            onClick={onBack}
            className="text-blue-500 underline text-sm absolute top-4 left-4"
          >
            ← Back to topics
          </button>
          <h1 className="text-3xl font-bold">Ready to Learn?</h1>
          <button
            onClick={() => setStep("KNOW")}
            className="px-6 py-3 bg-orange-700 hover:bg-purple-800 rounded-lg text-purple-200 font-semibold"
          >
            Start
          </button>
        </div>
      )}

      {step === "KNOW" && (
        <div className="flex h-full overflow-hidden">
          <div className="w-3/4 p-4 max-h-full bg-purple-950 overflow-auto">
            <h2 className="text-xl font-semibold mb-4">{lessonContent.topic} - Concept</h2>
            <div className="border rounded-lg bg-white p-6 shadow whitespace-pre-line text-purple-950 leading-relaxed space-y-4">
              {lessonContent.explanation
                .split("\n")
                .filter((line) => line.trim() !== "")
                .map((para, index) => (
                  <p key={index}>{para.trim()}</p>
                ))}
            </div>
          </div>

          <div className="w-1/4 p-4 bg-purple-950 text-purple-950 border-l overflow-y-auto">
            <h2 className="text-xl font-bold mb-2 text-amber-100">Summary</h2>
            <div className="bg-white text-purple-950 p-4 rounded mb-4 text-sm whitespace-pre-line">
              <ul className="list-disc ml-5 space-y-2">
                {lessonContent.explanation
                  .split("\n")
                  .filter((line) => line.trim() !== "")
                  .slice(0, 4)
                  .map((point, index) => (
                    <li key={index}>{point.trim()}</li>
                  ))}
              </ul>
            </div>
          </div>

          <button
            onClick={() => setStep("WATCH")}
            className="absolute bottom-6 right-6 px-6 py-3 bg-orange-600 hover:bg-purple-700 rounded text-purple-100 font-bold"
          >
            Complete → Watch
          </button>
        </div>
      )}

      {step === "WATCH" && (
        <div className="p-8 h-full overflow-auto">
          <h2 className="text-2xl font-bold mb-4">Watch</h2>
          <div className="aspect-w-16 aspect-h-9 max-w-4xl mx-auto">
            <iframe
              className="w-full h-75 rounded"
              src={`https://www.youtube.com/embed/${extractYouTubeID(lessonContent.videoLink)}`}
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
          <button
            onClick={() => setStep("DO")}
            className="absolute bottom-6 right-6 px-6 py-3 bg-orange-600 hover:bg-purple-700 rounded text-purple-100 font-bold"
          >
            Complete → Do
          </button>
        </div>
      )}

      {step === "DO" && (
        <div className="flex h-full overflow-hidden">
          <div className="w-3/4 p-4 bg-purple-950 overflow-auto">
            <h2 className="text-xl font-semibold mb-2">{lessonContent.topic} Canvas</h2>
            <div className="border rounded-lg bg-white p-4 shadow min-h-[300px]">
              <Suspense fallback={<div>Loading activity...</div>}>
                {DynamicComponent ? (
                  <DynamicComponent />
                ) : (
                  <p className="text-gray-500">No interactive component available.</p>
                )}
              </Suspense>
            </div>
          </div>

          <div className="w-1/4 p-4 bg-black text-purple-500 border-l overflow-y-auto">
            <h2 className="text-xl font-bold mb-2">Instructions</h2>
            <div className="bg-white text-purple-500 p-4 rounded mb-4">
              <ol className="list-decimal ml-5 space-y-2">
                {lessonContent.instructions
                  .split("\n")
                  .filter((line) => line.trim() !== "")
                  .map((step, index) => (
                    <li key={index}>{step.trim()}</li>
                  ))}
              </ol>
            </div>
          </div>

          <button
            onClick={onBack}
            className="absolute bottom-6 right-6 px-6 py-3 bg-orange-600 hover:bg-purple-700 rounded text-purple-100 font-bold"
          >
            Complete → Back to Topics
          </button>
        </div>
      )}
    </div>
  );
};

export default LessonInterface;

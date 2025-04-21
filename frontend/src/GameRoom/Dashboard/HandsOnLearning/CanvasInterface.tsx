import React, { useState, useEffect,useRef } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

type StickType = "single" | "bundle";

interface Stick {
  id: number;
  type: StickType;
}

const questions = [17, 23, 8, 34, 45];

const StickItem: React.FC<{ stick: Stick }> = ({ stick }) => {
  const ref = useRef<HTMLDivElement>(null);

  const [{ isDragging }, drag] = useDrag({
    type: "STICK",
    item: stick,
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  // Connect DnD drag source to ref
  drag(ref);

  return (
    <div
      ref={ref}
      className={`w-2 h-12 rounded bg-yellow-400 mb-2 cursor-move ${
        stick.type === "bundle" ? "h-12 bg-orange-400 w-6" : ""
      }`}
      style={{ opacity: isDragging ? 0.5 : 1 }}
    ></div>
  );
};

const DropZone: React.FC<{
  onDrop: (stick: Stick) => void;
  children: React.ReactNode;
}> = ({ onDrop, children }) => {
  const ref = useRef<HTMLDivElement>(null);

  const [, drop] = useDrop({
    accept: "STICK",
    drop: (item: Stick) => onDrop(item),
  });

  // Connect the drop area to the ref
  useEffect(() => {
    if (ref.current) {
      drop(ref);
    }
  }, [drop]);

  return (
    <div
      ref={ref}
      className="min-h-[300px] border-dashed border-2 border-gray-400 p-4 bg-white rounded"
    >
      {children}
    </div>
  );
};


const CanvasInterface: React.FC = () => {
  const [canvasSticks, setCanvasSticks] = useState<Stick[]>([]);
  const [nextId, setNextId] = useState(1);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showSummary, setShowSummary] = useState(false);

  const targetNumber = questions[currentQuestionIndex];

  const addStickToCanvas = (stick: Stick) => {
    setCanvasSticks((prev) => [...prev, { ...stick, id: nextId }]);
    setNextId((id) => id + 1);
  };

  const countTotal = () => {
    return canvasSticks.reduce(
      (acc, stick) => acc + (stick.type === "bundle" ? 10 : 1),
      0
    );
  };

  useEffect(() => {
    const total = countTotal();
    if (total === targetNumber) {
      setIsCorrect(true);
      // Go to next question after 1.5s
      setTimeout(() => {
        if (currentQuestionIndex + 1 < questions.length) {
          setCurrentQuestionIndex((prev) => prev + 1);
          setCanvasSticks([]);
          setIsCorrect(false);
        } else {
          setShowSummary(true);
        }
      }, 1500);
    }
  }, [canvasSticks]);

  if (showSummary) {
    return (
      <div className="p-6">
        <h2 className="text-2xl font-bold text-green-600">🎉 Well done!</h2>
        <p className="mt-2">You completed all 5 questions!</p>
      </div>
    );
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="p-6">
        <h2 className="text-xl font-bold mb-4">
          Question {currentQuestionIndex + 1} of {questions.length}: Build{" "}
          {targetNumber}
        </h2>

        {/* Stick Bin */}
        <div className="flex space-x-4 mb-6">
          <div>
            <p className="font-semibold mb-2">Single Stick</p>
            <StickItem stick={{ id: 0, type: "single" }} />
          </div>
          <div>
            <p className="font-semibold mb-2">Bundle (10)</p>
            <StickItem stick={{ id: 0, type: "bundle" }} />
          </div>
        </div>

        {/* Drop Area */}
        <DropZone onDrop={addStickToCanvas}>
          <p className="mb-2 text-sm text-gray-500">Drop sticks here</p>
          <div className="flex flex-wrap gap-2">
            {canvasSticks.map((stick) => (
              <div
                key={stick.id}
                className={`${
                  stick.type === "single"
                    ? "w-2 h-12 bg-yellow-400"
                    : "w-6 h-12 bg-orange-400"
                } rounded`}
              ></div>
            ))}
          </div>
        </DropZone>

        {/* Total Count & Feedback */}
        <div className="mt-4 text-lg">
          Total: <span className="font-bold">{countTotal()}</span>
          {isCorrect && (
            <span className="text-green-600 ml-2 font-semibold">
              ✅ Correct!
            </span>
          )}
        </div>
      </div>
    </DndProvider>
  );
};

export default CanvasInterface;

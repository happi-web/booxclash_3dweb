import React, { useState, useEffect, useRef } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

type MaterialType = "stick" | "rock" | "leaf" | "shell";

interface Material {
  id: number;
  type: MaterialType;
  unitValue: number;
}

const questions = [17, 23, 8, 34, 45];

const materialBin: Material[] = [
  { id: 1, type: "stick", unitValue: 1 },
  { id: 2, type: "stick", unitValue: 10 },
  { id: 3, type: "rock", unitValue: 5 },
  { id: 4, type: "leaf", unitValue: 1 },
  { id: 5, type: "shell", unitValue: 2 },
];

const MaterialItem: React.FC<{ material: Material }> = ({ material }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [{ isDragging }, drag] = useDrag({
    type: "MATERIAL",
    item: material,
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  drag(ref);

  const getStyle = () => {
    switch (material.type) {
      case "stick":
        return material.unitValue === 10
          ? "bg-orange-400 w-6 h-12"
          : "bg-yellow-400 w-2 h-12";
      case "rock":
        return "bg-gray-600 w-8 h-8 rounded-full";
      case "leaf":
        return "bg-green-400 w-6 h-10 rounded-tl-full rounded-tr-full";
      case "shell":
        return "bg-pink-300 w-6 h-6 rounded-full border border-white";
      default:
        return "";
    }
  };

  return (
    <div
      ref={ref}
      className={`cursor-move mb-2 ${getStyle()}`}
      style={{ opacity: isDragging ? 0.5 : 1 }}
    />
  );
};

const DropZone: React.FC<{
  onDrop: (material: Material) => void;
  children: React.ReactNode;
}> = ({ onDrop, children }) => {
  const ref = useRef<HTMLDivElement>(null);

  const [, drop] = useDrop({
    accept: "MATERIAL",
    drop: (item: Material) => onDrop(item),
  });

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

const PlaceValues: React.FC = () => {
  const [canvasMaterials, setCanvasMaterials] = useState<Material[]>([]);
  const [nextId, setNextId] = useState(100); // start from 100 to separate from bin items
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showSummary, setShowSummary] = useState(false);

  const targetNumber = questions[currentQuestionIndex];

  const addMaterialToCanvas = (material: Material) => {
    setCanvasMaterials((prev) => [
      ...prev,
      { ...material, id: nextId },
    ]);
    setNextId((id) => id + 1);
  };

  const countTotal = () => {
    return canvasMaterials.reduce((acc, mat) => acc + mat.unitValue, 0);
  };

  useEffect(() => {
    const total = countTotal();
    if (total === targetNumber) {
      setIsCorrect(true);
      setTimeout(() => {
        if (currentQuestionIndex + 1 < questions.length) {
          setCurrentQuestionIndex((prev) => prev + 1);
          setCanvasMaterials([]);
          setIsCorrect(false);
        } else {
          setShowSummary(true);
        }
      }, 1500);
    }
  }, [canvasMaterials]);

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
        {/* Progress Bar */}
        <div className="w-full bg-gray-300 h-2 rounded mb-4">
          <div
            className="bg-blue-500 h-2 rounded"
            style={{
              width: `${((currentQuestionIndex + 1) / questions.length) * 100}%`,
            }}
          />
        </div>

        <h2 className="text-xl font-bold mb-4">
          Question {currentQuestionIndex + 1} of {questions.length}: Build{" "}
          {targetNumber}
        </h2>

        {/* Material Bin */}
        <div className="flex flex-wrap gap-6 mb-6">
          {materialBin.map((mat) => (
            <div key={mat.id} className="text-center">
              <p className="font-semibold mb-1 capitalize">
                {mat.type} ({mat.unitValue})
              </p>
              <MaterialItem material={mat} />
            </div>
          ))}
        </div>

        {/* Drop Area */}
        <DropZone onDrop={addMaterialToCanvas}>
          <p className="mb-2 text-sm text-gray-500">Drop materials here</p>
          <div className="flex flex-wrap gap-2">
            {canvasMaterials.map((mat) => (
              <div key={mat.id}>
                <MaterialItem material={mat} />
              </div>
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

        {/* Reset Button */}
        <button
          onClick={() => setCanvasMaterials([])}
          className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Reset
        </button>
      </div>
    </DndProvider>
  );
};

export default PlaceValues;

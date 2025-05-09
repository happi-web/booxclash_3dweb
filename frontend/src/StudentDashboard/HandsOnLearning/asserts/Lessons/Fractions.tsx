import React, { useState, useEffect, useRef } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

type MaterialType = "half" | "third" | "quarter";

interface Material {
  id: number;
  type: MaterialType;
  fractionValue: number;
}

const fractionQuestions = [0.5, 1 / 3, 0.75, 1, 1.25];

const materialBin: Material[] = [
  { id: 1, type: "half", fractionValue: 0.5 },
  { id: 2, type: "third", fractionValue: 1 / 3 },
  { id: 3, type: "quarter", fractionValue: 0.25 },
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
        case "half":
          return "bg-purple-500 w-24 h-8 rounded-md shadow-md";
        case "third":
          return "bg-blue-500 w-20 h-8 rounded-md shadow-md";
        case "quarter":
          return "bg-orange-400 w-16 h-8 rounded-md shadow-md";
        default:
          return "bg-gray-300 w-16 h-8 rounded-md";
      }
    };
  
    return (
      <div
        ref={ref}
        className={`cursor-move mb-2 transition-opacity duration-300 ${getStyle()}`}
        style={{ opacity: isDragging ? 0.4 : 1 }}
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
      className="min-h-[300px] border-dashed border-2 border-gray-400 p-4 bg-black rounded"
    >
      {children}
    </div>
  );
};

const FractionsCanvas: React.FC = () => {
  const [canvasMaterials, setCanvasMaterials] = useState<Material[]>([]);
  const [nextId, setNextId] = useState(100);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showSummary, setShowSummary] = useState(false);

  const targetFraction = fractionQuestions[currentQuestionIndex];

  const addMaterialToCanvas = (material: Material) => {
    setCanvasMaterials((prev) => [...prev, { ...material, id: nextId }]);
    setNextId((id) => id + 1);
  };

  const countTotal = () => {
    return canvasMaterials.reduce((acc, mat) => acc + mat.fractionValue, 0);
  };

  useEffect(() => {
    const total = countTotal();
    if (Math.abs(total - targetFraction) < 0.01) {
      setIsCorrect(true);
      setTimeout(() => {
        if (currentQuestionIndex + 1 < fractionQuestions.length) {
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
        <p className="mt-2">You completed all fraction tasks!</p>
      </div>
    );
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="p-6">
        <div className="w-full bg-gray-300 h-2 rounded mb-4">
          <div
            className="bg-blue-500 h-2 rounded"
            style={{
              width: `${((currentQuestionIndex + 1) / fractionQuestions.length) * 100}%`,
            }}
          />
        </div>

        <h2 className="text-xl font-bold mb-4">
          Question {currentQuestionIndex + 1} of {fractionQuestions.length}: Build{" "}
          {targetFraction}
        </h2>

        <div className="flex flex-wrap gap-6 mb-6">
          {materialBin.map((mat) => (
            <div key={mat.id} className="text-center">
              <p className="font-semibold mb-1 capitalize">
                {mat.type} ({mat.fractionValue})
              </p>
              <MaterialItem material={mat} />
            </div>
          ))}
        </div>

        <DropZone onDrop={addMaterialToCanvas}>
          <p className="mb-2 text-sm text-gray-500">Drop fraction parts here</p>
          <div className="flex flex-wrap gap-2">
            {canvasMaterials.map((mat) => (
              <div key={mat.id}>
                <MaterialItem material={mat} />
              </div>
            ))}
          </div>
        </DropZone>

        <div className="mt-4 text-lg">
          Total:{" "}
          <span className="font-bold">{countTotal().toFixed(2)}</span>
          {isCorrect && (
            <span className="text-green-600 ml-2 font-semibold">
              ✅ Correct!
            </span>
          )}
        </div>

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

export default FractionsCanvas;

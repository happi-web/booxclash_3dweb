import React, { useState, useEffect, useRef } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { Howl } from "howler";

type TaskType = "Factors" | "Multiples" | "HCF" | "LCM" | "NumberType";

interface NumberCard {
  id: number;
  value: number | string;
}

interface DropStatus {
  [key: string]: boolean | null;
}

const soundCorrect = new Howl({
  src: ["/sounds/correct.mp3"],
  onloaderror: () => console.error("Failed to load correct answer sound"),
});

const soundWrong = new Howl({
  src: ["/sounds/incorrect.mp3"],
  onloaderror: () => console.error("Failed to load wrong answer sound"),
});

const soundDrop = new Howl({
  src: ["/sounds/drop.mp3"],
  onloaderror: () => console.error("Failed to load drop sound"),
});

// First define the prime function separately
const isPrime = (n: number): boolean => {
  if (n <= 1) return false;
  for (let i = 2; i <= Math.sqrt(n); i++) if (n % i === 0) return false;
  return true;
};

const numberTypes = {
  natural: (n: number) => n > 0 && Number.isInteger(n),
  whole: (n: number) => n >= 0 && Number.isInteger(n),
  integer: (n: number) => Number.isInteger(n),
  prime: isPrime,
  even: (n: number) => n % 2 === 0,
  odd: (n: number) => n % 2 !== 0,
  rational: (n: number) => Number.isInteger(n) || (n.toString().includes(".") && !n.toString().includes("3.14159")),
  irrational: (n: number | string) => n === Math.PI || (typeof n === "string" && n.includes("√") && !Number.isInteger(Math.sqrt(parseInt(n.replace("√", ""))))) || n.toString().includes("3.14159"),
  composite: (n: number) => n > 1 && !isPrime(n),
  negative: (n: number) => n < 0,
  decimal: (n: number) => !Number.isInteger(n) && n.toString().includes("."),
  squareRoot: (n: string) => n.includes("√") && Number.isInteger(Math.sqrt(parseInt(n.replace("√", "")))),
  pi: (n: number | string) => n === Math.PI || n === "π" || n.toString().includes("3.14159"),
  perfectSquare: (n: number) => Number.isInteger(Math.sqrt(n)),
  fibonacci: (n: number) => {
    const isSquare = (num: number) => Number.isInteger(Math.sqrt(num));
    return isSquare(5 * n * n + 4) || isSquare(5 * n * n - 4);
  }
};

const questions: { type: TaskType; target: number | string; other?: number | string; description?: string }[] = [
  { type: "Factors", target: 12, other: undefined, description: "Drop all factors of 12" },
  { type: "Multiples", target: 5, other: undefined, description: "Drop all multiples of 5" },
  { type: "HCF", target: 18, other: 24, description: "Drop the HCF of 18 and 24" },
  { type: "LCM", target: 2, other: 4, description: "Drop the LCM of 2 and 4" },
  { type: "NumberType", target: "prime", other: undefined, description: "Drop all prime numbers" },
  { type: "NumberType", target: "even", other: undefined, description: "Drop all even numbers" },
  { type: "NumberType", target: "irrational", other: undefined, description: "Drop all irrational numbers" },
  { type: "NumberType", target: "composite", other: undefined, description: "Drop all composite numbers" },
  { type: "NumberType", target: "squareRoot", other: undefined, description: "Drop all perfect square roots" },
  { type: "NumberType", target: "pi", other: undefined, description: "Drop all representations of π" },
];

const NumberCardItem: React.FC<{ number: NumberCard; animate: boolean }> = ({ number, animate }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [{ isDragging }, drag] = useDrag({
    type: "NUMBER",
    item: number,
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  drag(ref);

  return (
    <div
      ref={ref}
      className={` overflow-none cursor-move  w-auto h-4 bg-blue-400 p-1 text-white rounded flex items-center justify-center transition-transform ${animate ? "animate-bounce" : ""}`}
      style={{ 
        opacity: isDragging ? 0.5 : 1,
        transform: isDragging ? "scale(1.1)" : "scale(1)"
      }}
    >
      {number.value}
    </div>
  );
};

const DropZone: React.FC<{
  onDrop: (item: NumberCard) => void;
  children: React.ReactNode;
  status: DropStatus;
  score: number;
  totalAttempts: number;
}> = ({ onDrop, children, status, score, totalAttempts }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [, drop] = useDrop({
    accept: "NUMBER",
    drop: (item: NumberCard) => onDrop(item),
    hover: () => {
      if (ref.current) {
        ref.current.style.backgroundColor = "#2d3748";
      }
    },
  });

  useEffect(() => {
    if (ref.current) drop(ref);
  }, [drop]);

  const accuracy = totalAttempts > 0 ? Math.round((score / totalAttempts) * 100) : 0;

  return (
    <div className="mb-4">
      <div className="flex justify-between mb-2">
        <span className="font-bold">Score: {score}</span>
        <span className="font-bold">Accuracy: {accuracy}%</span>
      </div>
      <div
        ref={ref}
        className="min-h-[150px] border-2 p-4 bg-gray-800 rounded flex flex-wrap gap-2 transition-colors duration-300"
      >
        {children}
        {Object.entries(status).map(([value, correct]) => (
          <div
            key={value}
            className={`w-10 h-10 rounded text-center pt-1 transition-all duration-500 ${
              correct === true
                ? "bg-green-400 transform scale-110"
                : correct === false
                ? "bg-red-400 transform scale-110"
                : "bg-gray-200"
            }`}
          >
            {value}
          </div>
        ))}
      </div>
    </div>
  );
};

const NumberClassifier: React.FC = () => {
  const [numberBin, ] = useState<NumberCard[]>([
    ...Array.from({ length: 20 }, (_, i) => ({ id: i + 1, value: i + 1 })),
    { id: 21, value: -5 },
    { id: 22, value: 0 },
    { id: 23, value: 3.14 },
    { id: 24, value: 2.5 },
    { id: 25, value: "√4" },
    { id: 26, value: "√2" },
    { id: 27, value: "π" },
    { id: 28, value: Math.PI },
    { id: 29, value: 3.14159 },
    { id: 30, value: -3.14 }
  ]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [statusMap, setStatusMap] = useState<DropStatus>({});
  const [showNext, setShowNext] = useState(false);
  const [score, setScore] = useState(0);
  const [totalAttempts, setTotalAttempts] = useState(0);
  const [animateCards, setAnimateCards] = useState(false);

  const current = questions[currentIndex];

  const validate = (value: number | string): boolean => {
    if (current.type === "NumberType") {
      const typeChecker = numberTypes[current.target as keyof typeof numberTypes];
      return typeChecker(value as never);
    } else {
      if (typeof value !== "number") return false;
      
      switch (current.type) {
        case "Factors":
          return typeof current.target === "number" && current.target % value === 0;
        case "Multiples":
          return typeof value === "number" && typeof current.target === "number" && value % current.target === 0;
        case "HCF":
          return typeof current.target === "number" && typeof current.other === "number" 
            ? getHCF(current.target, current.other) === value 
            : false;
        case "LCM":
          return getLCM(current.target as number, current.other as number) === value;
        default:
          return false;
      }
    }
  };

  const handleDrop = (item: NumberCard) => {
    const correct = validate(item.value);
    setStatusMap((prev) => ({ ...prev, [item.value.toString()]: correct }));
    setTotalAttempts(prev => prev + 1);
    
    if (correct) {
      setScore(prev => prev + 1);
      soundCorrect.play();
    } else {
      soundWrong.play();
    }
    
    soundDrop.play();
    setAnimateCards(true);
    setTimeout(() => setAnimateCards(false), 1000);
  };

  const handleNext = () => {
    setStatusMap({});
    setShowNext(false);
    setCurrentIndex((i) => i + 1);
  };

// Remove redundant re-declaration of questions

// Update the useEffect that checks completion
useEffect(() => {
  const totalDropped = Object.keys(statusMap).length;
  const totalCorrect = Object.values(statusMap).filter(v => v === true).length;
  
  if (current.type === "NumberType") {
    // For number classification, we need to check if ALL correct numbers were dropped
    const correctNumbers = numberBin.filter(num => {
      const validator = numberTypes[current.target as keyof typeof numberTypes];
      return validator(num.value as never);
    }).map(num => num.value.toString());
    
    const allCorrectDropped = correctNumbers.every(val => 
      Object.keys(statusMap).includes(val) && statusMap[val] === true
    );
    
    const noIncorrectDropped = Object.entries(statusMap).every(
      ([val, correct]) => correct || !correctNumbers.includes(val)
    );
    
    if (allCorrectDropped && noIncorrectDropped && correctNumbers.length > 0) {
      setShowNext(true);
    }
  } else {
    // Original logic for other question types
    if (totalDropped > 0 && totalDropped === totalCorrect) {
      setShowNext(true);
    }
  }
}, [statusMap, current.type, current.target, numberBin]);

  const getTitle = () => {
    return current.description || "";
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="p-6 max-w-2xl mx-auto">
        <h2 className="text-xl font-bold mb-4">{getTitle()}</h2>

        <div className="flex flex-wrap gap-3 mb-6">
          {numberBin.map((num) => (
            <NumberCardItem key={num.id} number={num} animate={animateCards} />
          ))}
        </div>

        <DropZone onDrop={handleDrop} status={statusMap} score={score} totalAttempts={totalAttempts}>
          <p className="w-full font-semibold mb-2 text-white">Drop Here</p>
        </DropZone>

        {showNext && currentIndex + 1 < questions.length && (
          <button
            onClick={handleNext}
            className="mt-0.5 px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
          >
            Next Challenge
          </button>
        )}

        {showNext && currentIndex + 1 === questions.length && (
          <div className="mt-4 p-4 bg-gradient-to-r from-green-400 to-blue-500 text-white text-xl font-bold rounded-lg text-center animate-pulse">
            🎉 Congratulations! You've completed all challenges! 🎉
          </div>
        )}
      </div>
    </DndProvider>
  );
};

// Helper functions
function getHCF(a: number, b: number): number {
  if (!b) return a;
  return getHCF(b, a % b);
}

function getLCM(a: number, b: number): number {
  return (a * b) / getHCF(a, b);
}

export default NumberClassifier;
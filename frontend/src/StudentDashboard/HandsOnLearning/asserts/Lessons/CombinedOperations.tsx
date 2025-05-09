import React, { useState, useRef, useEffect } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import Confetti from "react-confetti"; 
import { useWindowSize } from "@react-hook/window-size"; 

type SymbolType = "+" | "-" | "×" | "÷" | "(" | ")";
type DragItem = { type: "SYMBOL"; symbol: SymbolType };

const availableSymbols: SymbolType[] = ["+", "-", "×", "÷", "(", ")"];

const levels = [
  { expression: ["3", "", "4", "", "2"], target: 11 }, 
  { expression: ["8", "", "3", "", "1"], target: 5 },  
  { expression: ["(", "6", "", "2", ")", "", "3"], target: 24 }, 
  { expression: ["","10", "", "2","", "", "3"], target: 24 }, 
  { expression: ["12", "÷", "(", "2", "", "4", ")"], target: 2 }, 
];

const SymbolItem: React.FC<{ symbol: SymbolType }> = ({ symbol }) => {
  const ref = useRef<HTMLDivElement>(null);

  const [{ isDragging }, drag] = useDrag({
    type: "SYMBOL",
    item: { type: "SYMBOL", symbol },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  drag(ref); // <-- connect drag to ref

  return (
    <div
      ref={ref}
      className="p-2 m-1 bg-purple-400 text-white rounded text-lg cursor-move w-10 text-center"
      style={{ opacity: isDragging ? 0.5 : 1 }}
    >
      {symbol}
    </div>
  );
};


const DropSlot: React.FC<{
  index: number;
  symbol: string;
  onDrop: (index: number, symbol: SymbolType) => void;
}> = ({ index, symbol, onDrop }) => {
  const ref = useRef<HTMLDivElement>(null);

  const [, drop] = useDrop<DragItem>({
    accept: "SYMBOL",
    drop: (item) => onDrop(index, item.symbol),
  });

  drop(ref);

  return (
    <div
      ref={ref}
      className="border-2 border-dashed border-gray-500 w-10 h-10 mx-1 flex items-center justify-center text-xl bg-white rounded"
    >
      {symbol}
    </div>
  );
};

const evaluateExpression = (tokens: string[]): number | null => {
  try {
    const replaced = tokens
      .join("")
      .replace(/×/g, "*")
      .replace(/÷/g, "/");
    const result = eval(replaced);
    return Math.round(result * 100) / 100;
  } catch {
    return null;
  }
};

const CombinedOperations: React.FC = () => {
  const [level, setLevel] = useState(0);
  const [expression, setExpression] = useState([...levels[0].expression]);
  const [feedback, setFeedback] = useState("");
  const [showCorrectSplash, setShowCorrectSplash] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [width, height] = useWindowSize();

  const correctSound = useRef<HTMLAudioElement>(new Audio("/sounds/correct.mp3"));
  const incorrectSound = useRef<HTMLAudioElement>(new Audio("/sounds/incorrect.mp3"));

  const handleDrop = (index: number, symbol: SymbolType) => {
    const newExp = [...expression];
    newExp[index] = symbol;
    setExpression(newExp);
    setFeedback("");
  };

  const handleCheck = () => {
    const result = evaluateExpression(expression);
    if (result === levels[level].target) {
      correctSound.current.play();
      setShowCorrectSplash(true);
      setTimeout(() => setShowCorrectSplash(false), 1000);

      if (level + 1 < levels.length) {
        setTimeout(() => {
          setLevel(level + 1);
          setExpression([...levels[level + 1].expression]);
          setFeedback("");
        }, 1000);
      } else {
        setTimeout(() => {
          setGameCompleted(true);
        }, 1000);
      }
    } else {
      incorrectSound.current.play();
      setFeedback("❌ Try again. Check the order of operations.");
    }
  };

  const handleRestart = () => {
    setLevel(0);
    setExpression([...levels[0].expression]);
    setFeedback("");
    setGameCompleted(false);
  };

  useEffect(() => {
    setExpression([...levels[level].expression]);
  }, [level]);

  if (gameCompleted) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-80 flex flex-col items-center justify-center text-white text-center z-50">
        <Confetti width={width} height={height} />
        <h1 className="text-5xl font-bold mb-6 animate-bounce">🎉 Well Done! 🎉</h1>
        <p className="text-2xl mb-8">You completed all the challenges!</p>
        <button
          onClick={handleRestart}
          className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white text-xl rounded-lg transition duration-300"
        >
          Play Again
        </button>
      </div>
    );
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="relative p-6 max-w-xl mx-auto text-center bg-orange-50 rounded-lg shadow-lg mt-8">
        {showCorrectSplash && (
          <div className="absolute inset-0 bg-green-400 bg-opacity-80 flex items-center justify-center text-white text-4xl font-bold z-40 animate-ping">
            ✅ Correct!
          </div>
        )}

        <h2 className="text-2xl font-bold mb-4">
          Level {level + 1}: Make the result = {levels[level].target}
        </h2>

        <div className="flex justify-center flex-wrap mb-4">
          {expression.map((sym, idx) =>
            sym === "" || availableSymbols.includes(sym as SymbolType) ? (
              <DropSlot
                key={idx}
                index={idx}
                symbol={sym}
                onDrop={handleDrop}
              />
            ) : (
              <div
                key={idx}
                className="w-10 h-10 mx-1 flex items-center justify-center text-xl bg-gray-200 rounded"
              >
                {sym}
              </div>
            )
          )}
        </div>

        <button
          onClick={handleCheck}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Check Answer
        </button>

        {feedback && <p className="mt-4 text-lg">{feedback}</p>}

        <div className="mt-6">
          <h3 className="font-semibold mb-2">Available Symbols</h3>
          <div className="flex flex-wrap justify-center">
            {availableSymbols.map((s, i) => (
              <SymbolItem key={i} symbol={s} />
            ))}
          </div>
        </div>
      </div>
    </DndProvider>
  );
};

export default CombinedOperations;

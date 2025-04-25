import React, { useState, useRef } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

type SymbolType = "+" | "-" | "×" | "÷" | "(" | ")";
type DragItem = { type: "SYMBOL"; symbol: SymbolType };

const availableSymbols: SymbolType[] = ["+", "-", "×", "÷", "(", ")"];

const levels = [
  { expression: ["3", "", "4", "", "2"], target: 14 }, // 3 + 4 × 2
  { expression: ["8", "", "3", "", "1"], target: 5 },  // 8 - 3 × 1
  { expression: ["(", "6", "", "2", ")", "", "3"], target: 24 }, // (6 × 2) + 3
  { expression: ["10", "", "2", "", "3"], target: 24 }, // (10 + 2) × 3
  { expression: ["12", "÷", "(", "2", "", "4", ")"], target: 2 }, // 12 ÷ (2 + 4)
];

const SymbolItem: React.FC<{ symbol: SymbolType }> = ({ symbol }) => {
  const [{ isDragging }, drag] = useDrag({
    type: "SYMBOL",
    item: { type: "SYMBOL", symbol },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const divRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={(node) => {
        drag(node);
        divRef.current = node;
      }}
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
    const ref = React.useRef<HTMLDivElement>(null);
  
    const [, drop] = useDrop<DragItem>({
      accept: "SYMBOL",
      drop: (item) => onDrop(index, item.symbol),
    });
  
    drop(ref);
  
    return (
      <div
        ref={ref} // <-- ref is now properly typed
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
    return Math.round(result * 100) / 100; // round to 2 decimal places
  } catch {
    return null;
  }
};

const CombinedOperations: React.FC = () => {
  const [level, setLevel] = useState(0);
  const [expression, setExpression] = useState([...levels[level].expression]);
  const [feedback, setFeedback] = useState("");

  const handleDrop = (index: number, symbol: SymbolType) => {
    const newExp = [...expression];
    newExp[index] = symbol;
    setExpression(newExp);
    setFeedback("");
  };

  const handleCheck = () => {
    const result = evaluateExpression(expression);
    if (result === levels[level].target) {
      if (level + 1 < levels.length) {
        setLevel(level + 1);
        setExpression([...levels[level + 1].expression]);
        setFeedback("✅ Correct! Moving to next level...");
      } else {
        setFeedback("🎉 You completed all challenges!");
      }
    } else {
      setFeedback("❌ Try again. Check the order of operations.");
    }
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="p-6 max-w-xl mx-auto text-center bg-orange-50 rounded-lg shadow-lg mt-8">
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

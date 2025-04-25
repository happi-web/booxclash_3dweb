import React, { useEffect, useState } from "react";

const generateNumbers = (target: number): number[] => {
  const numbers = new Set<number>();
  numbers.add(target);
  while (numbers.size < 16) {
    const rand = Math.floor(Math.random() * 100);
    numbers.add(rand);
  }
  return Array.from(numbers).sort(() => Math.random() - 0.5);
};

const NumberHunt: React.FC = () => {
  const [targetNumber, setTargetNumber] = useState<number>(0);
  const [numbers, setNumbers] = useState<number[]>([]);
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    const target = Math.floor(Math.random() * 100);
    setTargetNumber(target);
    setNumbers(generateNumbers(target));
    setMessage("");
  }, []);

  const handleClick = (num: number) => {
    if (num === targetNumber) {
      setMessage("🎉 Correct! Great job!");
      setTimeout(() => {
        const newTarget = Math.floor(Math.random() * 100);
        setTargetNumber(newTarget);
        setNumbers(generateNumbers(newTarget));
        setMessage("");
      }, 1500);
    } else {
      setMessage("❌ Oops! Try again!");
    }
  };

  return (
    <div className="p-6 bg-gradient-to-br from-purple-100 via-blue-100 to-orange-100 min-h-screen">
      <div className="max-w-md mx-auto bg-white shadow-lg rounded-2xl p-6 text-center">
        <h2 className="text-2xl font-bold mb-4 text-purple-700">🔢 Number Hunt</h2>
        <p className="mb-2 text-lg font-medium text-gray-700">
          Find the number: <span className="text-blue-600 font-bold">{targetNumber}</span>
        </p>
        {message && (
          <div className="my-4 text-xl font-semibold text-orange-600">{message}</div>
        )}
        <div className="grid grid-cols-4 gap-4 mt-4">
          {numbers.map((num) => (
            <button
              key={num}
              onClick={() => handleClick(num)}
              className="bg-purple-200 hover:bg-purple-300 text-purple-800 font-bold py-3 rounded-xl shadow-md transition"
            >
              {num}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NumberHunt;

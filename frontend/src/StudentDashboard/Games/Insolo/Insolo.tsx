import React, { useState } from "react";

const factorQuestions = [
  { question: "List all factors of 36", answer: ["1", "2", "3", "4", "6", "9", "12", "18", "36"] },
  { question: "Is 48 a factor of 6?", answer: ["No"] },
  { question: "Is 9 a factor of 72?", answer: ["Yes"] },
  { question: "How many factors does 24 have?", answer: ["8"] },
  { question: "What is the greatest factor of 45 (other than 45)?", answer: ["15"] },
];

const getRandomQuestion = () => {
  const index = Math.floor(Math.random() * factorQuestions.length);
  return factorQuestions[index];
};

const FactorFrenzy: React.FC = () => {
  const [position, setPosition] = useState(0);
  const [tokens, setTokens] = useState(0);
  const [diceRoll, setDiceRoll] = useState<number | null>(null);
  const [question, setQuestion] = useState<{ question: string; answer: string[] } | null>(null);
  const [playerAnswer, setPlayerAnswer] = useState("");
  const [message, setMessage] = useState("");

  const rollDice = () => {
    const roll = Math.ceil(Math.random() * 6);
    setDiceRoll(roll);
    const newPos = position + roll;
    setPosition(newPos);
    const q = getRandomQuestion();
    setQuestion(q);
    setPlayerAnswer("");
    setMessage("");
  };

  const checkAnswer = () => {
    if (!question) return;
    const cleanedAnswer = playerAnswer.trim().toLowerCase();
    const isCorrect = question.answer.some(ans => ans.toLowerCase() === cleanedAnswer);
    if (isCorrect) {
      setTokens(tokens + 1);
      setMessage("✅ Correct! You earned a token.");
    } else {
      setMessage("❌ Incorrect. Try again next turn.");
    }
    setQuestion(null);
  };

  return (
    <div className="p-6 max-w-lg mx-auto bg-white rounded-xl shadow-md space-y-4 text-center">
      <h1 className="text-2xl font-bold text-purple-700">🎲 Factor Frenzy</h1>

      <p>Position: {position}</p>
      <p>Tokens: {tokens} / 5</p>

      <button
        onClick={rollDice}
        className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded"
        disabled={!!question}
      >
        Roll Dice 🎲
      </button>

      {diceRoll && <p>You rolled a {diceRoll}!</p>}

      {question && (
        <div className="mt-4 space-y-2">
          <p className="font-semibold">{question.question}</p>
          <input
            type="text"
            value={playerAnswer}
            onChange={(e) => setPlayerAnswer(e.target.value)}
            className="border p-2 rounded w-full"
            placeholder="Your answer"
          />
          <button
            onClick={checkAnswer}
            className="mt-2 bg-green-600 hover:bg-green-700 text-white font-bold py-1 px-3 rounded"
          >
            Submit
          </button>
        </div>
      )}

      {message && <p className="mt-4 font-medium">{message}</p>}

      {tokens >= 5 && (
        <div className="mt-4 text-green-600 font-bold text-xl">
          🎉 You win! Refresh to play again.
        </div>
      )}
    </div>
  );
};

export default FactorFrenzy;

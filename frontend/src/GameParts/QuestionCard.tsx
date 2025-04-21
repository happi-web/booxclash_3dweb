import React, { useEffect, useState } from 'react';

interface Question {
  question: string;
  options: string[];
  correctAnswer: string;
}

interface QuestionCardProps {
  question: Question | null;
  currentPair: any[]; // Current pair of players
  isCurrentUserInPair: boolean | null; // Whether the current user is in the current pair
  answered: boolean; // Whether the question has been answered
  answerFeedback: string | null; // Feedback on whether the answer was correct or not
  timer: number | null; // Timer for the round
  handleAnswer: (opt: string) => void; // Function to handle answer selection
  allowedPlayerIds: string[]; // List of allowed player IDs who can answer
}

const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  currentPair,
  isCurrentUserInPair,
  answered,
  answerFeedback,
  timer,
  handleAnswer,
  allowedPlayerIds
}) => {
  if (!question || !question.question) {
    return <p className="text-red-400 mt-4">⚠️ Waiting for question...</p>;
  }

  const bothPlayersReady = currentPair.length === 2 && currentPair[0]?.name && currentPair[1]?.name;
  
  // Check if the current user is in the allowed pair and if the question has been answered
  const canAnswer = 
    isCurrentUserInPair === true && 
    !answered && 
    (allowedPlayerIds.includes(currentPair[0]?.id) || allowedPlayerIds.includes(currentPair[1]?.id));

  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);

  // Handle answer click
  const onAnswerClick = (answer: string) => {
    if (selectedAnswer) return; // Prevent multiple clicks
    setSelectedAnswer(answer);
    handleAnswer(answer); // Send the selected answer to the backend
  };

  return (
    <div className="bg-black/50 p-6 rounded-2xl mt-6 text-center shadow-lg max-w-2xl mx-auto">
      <h2 className="text-2xl font-extrabold text-orange-400 mb-4">
        Knockout Round: {currentPair?.[0]?.name || 'Player 1'} 🆚 {currentPair?.[1]?.name || 'Player 2'}
      </h2>

      <p className="text-xl text-white mb-6">{question.question}</p>

      {bothPlayersReady ? (
        <div className="mt-2 flex flex-wrap justify-center gap-4">
          {question.options.map((opt, index) => (
            <button
              key={index}
              disabled={!canAnswer || selectedAnswer !== null} // Disable button once an answer is selected
              onClick={() => onAnswerClick(opt)}
              className={`min-w-[160px] px-6 py-3 rounded-xl text-lg font-semibold transition-all duration-200
                ${selectedAnswer === opt
                  ? (opt === question.correctAnswer
                    ? 'bg-green-600 text-white cursor-not-allowed'
                    : 'bg-red-600 text-white cursor-not-allowed')
                  : (canAnswer
                    ? 'bg-green-600 hover:bg-green-500 text-white shadow-md hover:scale-105'
                    : 'bg-gray-600 text-white cursor-not-allowed')
                }`}
            >
              {opt}
            </button>
          ))}
        </div>
      ) : (
        <p className="text-white mt-4 animate-pulse">🔄 Preparing round...</p>
      )}

      {answerFeedback && (
        <p className="mt-4 text-lg font-semibold text-yellow-300">{answerFeedback}</p>
      )}

      {timer !== null && (
        <p className="text-xl font-bold text-red-400 animate-pulse mt-6">
          ⏱ {timer} seconds left
        </p>
      )}
    </div>
  );
};

export default QuestionCard;

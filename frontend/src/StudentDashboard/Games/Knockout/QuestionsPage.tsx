import React, { useEffect, useState } from 'react';

type Question = {
  prompt: string;
  options: string[];
  answer: string;
};

interface QuestionsPageProps {
  subject: string;
  level: string;
}

const QuestionsPage: React.FC<QuestionsPageProps> = ({ subject, level }) => {
  const [quizStarted, setQuizStarted] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [timer, setTimer] = useState(15);
  const [correctCount, setCorrectCount] = useState(0);
  const [showSummary, setShowSummary] = useState(false);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/questions/${subject}/${level}`);
        const data: Question[] = await res.json();
        setQuestions(data);
        setQuizStarted(true);
        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch questions:", err);
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [subject, level]);

  useEffect(() => {
    if (!quizStarted || questions.length === 0 || currentIndex >= questions.length) return;

    setSelectedOption(null);
    setTimer(15);

    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev === 1) {
          clearInterval(interval);
          setTimeout(() => handleNext(null), 500);
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [currentIndex, questions, quizStarted]);

  const handleNext = (selected: string | null) => {
    if (selected && selected === questions[currentIndex].answer) {
      setCorrectCount((c) => c + 1);
    }

    if (currentIndex + 1 >= questions.length) {
      setShowSummary(true);
    } else {
      setCurrentIndex((i) => i + 1);
    }
  };

  const handleOptionClick = (option: string) => {
    setSelectedOption(option);
    setTimeout(() => handleNext(option), 800);
  };

  if (loading) return <div>Loading questions...</div>;

  if (showSummary) {
    const total = questions.length;
    const percentage = ((correctCount / total) * 100).toFixed(1);
    return (
      <div className="p-6 max-w-xl mx-auto space-y-6 text-center">
        <h1 className="text-3xl font-bold">Quiz Summary</h1>
        <p className="text-xl">Subject: {subject.toUpperCase()} | Level: {level}</p>
        <p className="text-lg mt-4">✅ Correct Answers: {correctCount} / {total}</p>
        <p className="text-lg">📊 Score: {percentage}%</p>
        <button
          className="mt-6 bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded"
          onClick={() => window.location.reload()}
        >
          Play Again
        </button>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];

  if (!currentQuestion) {
    return <div className="text-center mt-10 text-yellow-400">Loading question...</div>;
  }
  
  return (
    <div className="p-6 max-w-xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Quiz: {subject.toUpperCase()} - {level}</h1>
      <div className="text-right font-mono text-gray-600 text-sm">⏳ Time left: {timer}s</div>
  
      <div className="border p-4 rounded-md shadow">
        <h2 className="text-lg font-semibold">{currentIndex + 1}. {currentQuestion.prompt}</h2>
        <ul className="mt-4 space-y-3">
          {currentQuestion.options.map((option, i) => (
            <li key={i}>
              <button
                disabled={!!selectedOption}
                onClick={() => handleOptionClick(option)}
                className={`w-full px-4 py-2 rounded text-left border transition-all
                  ${selectedOption === option
                    ? option === currentQuestion.answer
                      ? 'bg-green-500 text-white'
                      : 'bg-red-500 text-white'
                    : 'bg-white hover:bg-blue-100'}
                `}
              >
                {option}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
  
};

export default QuestionsPage;
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import io from "socket.io-client";
import QuestionsPage from "./QuestionsPage";

const socket = io("http://localhost:5000");

const PlayGround = () => {
  const { roomId } = useParams<{ roomId: string }>();

  interface Room {
    roomId: string;
    subject: string;
    level: string;
    hostName: string;
    hostCountry: string;
    players: { _id: string; name: string; country: string }[];
    numPlayers: number;
  }

  const [room, setRoom] = useState<Room | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchRoom = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/rooms/${roomId}`);
        if (!res.ok) throw new Error("Failed to fetch room data");
        const data = await res.json();
        setRoom(data);
      } catch (err) {
        console.error(err);
        setError("Unable to load room data. Please try again.");
      }
    };

    fetchRoom();

    return () => {
      socket.off("quizStarted");
    };
  }, [roomId]);

  if (error) {
    return <div className="text-red-500 text-center mt-10">{error}</div>;
  }

  if (!room) {
    return <div className="text-center text-orange-300 mt-10">Loading room info...</div>;
  }

  return (
    <div className="p-6 bg-gray-900 text-white rounded-2xl shadow-xl max-w-2xl mx-auto mt-10 space-y-6">
      <h2 className="text-3xl font-bold text-orange-400 text-center">🎮 Game Room: {room.roomId}</h2>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <p><strong>Subject:</strong> {room.subject}</p>
          <p><strong>Level:</strong> {room.level}</p>
        </div>
        <div>
          <p><strong>Host:</strong> {room.hostName} ({room.hostCountry})</p>
          <p><strong>Players:</strong> {room.players.length} / {room.numPlayers}</p>
        </div>
      </div>

      <div className="mt-4">
        <h3 className="text-xl font-semibold text-orange-300 mb-2">👥 Players</h3>
        <ul className="space-y-2">
          {room.players.map((player) => (
            <li
              key={player._id}
              className="p-3 bg-gray-800 rounded-xl flex justify-between items-center"
            >
              <span>{player.name}</span>
              <span className="text-sm text-gray-400">{player.country}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default PlayGround;

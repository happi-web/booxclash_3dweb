import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import io from "socket.io-client";

const socket = io("http://localhost:5000");

type Question = {
  prompt: string;
  options: string[];
  answer: string;
};

interface Player {
  _id: string;
  name: string;
  country: string;
  points?: number;
  socketId?: string;
}

const PlayGround = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const [room, setRoom] = useState<any>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [leaderboard, setLeaderboard] = useState<Player[]>([]);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [currentRoundIndex, setCurrentRoundIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showQuestion, setShowQuestion] = useState(false);
  const [countdown, setCountdown] = useState(4);
  const [message] = useState("ROUND 1 UNDERWAY");
  const [quizOver, setQuizOver] = useState(false);
  const [mySocketId, setMySocketId] = useState<string>("");
  const [timeLeft, setTimeLeft] = useState(15); // 15 seconds per question
  const [isAnswering, setIsAnswering] = useState(false);

  // Connect and receive socket ID
  useEffect(() => {
    socket.on("assignId", (id: string) => setMySocketId(id));
    return () => {
      socket.off("assignId");
    };
  }, []);

  // Fetch room data
  useEffect(() => {
    const fetchRoom = async () => {
      const res = await fetch(`http://localhost:5000/api/rooms/${roomId}`);
      const data = await res.json();
      const initialPlayers = data.players.map((p: Player) => ({ ...p, points: 0 }));
      setRoom(data);
      setLeaderboard(initialPlayers);
    };
    fetchRoom();
  }, [roomId]);

  // Fetch questions when room is ready
  useEffect(() => {
    if (!room) return;

    const fetchQuestions = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/questions/${room.subject}/${room.level}`);
        const data = await res.json();
        setQuestions(data);
      } catch (err) {
        console.error("❌ Failed to fetch questions:", err);
      }
    };

    fetchQuestions();
  }, [room]);

  // Start countdown before showing first question
  useEffect(() => {
    if (!room || questions.length === 0) return;

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev === 1) {
          clearInterval(interval);
          setShowQuestion(true);
          setCurrentQuestion(questions[currentRoundIndex]);
          startTimer();
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [room, questions, currentRoundIndex]);

  // Timer for current player
  const startTimer = () => {
    setTimeLeft(15);
    setIsAnswering(true);
    
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsAnswering(false);
          handleTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  };

  const handleTimeUp = () => {
    if (!currentQuestion || selectedOption) return;

    // Auto-select a random option if time runs out
    const randomOption = currentQuestion.options[Math.floor(Math.random() * currentQuestion.options.length)];
    handleOptionClick(randomOption);
  };

  const handleOptionClick = (option: string) => {
    if (!currentQuestion || selectedOption) return;

    setSelectedOption(option);
    const currentPlayer = leaderboard[currentPlayerIndex];
    const isCorrect = option === currentQuestion.answer;

    socket.emit("playerAnswered", {
      roomId,
      playerId: currentPlayer._id,
      isCorrect,
    });

    if (isCorrect) {
      const updatedLeaderboard = leaderboard.map((p, i) =>
        i === currentPlayerIndex ? { ...p, points: (p.points || 0) + 10 } : p
      );
      setLeaderboard(updatedLeaderboard);
      socket.emit("updateLeaderboard", { roomId, leaderboard: updatedLeaderboard });
    }

    setTimeout(() => {
      setSelectedOption(null);
      setIsAnswering(false);

      if (currentPlayerIndex + 1 >= leaderboard.length) {
        handleElimination();
      } else {
        setCurrentPlayerIndex(currentPlayerIndex + 1);
        startTimer(); // Start timer for next player
      }
    }, 1000);
  };

  const handleElimination = () => {
    const maxPoints = Math.max(...leaderboard.map((p) => p.points || 0));
    const survivors = leaderboard.filter((p) => p.points === maxPoints);

    socket.emit("roundEnded", { roomId, survivors });

    if (survivors.length <= 1 || currentRoundIndex + 1 >= questions.length) {
      setLeaderboard(survivors);
      setQuizOver(true);
    } else {
      setLeaderboard(survivors);
      setCurrentRoundIndex(currentRoundIndex + 1);
      setCurrentPlayerIndex(0);
      setCurrentQuestion(questions[currentRoundIndex + 1]);
      startTimer(); // Start timer for first player in next round
    }
  };

  if (!room) return <div className="text-center mt-10 text-orange-300">Loading room info...</div>;

  if (!showQuestion) {
    return (
      <div className="text-center mt-10 space-y-4 text-white">
        <h1 className="text-4xl font-bold text-green-400">{message}</h1>
        <p className="text-xl">Starting in: {countdown}s</p>
      </div>
    );
  }

  if (quizOver) {
    return (
      <div className="p-6 text-center text-white space-y-4 max-w-xl mx-auto">
        <h2 className="text-3xl font-bold text-yellow-400">🏆 Final Leaderboard</h2>
        {leaderboard.map((player, index) => (
          <div key={player._id} className="bg-gray-800 p-4 rounded-lg flex justify-between">
            <span>{index + 1}. {player.name} ({player.country})</span>
            <span className="font-bold">{player.points} pts</span>
          </div>
        ))}
      </div>
    );
  }

  const currentPlayer = leaderboard[currentPlayerIndex];
  const isCurrentPlayer = currentPlayer.socketId === mySocketId;

  return (
    <div className="p-6 bg-gray-900 text-white rounded-2xl shadow-xl max-w-2xl mx-auto mt-10 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-orange-400">
          🎯 {currentPlayer.name}'s Turn ({currentPlayer.country})
        </h2>
        <div className="bg-blue-500 px-3 py-1 rounded-full font-bold">
          ⏱️ {timeLeft}s
        </div>
      </div>

      {currentQuestion && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">{currentQuestion.prompt}</h3>
          <ul className="space-y-2">
            {currentQuestion.options.map((option, i) => (
              <li key={i}>
                <button
                  disabled={
                    !isCurrentPlayer || 
                    !!selectedOption || 
                    !isAnswering
                  }
                  onClick={() => handleOptionClick(option)}
                  className={`w-full px-4 py-2 rounded text-left border transition-all
                    ${selectedOption === option
                      ? option === currentQuestion.answer
                        ? 'bg-green-500 text-white'
                        : 'bg-red-500 text-white'
                      : isCurrentPlayer && isAnswering
                        ? 'bg-blue-500 text-white hover:bg-blue-600'
                        : 'bg-gray-500 text-white cursor-not-allowed'}
                  `}
                >
                  {option}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-6">
        <h3 className="text-xl font-semibold text-orange-300 mb-2">📋 Leaderboard</h3>
        <ul className="space-y-2">
          {leaderboard.map((player, index) => (
            <li
              key={player._id}
              className={`p-3 rounded-xl flex justify-between items-center
                ${index === currentPlayerIndex ? 'bg-orange-500' : 'bg-gray-800'}`}
            >
              <span>{player.name} ({player.country})</span>
              <span className="text-sm font-bold">{player.points} pts</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default PlayGround;

import  { useEffect, useState } from "react";
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
}

interface Room {
  roomId: string;
  subject: string;
  level: string;
  hostName: string;
  hostCountry: string;
  players: Player[];
  numPlayers: number;
}

const PlayGround = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const [room, setRoom] = useState<Room | null>(null);
  const [error, setError] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [quizStarted, setQuizStarted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [timer, setTimer] = useState(15);
  const [showSummary, setShowSummary] = useState(false);

  const [pairings, setPairings] = useState<{ player1: Player; player2: Player }[]>([]);
  const [currentPairsIndex, setCurrentPairsIndex] = useState(0);
  const [eliminated, setEliminated] = useState<Player[]>([]);
  const [winners, setWinners] = useState<Player[]>([]);

  useEffect(() => {
    const fetchRoom = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/rooms/${roomId}`);
        if (!res.ok) throw new Error("Failed to fetch room data");
        const data = await res.json();
        setRoom(data);
        pairPlayers(data.players);
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

  useEffect(() => {
    const fetchQuestions = async () => {
      if (!room) return;
      try {
        const res = await fetch(`http://localhost:5000/api/questions/${room.subject}/${room.level}`);
        const data: Question[] = await res.json();
        setQuestions(data);
        setQuizStarted(true);
        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch questions:", err);
        setLoading(false);
      }
    };

    if (room) fetchQuestions();
  }, [room]);

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

  const pairPlayers = (players: Player[]) => {
    const shuffled = [...players].sort(() => Math.random() - 0.5);
    const pairs: { player1: Player; player2: Player }[] = [];
    for (let i = 0; i < shuffled.length; i += 2) {
      if (shuffled[i + 1]) {
        pairs.push({ player1: shuffled[i], player2: shuffled[i + 1] });
      } else {
        setWinners(prev => [...prev, shuffled[i]]);
      }
    }
    setPairings(pairs);
  };

  const handleNext = (selected: string | null) => {
    const pair = pairings[currentPairsIndex];
    const correctAnswer = questions[currentIndex].answer;

    const winner =
      selected && selected === correctAnswer
        ? pair.player1
        : pair.player2;

    const loser =
      selected && selected !== correctAnswer
        ? pair.player1
        : pair.player2;

    if (winner && loser) {
      setWinners(prev => [...prev, winner]);
      setEliminated(prev => [...prev, loser]);
    }

    if (currentPairsIndex + 1 < pairings.length) {
      setCurrentPairsIndex(prev => prev + 1);
      setCurrentIndex(prev => prev + 1);
    } else {
      if (winners.length + 1 <= 1) {
        setShowSummary(true);
      } else {
        const newPlayers = winners;
        setRoom(prev => prev ? { ...prev, players: newPlayers } : null);
        setWinners([]);
        setEliminated([]);
        pairPlayers(newPlayers);
        setCurrentPairsIndex(0);
        setCurrentIndex(prev => prev + 1);
      }
    }
  };

  const handleOptionClick = (option: string) => {
    setSelectedOption(option);
    setTimeout(() => handleNext(option), 800);
  };

  if (error) {
    return <div className="text-red-500 text-center mt-10">{error}</div>;
  }

  if (!room) {
    return <div className="text-center text-orange-300 mt-10">Loading room info...</div>;
  }

  if (loading) return <div className="text-center mt-10">Loading questions...</div>;

  if (showSummary) {
    return (
      <div className="p-6 max-w-xl mx-auto space-y-6 text-center">
        <h1 className="text-3xl font-bold">🏁 Game Over</h1>
        <p className="text-xl">Subject: {room.subject.toUpperCase()} | Level: {room.level}</p>
        <p className="text-lg mt-4 text-green-500">🏆 Winner: {winners.length === 1 ? winners[0].name : "No winner"}</p>
        <p className="text-red-400">❌ Eliminated: {eliminated.map(p => p.name).join(", ")}</p>
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
  const currentPair = pairings[currentPairsIndex];

  return (
    <div className="p-6 max-w-xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold">🎮 Game Room: {room.roomId}</h2>
      <p className="text-sm text-gray-500">Subject: {room.subject} | Level: {room.level}</p>
      <div className="text-right font-mono text-gray-600 text-sm">⏳ Time left: {timer}s</div>

      <div className="text-center text-xl font-bold my-4 text-orange-300">
        🥊 {currentPair?.player1.name} vs {currentPair?.player2.name}
      </div>

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
                    : 'bg-white hover:bg-blue-100'}`}
              >
                {option}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-6">
        <h3 className="text-xl font-semibold text-orange-300 mb-2">👥 Players</h3>
        <ul className="space-y-2">
          {room.players.map((player) => (
            <li key={player._id} className="p-3 bg-gray-800 text-white rounded-xl flex justify-between items-center">
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


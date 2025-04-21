import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import socket from './socket';

import PlayersList from './GameParts/PlayersList';
import QuestionCard from './GameParts/QuestionCard';
import Leaderboard from './GameParts/Leaderboard';
import RoomInfo from './GameParts/RoomInfo';

interface Player {
  _id: string;
  name: string;
}

interface Question {
  question: string;
  options: string[];
  correctAnswer: string;
}

const contentData: Record<string, Record<string, string[]>> = {
  Math: {
    Videos: ['Intro to Fractions', 'Algebra Basics', 'Geometry Crash Course'],
    Games: ['Math Race', 'Number Matching'],
    Simulations: ['Shape Explorer', 'Graph Plotter'],
  },
  Science: {
    Videos: ['Cell Structure', 'Newton’s Laws', 'Photosynthesis'],
    Games: ['Lab Safety Game', 'Periodic Table Puzzle'],
    Simulations: ['Electric Circuit Simulator', 'Water Cycle Model'],
  },
};

const GameRoom = () => {
  const { code } = useParams<{ code: string }>();

  const [players, setPlayers] = useState<Player[]>([]);
  const [hostName, setHostName] = useState<string | null>(null);
  const [subject, setSubject] = useState('Math');
  const [contentType, setContentType] = useState('Games');

  const [gameStarted, setGameStarted] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [playerName, setPlayerName] = useState<string>('');

  const [currentPair, setCurrentPair] = useState<Player[]>([]);
  const [question, setQuestion] = useState<Question | null>(null);
  const [timer, setTimer] = useState<number | null>(null);

  const [answered, setAnswered] = useState<boolean>(false);
  const [answerFeedback, setAnswerFeedback] = useState<string | null>(null);
  const [isCurrentUserInPair, setIsCurrentUserInPair] = useState<boolean | null>(null);

  const [allowedPlayerIds, setAllowedPlayerIds] = useState<string[]>([]); // Track allowed players

  useEffect(() => {
    const storedId = localStorage.getItem('userId');
    const storedName = localStorage.getItem('hostName');
    const storedPlayerName = localStorage.getItem('playerName');

    if (storedName) setHostName(storedName);
    if (storedId) setUserId(storedId);
    if (storedPlayerName) setPlayerName(storedPlayerName);

    socket.emit('rejoin-room', { code });

    socket.on('joined-room', ({ playerId, playerName }) => {
      localStorage.setItem('userId', playerId);
      localStorage.setItem('playerName', playerName);
      setUserId(playerId);
      setPlayerName(playerName);
    });

    socket.on('game-started', (playerList: Player[]) => {
      setPlayers(playerList);
      setGameStarted(true);
    });

    socket.on('update-players', (playerList: Player[]) => {
      setPlayers(playerList);
    });

    socket.on('knockout-round-started', ({ players, question, timer, allowedPlayerIds }) => {
      const safeQuestion = {
        question: question?.question || "No question received",
        options: Array.isArray(question?.options) && question.options.length > 0
          ? question.options
          : ["Option A", "Option B", "Option C", "Option D"],
        correctAnswer: question?.correctAnswer || "",
      };

      setCurrentPair(players);
      setQuestion(safeQuestion);
      setTimer(timer);
      setAnswered(false);
      setAnswerFeedback(null);

      setAllowedPlayerIds(allowedPlayerIds); // Set allowed player IDs from backend

      if (storedId) {
        const isInPair = players.some((p: any) => p._id === storedId || p.id === storedId);
        setIsCurrentUserInPair(isInPair);
      }

      const countdown = setInterval(() => {
        setTimer(prev => {
          if (!prev || prev <= 1) {
            clearInterval(countdown);
            return null;
          }
          return prev - 1;
        });
      }, 1000);
    });

    socket.on('answer-result', ({ correct, correctAnswer }) => {
      setAnswered(true);
      setAnswerFeedback(correct ? '✅ Correct!' : `❌ Wrong! Correct: ${correctAnswer}`);
    });

    return () => {
      socket.off('joined-room');
      socket.off('game-started');
      socket.off('update-players');
      socket.off('knockout-round-started');
      socket.off('answer-result');
    };
  }, [code]);

  const handleAnswer = (selectedOption: string) => {
    if (!answered && userId && question) {
      setAnswered(true);
      socket.emit('player-answer', {
        code,
        playerId: userId,
        answer: selectedOption,
      });
    }
  };

  const startKnockoutGame = () => {
    socket.emit('start-knockout-game', { code, subject });
  };

  const contentList = contentData[subject]?.[contentType] || [];

  if (!gameStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-r from-purple-900 via-blue-900 to-purple-800 text-white flex items-center justify-center">
        <p className="text-lg text-gray-300 animate-pulse">Waiting for host to start the game...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-purple-900 via-blue-900 to-purple-800 text-white p-6">
      <div className="max-w-5xl mx-auto bg-white/10 backdrop-blur-md p-6 rounded-2xl shadow-xl border border-white/20">
        <RoomInfo code={code} hostName={hostName} playerCount={players.length} />

        {/* Dropdowns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-semibold mb-1">📚 Subject</label>
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full p-2 rounded-md bg-white text-purple-950 focus:outline-none"
            >
              <option>Math</option>
              <option>Science</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1">🎮 Content Type</label>
            <select
              value={contentType}
              onChange={(e) => setContentType(e.target.value)}
              className="w-full p-2 rounded-md bg-white text-purple-950 focus:outline-none"
            >
              <option>Videos</option>
              <option>Games</option>
              <option>Simulations</option>
            </select>
          </div>
        </div>

        {contentType === 'Games' ? (
          <div className="text-center mb-6">
            <button
              className="mt-4 px-6 py-3 bg-orange-500 rounded-md text-lg hover:bg-orange-400 transition duration-300"
              onClick={startKnockoutGame}
            >
              🚀 Start Knockout Game
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-6">
            {contentList.map((item, index) => (
              <div
                key={index}
                className="bg-white/20 p-4 rounded-xl border border-white/30 shadow-md flex flex-col items-center text-center hover:bg-white/30 transition duration-300"
              >
                <img
                  src={`https://via.placeholder.com/150?text=${encodeURIComponent(item)}`}
                  alt={item}
                  className="w-full h-32 object-cover rounded-md mb-4"
                />
                <p className="font-semibold text-lg mb-2">{item}</p>
                <button className="px-4 py-2 bg-blue-500 rounded-md hover:bg-blue-400 text-white">
                  ▶️ Play
                </button>
              </div>
            ))}
          </div>
        )}

        <QuestionCard
          question={question}
          currentPair={currentPair}
          answered={answered}
          answerFeedback={answerFeedback}
          timer={timer}
          handleAnswer={handleAnswer}
          isCurrentUserInPair={isCurrentUserInPair}
          allowedPlayerIds={allowedPlayerIds}  // Pass the allowed player IDs to QuestionCard
        />
        <PlayersList players={players} currentPair={currentPair} userId={userId} />
        <Leaderboard />
      </div>
    </div>
  );
};

export default GameRoom;

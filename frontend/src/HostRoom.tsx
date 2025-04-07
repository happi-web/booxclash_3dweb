import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import socket from './socket';

const HostRoom = () => {
  const [code, setCode] = useState('');
  const [hostName, setHostName] = useState('');
  const [players, setPlayers] = useState<string[]>([]);
  const [questionType, setQuestionType] = useState('Math');
  const [difficultyLevel, setDifficultyLevel] = useState('Easy');
  const [numberOfPlayers, setNumberOfPlayers] = useState(4);
  const [includeHost, setIncludeHost] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    socket.on('update-players', (data) => {
      setPlayers(data.map((p: any) => p.name));
    });

    socket.on('redirect-to-game', ({ socketId }) => {
      if (socket.id === socketId) {
        navigate(`/game-room/${code}`);
      }
    });

    return () => {
      socket.off('update-players');
      socket.off('redirect-to-game');
    };
  }, [code, navigate]);

  const createRoom = async () => {
    try {
      const res = await axios.post('http://localhost:5000/api/rooms/create-room', {
        hostName,
        numberOfPlayers,
        questionType,
        difficultyLevel,
        includeHost,
      });

      const roomCode = res.data.code;
      setCode(roomCode);
      localStorage.setItem('hostName', hostName);

      if (includeHost) {
        socket.emit('join-room', { code: roomCode, name: hostName });
      }

      socket.emit('host-created-room', { code: roomCode, name: hostName });
    } catch (error) {
      console.error('Error creating room:', error);
    }
  };

  const startGame = () => {
    socket.emit('start-game', code);
    navigate(`/game-room/${code}`);
  };

  const canStart = includeHost ? players.length === numberOfPlayers : players.length === numberOfPlayers;

  return (
    <div className="flex items-center justify-center min-h-screen text-white">
      <div className="max-w-lg w-full p-6 rounded-lg shadow-lg bg-purple-500 bg-opacity-70">
        {!code ? (
          <div>
            <h2 className="text-3xl font-bold text-center mb-4">Create Game Room</h2>
            <input
              value={hostName}
              onChange={(e) => setHostName(e.target.value)}
              placeholder="Enter Your Name"
              className="w-full p-3 bg-gray-800 text-white rounded-md mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <label className="block text-center my-4">
              <input
                type="checkbox"
                checked={includeHost}
                onChange={(e) => setIncludeHost(e.target.checked)}
                className="mr-2"
              />
              Include Host in the Game
            </label>
            <div className="space-y-4 mb-4">
              <div>
                <label className="block mb-1">Select Question Type:</label>
                <select value={questionType} onChange={(e) => setQuestionType(e.target.value)} className="w-full p-3 bg-gray-800 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  <option value="Math">Math</option>
                  <option value="Science">Science</option>
                  <option value="General">General</option>
                </select>
              </div>
              <div>
                <label className="block mb-1">Select Difficulty:</label>
                <select value={difficultyLevel} onChange={(e) => setDifficultyLevel(e.target.value)} className="w-full p-3 bg-gray-800 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>
              <div>
                <label className="block mb-1">Number of Players:</label>
                <select value={numberOfPlayers} onChange={(e) => setNumberOfPlayers(Number(e.target.value))} className="w-full p-3 bg-gray-800 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  <option value={4}>4 Players</option>
                  <option value={8}>8 Players</option>
                  <option value={16}>16 Players</option>
                  <option value={32}>32 Players</option>
                </select>
              </div>
            </div>
            <button onClick={createRoom} className="cursor-pointer w-full py-3 bg-green-500 rounded-md text-lg hover:bg-green-600 transition ease-in-out duration-300">
              Create Room
            </button>
          </div>
        ) : (
          <div>
            <h2 className="text-2xl font-bold text-center mb-4">Room Code: {code}</h2>
            <h3 className="mt-4 text-xl font-semibold">Players:</h3>
            <ul className="space-y-2 text-lg">
              {players.map((p, i) => (
                <li key={i} className="flex justify-between items-center">
                  <span>{p}</span>
                </li>
              ))}
            </ul>

            <button
              onClick={startGame}
              className={`w-full py-3 mt-6 rounded-md text-lg ${canStart ? 'bg-blue-500 hover:bg-blue-600' : 'bg-gray-600 cursor-not-allowed'}`}
              disabled={!canStart}
            >
              Start Game
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default HostRoom;

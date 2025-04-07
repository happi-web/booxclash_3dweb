import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import socket from '../socket';

interface Player {
  _id: string;
  name: string;
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
  const [gameStarted, setGameStarted] = useState(false);
  const [hostName, setHostName] = useState<string | null>(null);

  const [subject, setSubject] = useState('Math');
  const [contentType, setContentType] = useState('Videos');

  useEffect(() => {
    const storedName = localStorage.getItem('hostName');
    if (storedName) setHostName(storedName);

    socket.emit('rejoin-room', { code });

    socket.on('game-started', (playerList: Player[]) => {
      setPlayers(playerList);
      setGameStarted(true);
    });

    socket.on('update-players', (playerList: Player[]) => {
      setPlayers(playerList);
    });

    return () => {
      socket.off('game-started');
      socket.off('update-players');
    };
  }, [code]);

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
        {/* Room Info */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-orange-400">
              Room Code: <span className="bg-white/20 px-2 py-1 rounded-lg">{code}</span>
            </h1>
            {hostName && (
              <p className="text-sm text-white/80 mt-1">
                👑 Host: <span className="font-semibold">{hostName}</span>
              </p>
            )}
          </div>
          <p className="text-sm text-white/70">Players Joined: {players.length}</p>
        </div>

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

        {/* Dynamic Content Display */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4">
            {contentType === 'Games' ? '🕹️ Multiplayer Game' : `📺 ${contentType} for ${subject}`}
          </h2>

          {contentType === 'Games' ? (
            <div className="text-center">
              <button
                className="mt-4 px-6 py-3 bg-orange-500 rounded-md text-lg hover:bg-orange-400 transition duration-300"
                onClick={() =>
                  socket.emit('start-game', code)
                }
              >
                🚀 Start Knockout Game
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
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
        </div>

        {/* Players List */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">🧑‍🤝‍🧑 Players in this room:</h2>
          <ul className="list-disc list-inside text-lg space-y-1">
            {players.map((p) => (
              <li key={p._id}>{p.name}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default GameRoom;

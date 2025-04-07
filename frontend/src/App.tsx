import { useState } from 'react';
import HostRoom from './HostRoom';
import JoinRoom from './JoinRoom';

const App = () => {
  const [view, setView] = useState<'home' | 'host' | 'join'>('home');

  return (
    <div className="min-h-screen bg-darkblue text-white flex flex-col items-center justify-center p-6">
      <h1 className="text-4xl font-extrabold mb-10 text-purple-400">
        🎮 BooxClash Smackdown
      </h1>

      {view === 'home' && (
        <div className="space-x-4">
          <button
            onClick={() => setView('host')}
            className="px-6 py-3 rounded-2xl bg-purple-500 hover:bg-purple-600 text-white text-lg font-semibold shadow-lg transition"
          >
            Host Game
          </button>
          <button
            onClick={() => setView('join')}
            className="px-6 py-3 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white text-lg font-semibold shadow-lg transition"
          >
            Join Game
          </button>
        </div>
      )}

      {view === 'host' && (
        <div className="w-full max-w-md mt-8">
          <HostRoom />
        </div>
      )}

      {view === 'join' && (
        <div className="w-full max-w-md mt-8">
          <JoinRoom />
        </div>
      )}
    </div>
  );
};

export default App;

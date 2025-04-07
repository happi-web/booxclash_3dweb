// src/pages/LandingPage.tsx

import { useNavigate } from "react-router-dom";

const Lobby = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-800 to-purple-900 flex flex-col items-center justify-center text-white p-6">
      <h1 className="text-4xl md:text-5xl font-extrabold mb-8">🧠 BooxClash</h1>
      <p className="text-xl mb-12 text-center max-w-lg">
        Host or join an exciting multiplayer quiz game with custom prompts and global players.
      </p>

      <div className="space-y-6 w-full max-w-sm">
        <button
          onClick={() => navigate("/signup")}
          className="w-full bg-green-600 hover:bg-green-700 py-3 px-4 rounded-xl text-lg font-semibold shadow-lg"
        >
          ➕ Create a Room
        </button>
        <button
          onClick={() => navigate("/join")}
          className="w-full bg-blue-600 hover:bg-blue-700 py-3 px-4 rounded-xl text-lg font-semibold shadow-lg"
        >
          🔑 Join a Room
        </button>
      </div>
    </div>
  );
};

export default Lobby;

import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { io } from "socket.io-client";

const socket = io("http://localhost:5000", { withCredentials: true });

const WaitingRoom = () => {
  const { code } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { quizSetup, isHost, name, country } = location.state || {};

  const [hostName, setHostName] = useState<string>("");
  const [hostCountry, setHostCountry] = useState<string>("");
  const [players, setPlayers] = useState<any[]>([]);
  const [status, setStatus] = useState("Waiting for players...");
  const [countdown, setCountdown] = useState<number | null>(null);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [audio] = useState(new Audio("/waiting-room.mp3"));

  useEffect(() => {
    if (isHost) {
      fetch("http://localhost:5000/api/current-user", {
        credentials: "include",
      })
        .then((res) => res.json())
        .then((data) => {
          console.log("Fetched host:", data);
          setHostName(data.name);
          setHostCountry(data.country);
        })
        .catch((err) => console.error("Error fetching host name:", err));
    } else if (name && country) {
      console.log("Emitting joinRoom with:", { code, name, country });
      socket.emit("joinRoom", { code, name, country });

      // Fallback API fetch to ensure player list is updated
      fetch(`http://localhost:5000/api/room/${code}`)
        .then((res) => res.json())
        .then((data) => {
          console.log("Fetched players from API:", data.players);
          setPlayers(data.players);
        })
        .catch((err) => console.error("Error fetching room data:", err));
    }

    // Listen for updated players list from socket
    socket.on("playerListUpdate", (updatedPlayers) => {
      console.log("Received socket player update:", updatedPlayers);
      setPlayers(updatedPlayers);
      if (updatedPlayers.length === quizSetup?.participants) {
        setStatus("Ready to start!");
      }
    });

    socket.on("gameStarted", () => {
      console.log("Game started event received.");
      setStatus("Game is starting...");
      startCountdown();
    });

    // Background music
    audio.loop = true;
    audio.volume = 0.3;
    audio.play().catch(() => {});

    return () => {
      socket.disconnect();
      audio.pause();
    };
  }, [isHost, name, country, code, quizSetup?.participants]);

  const startCountdown = () => {
    setCountdown(3);
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev === 1) {
          clearInterval(interval);
          startGameAnimation();
          return null;
        }
        return (prev ?? 1) - 1;
      });
    }, 1000);
  };

  const startGameAnimation = () => {
    setStatus("Loading game...");
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setLoadingProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        navigate("/play", { state: { players, quizSetup } });
      }
    }, 300);
  };

  const handleStartGame = () => {
    console.log("Host started the game.");
    socket.emit("startGame", { code });
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center py-10">
      <h1 className="text-3xl font-bold mb-6">Waiting Room</h1>

      <div className="bg-gray-800 rounded-xl shadow-lg p-6 w-full max-w-md space-y-4">
        <div className="flex justify-between">
          <span className="font-semibold">Room Code:</span>
          <div className="flex items-center gap-2">
            <span className="text-lg font-mono">{code}</span>
          </div>
        </div>

        <div className="flex justify-between">
          <span className="font-semibold">Host:</span>
          <span>{hostName || "Loading..."}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-semibold">Host Country:</span>
          <span>{hostCountry || "Loading..."}</span>
        </div>

        <div className="flex justify-between">
          <span className="font-semibold">Max Players:</span>
          <span>{quizSetup?.participants || 2}</span>
        </div>
      </div>

      <div className="mt-8 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-2">Players Joined</h2>
        <ul className="bg-gray-800 rounded-md p-4 space-y-2 max-h-48 overflow-auto">
          {players.length > 0 ? (
            players.map((player, idx) => (
              <li
                key={idx}
                className="bg-gray-700 p-2 rounded text-center font-medium"
              >
                {player.name} ({player.country})
              </li>
            ))
          ) : (
            <li className="text-gray-400 italic">Waiting for players...</li>
          )}
        </ul>

        <p className="text-sm text-center text-gray-400 mt-4">{status}</p>

        {countdown !== null && (
          <p className="text-2xl text-center font-bold my-4 animate-pulse">
            Game starting in {countdown}...
          </p>
        )}

        {loadingProgress > 0 && (
          <div className="w-full bg-gray-700 h-3 rounded mt-4">
            <div
              className="bg-green-500 h-3 rounded"
              style={{ width: `${loadingProgress}%` }}
            ></div>
          </div>
        )}

        {isHost &&
          players.length === quizSetup?.participants &&
          countdown === null && (
            <button
              onClick={handleStartGame}
              className="mt-6 bg-green-600 hover:bg-green-700 px-4 py-2 rounded-md w-full"
            >
              Start Game
            </button>
          )}
      </div>
    </div>
  );
};

export default WaitingRoom;

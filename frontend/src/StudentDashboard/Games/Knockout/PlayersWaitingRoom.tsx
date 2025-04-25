import { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { io } from "socket.io-client";

const socket = io("http://localhost:5000", { withCredentials: true });

interface Player {
  name: string;
  country: string;
}

const PlayerWaitingRoom = () => {
  const { roomId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const {
    playerName,
    playerCountry,
    subject,
    level,
    hostName,
    participants,
  } = location.state || {};

  const [players, setPlayers] = useState<Player[]>([]);
  const [maxPlayers, setMaxPlayers] = useState(participants || 4);
  const [status, setStatus] = useState("Waiting for the host to start...");

  useEffect(() => {
    if (!roomId || !playerName || !playerCountry) return;

    socket.emit("playerJoinRoom", {
      roomId,
      name: playerName,
      country: playerCountry,
    });

    const handlePlayerListUpdate = ({
      players,
      joinedCount,
      maxPlayers,
    }: {
      players: Player[];
      joinedCount: number;
      maxPlayers: number;
    }) => {
      setPlayers(players);
      setMaxPlayers(maxPlayers);
      setStatus(`Waiting for host to start... (${joinedCount}/${maxPlayers})`);
    };

    socket.on("playerListUpdate", handlePlayerListUpdate);

    return () => {
      socket.off("playerListUpdate", handlePlayerListUpdate);
    };
  }, [roomId, playerName, playerCountry]);

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center py-10">
      <h1 className="text-3xl font-bold mb-6">Player Lobby</h1>

      <div className="bg-gray-800 p-6 rounded-xl w-full max-w-md space-y-4 shadow">
        <p><strong>Room Code:</strong> {roomId}</p>
        <p><strong>You:</strong> {playerName} ({playerCountry})</p>
        <p><strong>Subject:</strong> {subject}</p>
        <p><strong>Level:</strong> {level}</p>
        <p><strong>Host:</strong> {hostName}</p>
        <p><strong>Max Players:</strong> {maxPlayers}</p>
      </div>

      <div className="mt-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-2">Players Joined:</h2>
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
      </div>
    </div>
  );
};

export default PlayerWaitingRoom;

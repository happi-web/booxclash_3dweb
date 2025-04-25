import { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import socket from "../../../socket";

interface Player {
  name: string;
  country: string;
}

const WaitingRoom = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const {
    subject,
    level,
    participants,
    hostName: stateHostName,
    hostCountry: stateHostCountry,
    hostIsPlayer,
  } = location.state || {};

  const [hostName] = useState(() => {
    const stored = sessionStorage.getItem("hostName");
    if (!stored && stateHostName) {
      sessionStorage.setItem("hostName", stateHostName);
    }
    return stored || stateHostName || "Host";
  });

  const [hostCountry] = useState(() => {
    const stored = sessionStorage.getItem("hostCountry");
    if (!stored && stateHostCountry) {
      sessionStorage.setItem("hostCountry", stateHostCountry);
    }
    return stored || stateHostCountry || "Unknown";
  });

  const [players, setPlayers] = useState<Player[]>([]);
  const [maxPlayers, setMaxPlayers] = useState(participants || 4);
  const [status, setStatus] = useState("Waiting for players...");
  const [copied, setCopied] = useState(false);
  const [showStartButton, setShowStartButton] = useState(false);

  const playerName = sessionStorage.getItem("playerName");
  const playerCountry = sessionStorage.getItem("playerCountry");

  useEffect(() => {
    if (!roomId) return;

    const isHost = !!hostName && !!hostCountry;

    if (isHost) {
      socket.emit("hostJoinRoom", {
        roomId,
        maxPlayers: participants,
      });
    }

    if (playerName && playerCountry && !sessionStorage.getItem("hasJoined")) {
      socket.emit("joinRoom", {
        roomId,
        name: playerName,
        country: playerCountry,
      });

      sessionStorage.setItem("hasJoined", "true");
    }

    const fetchPlayers = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/rooms/${roomId}/players`);
        if (res.ok) {
          let playersData = await res.json();

          if (hostIsPlayer) {
            const hostInList = playersData.some(
              (p: Player) => p.name === hostName && p.country === hostCountry
            );
            if (!hostInList) {
              playersData = [{ name: hostName, country: hostCountry }, ...playersData];
            }
          }

          setPlayers(playersData);
        }
      } catch (err) {
        console.error("Error fetching players:", err);
      }
    };

    fetchPlayers();

    const handlePlayerListUpdate = ({
      players,
      joinedCount,
      maxPlayers,
    }: {
      players: Player[];
      joinedCount: number;
      maxPlayers: number;
    }) => {
      let updatedPlayers = [...players];

      if (hostIsPlayer) {
        const hostInList = updatedPlayers.some(
          (p) => p.name === hostName && p.country === hostCountry
        );
        if (!hostInList) {
          updatedPlayers = [{ name: hostName, country: hostCountry }, ...updatedPlayers];
        }
      }

      setPlayers(updatedPlayers);
      setMaxPlayers(maxPlayers);

      if (joinedCount === maxPlayers) {
        setStatus("Room full. Waiting for host to start...");
        if (isHost) setShowStartButton(true);
      } else {
        setStatus(`${joinedCount}/${maxPlayers} Players Joined`);
        setShowStartButton(false);
      }
    };

    const handleGameStart = () => {
      const playersWithIds = players.map((p) => ({
        ...p,
        id: crypto.randomUUID(),
      }));

      navigate(`/play-ground/${roomId}`, {
        state: {
          roomId,
          players: playersWithIds,
          subject,
          level,
          hostName,
        },
      });
    };

    socket.on("playerListUpdate", handlePlayerListUpdate);
    socket.on("startGame", handleGameStart);

    return () => {
      socket.off("playerListUpdate", handlePlayerListUpdate);
      socket.off("startGame", handleGameStart);
    };
  }, [roomId, participants, navigate, subject, level, hostName, playerName, playerCountry, hostCountry, hostIsPlayer]);

  const handleCopyRoomCode = () => {
    if (!roomId) return;
    navigator.clipboard.writeText(roomId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleStartGame = () => {
    socket.emit("startGame", { roomId });
    setShowStartButton(false);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center py-10">
      <h1 className="text-3xl font-bold mb-6">Waiting Room</h1>

      <div className="bg-gray-800 p-6 rounded-xl w-full max-w-md space-y-4 shadow">
        <p>
          <strong>Room Code:</strong> {roomId}{" "}
          <button
            onClick={handleCopyRoomCode}
            className="ml-2 bg-purple-600 hover:bg-purple-700 px-2 py-1 rounded text-sm"
          >
            {copied ? "Copied!" : "Copy"}
          </button>
        </p>
        <p>
          <strong>Host:</strong> {hostName} ({hostCountry})
          {hostIsPlayer && <span className="text-green-400 ml-2">(Playing)</span>}
        </p>
        <p><strong>Subject:</strong> {subject}</p>
        <p><strong>Level:</strong> {level}</p>
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

        {showStartButton && (
          <button
            onClick={handleStartGame}
            className="mt-4 w-full bg-green-600 hover:bg-green-700 px-4 py-2 rounded-xl font-semibold text-white"
          >
            Start Game
          </button>
        )}
      </div>
    </div>
  );
};

export default WaitingRoom;

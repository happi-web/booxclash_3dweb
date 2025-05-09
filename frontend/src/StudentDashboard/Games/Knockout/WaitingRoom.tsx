import { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import socket from "../../../../socket";

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
    socket.on("gameStarting", () => {
      navigate(`/play-ground/${roomId}`, {
        state: {
          players,
          roomId,
          hostName,
          hostCountry,
          subject,
        },
      });
    });
  
    return () => {
      socket.off("gameStarting");
    };
  }, [players, roomId, hostName, hostCountry, subject]);
  
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
          (p: Player) => p.name === hostName && p.country === hostCountry
        );
        if (!hostInList) {
          updatedPlayers = [{ name: hostName, country: hostCountry }, ...updatedPlayers];
        }
      }
  
      setPlayers(updatedPlayers);
      setMaxPlayers(maxPlayers);
  
      if (joinedCount === maxPlayers) {
        setStatus("Room full. Waiting for host to start...");
        if (!!hostName && !!hostCountry) setShowStartButton(true);
      } else {
        setStatus(`${joinedCount}/${maxPlayers} Players Joined`);
        setShowStartButton(false);
      }
    };
  
    socket.on("playerListUpdate", handlePlayerListUpdate);
  
    return () => {
      socket.off("playerListUpdate", handlePlayerListUpdate);
    };
  }, [roomId, participants, subject, hostName, hostCountry, playerName, playerCountry, hostIsPlayer]);
  
  

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
    <div className="min-h-screen bg-blue/70 text-white flex flex-col items-center py-10">
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

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const generateRoomId = () => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

const HostGame = () => {
  const [roomId, setRoomId] = useState("");
  const [subject, setSubject] = useState("math");
  const [numPlayers, setNumPlayers] = useState(4);
  const [name, setName] = useState("");
  const [country, setCountry] = useState("");
  const [error, setError] = useState("");
  const [includeHost, setIncludeHost] = useState(false);
  const navigate = useNavigate();
  const API_BASE = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    setRoomId(generateRoomId());
    
    const fetchProfile = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/profile`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
        });

        if (!res.ok) throw new Error("Failed to fetch profile");

        const data = await res.json();
        setName(data.name || "");
        setCountry(data.country || "");
      } catch (err) {
        console.error("Profile fetch error:", err);
        setError("Failed to fetch profile.");
      }
    };

    fetchProfile();
  }, []);

  const handleStartGame = async () => {
    if (!subject || !name || !country) {
      return alert("Please fill in all fields.");
    }

    const isHostPlayer = includeHost;
    const totalPlayers = isHostPlayer ? numPlayers - 1 : numPlayers;

    const payload = {
      roomId,
      subject,
      numPlayers: totalPlayers,
      hostName: name,
      hostCountry: country,
      hostIsPlayer: isHostPlayer,
      players: isHostPlayer ? [{ name, country }] : [],
    };

    try {
      const res = await fetch(`${API_BASE}/api/rooms/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to create room");

      const room = await res.json();

      navigate(`/waiting-room/${room.roomId}`, {
        state: {
          roomId: room.roomId,
          subject,
          participants: totalPlayers,
          hostName: name,
          hostCountry: country,
          hostIsPlayer: isHostPlayer,
        },
      });
    } catch (err) {
      console.error(err);
      alert("Failed to create room. Try again.");
    }
  };

  return (
    <div className="space-y-4 p-4 bg-purple-900 rounded-xl shadow-lg max-w-md mx-auto mt-10">
      <h2 className="text-2xl font-bold text-purple-300">🎉 Host Game</h2>

      {error && <div className="text-red-500">{error}</div>}

      <div className="bg-purple-800 p-3 rounded-md text-purple-100">
        <p><strong>Host:</strong> {name || "Loading..."}</p>
        <p><strong>Country:</strong> {country || "Loading..."}</p>
      </div>

      <div>
        <label className="block mb-1 text-white">Room ID</label>
        <input
          type="text"
          value={roomId}
          readOnly
          className="w-full px-4 py-2 bg-gray-800 text-white rounded-md"
        />
      </div>

      <div>
        <label className="block mb-1 text-white">Subject</label>
        <select
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="w-full px-4 py-2 bg-gray-800 text-white rounded-md"
        >
          <option value="math">Math</option>
          <option value="science">Science</option>
        </select>
      </div>

      <div>
        <label className="block mb-1 text-white">Number of Players</label>
        <select
          value={numPlayers}
          onChange={(e) => setNumPlayers(parseInt(e.target.value))}
          className="w-full px-4 py-2 bg-gray-800 text-white rounded-md"
        >
          {[4, 8, 16, 32].map((num) => (
            <option key={num} value={num}>
              {num}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block mb-1 text-white">Include Host as Player</label>
        <input
          type="checkbox"
          checked={includeHost}
          onChange={(e) => setIncludeHost(e.target.checked)}
          className="mr-2"
        />
        <span className="text-white">Yes</span>
      </div>

      <button
        onClick={handleStartGame}
        className="w-full bg-purple-500 hover:bg-purple-600 px-4 py-2 rounded-xl font-semibold mt-4 text-white"
      >
        Start Game
      </button>
    </div>
  );
};

export default HostGame;

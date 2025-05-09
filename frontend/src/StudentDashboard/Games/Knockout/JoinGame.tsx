import { useState, useEffect } from "react";
import socket from "../../../../socket";
import { useNavigate } from "react-router-dom";

const JoinGame = () => {

  const [roomId, setroomId] = useState(() => sessionStorage.getItem("roomId") || "");
  const [name, setName] = useState("");
  const [country, setCountry] = useState("");
  const [waitingForHost, setWaitingForHost] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();
  const API_BASE = import.meta.env.VITE_API_BASE_URL;
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/profile`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionStorage.getItem("token")}`, // If you're using header-based auth
          },
        });

        if (!res.ok) throw new Error("Failed to fetch profile");

        const data = await res.json();
        console.log("Fetched profile:", data);

        // Set name and country from profile data
        setName(data.name || "");
        setCountry(data.country || "");
      } catch (err) {
        console.error("Profile fetch error:", err);
      }
    };

    fetchProfile();
  }, []);
  
  
  useEffect(() => {
    if (name) sessionStorage.setItem("playerName", name);
    if (country) sessionStorage.setItem("playerCountry", country);
    if (roomId) sessionStorage.setItem("roomId", roomId.toUpperCase());
  }, [name, country, roomId]);
  useEffect(() => {
    const handleStartGame = () => {
      const roomId = sessionStorage.getItem("roomId");
      if (roomId) {
        navigate(`/play-ground/${roomId}`);
      } else {
        console.warn("Room code missing!");
        navigate("/"); // fallback or redirect to home
      }
    };
    
  
    const handleRoomFull = ({ message }: { message: string }) => {
      setErrorMessage(message);
      setWaitingForHost(false); // fallback just in case
    };
  
    const handlePlayerWaiting = () => {
      setWaitingForHost(true);
      setErrorMessage(""); // clear error in case it's previously set
    };
  
    socket.on("gameStarting", handleStartGame);
    socket.on("roomFull", handleRoomFull);
    socket.on("playerWaiting", handlePlayerWaiting);
  
    return () => {
      socket.off("gameStarting", handleStartGame);
      socket.off("roomFull", handleRoomFull);
      socket.off("playerWaiting", handlePlayerWaiting);
    };
  }, [navigate]);
  
  const handleJoin = async () => {
    const code = roomId.trim().toUpperCase();
    if (!code || !name || !country) {
      return alert("Please fill in all fields before joining.");
    }
  
    try {
      const res = await fetch(`${API_BASE}/api/rooms/${code}`);
      if (!res.ok) throw new Error("Room not found.");
      const roomData = await res.json();
  
      const playerAlreadyJoined = roomData.players?.some((p: any) => p.name === name);
  
      socket.emit("joinRoom", { roomId: code, name, country });
  
      if (!playerAlreadyJoined) {
        const playerRes = await fetch(`${API_BASE}/api/rooms/${code}/join`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ roomId: code, name, country }),
        });
  
        if (!playerRes.ok) throw new Error("Failed to join the room.");
      }
  
      // Do NOT set this yet – wait for socket confirmation
      // setWaitingForHost(true);
      setroomId("");
      setErrorMessage("");
    } catch (err) {
      console.error(err);
      setErrorMessage("Room not found or join failed. Please try again.");
    }
  };
  

  return (
    <div className="p-4 bg-orange-900 rounded-xl shadow-lg space-y-4 max-w-md mx-auto mt-10">
      <h2 className="text-2xl font-bold text-orange-300 text-center">🔗 Join Game</h2>

      {errorMessage && <div className="text-red-500 text-center">{errorMessage}</div>}

      {!waitingForHost ? (
        <>
          <div>
            <label className="block mb-1 text-orange-100">Room Code</label>
            <input
              type="text"
              placeholder="ABC123"
              value={roomId}
              onChange={(e) => setroomId(e.target.value)}
              className="w-full px-4 py-2 bg-gray-800 text-white rounded-md uppercase tracking-widest"
            />
          </div>

          <div>
            <label className="block mb-1 text-orange-100">Your Name</label>
            <input
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 bg-gray-800 text-white rounded-md"
            />
          </div>

          <div>
            <label className="block mb-1 text-orange-100">Your Country</label>
            <input
              type="text"
              placeholder="Enter your country"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="w-full px-4 py-2 bg-gray-800 text-white rounded-md"
            />
          </div>

          <button
            onClick={handleJoin}
            className="w-full bg-orange-500 hover:bg-orange-600 px-4 py-2 rounded-xl font-semibold text-white"
          >
            Join Game
          </button>
        </>
      ) : (
        <div className="text-center text-orange-300">
          <h3 className="text-2xl font-bold">Waiting for the host to start the game...</h3>
        </div>
      )}
    </div>
  );
};
export default JoinGame;
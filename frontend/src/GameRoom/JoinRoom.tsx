import { useState } from "react";
import { useNavigate } from "react-router-dom";

const JoinRoom = () => {
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [country, setCountry] = useState("");
  const navigate = useNavigate();

  const handleJoinRoom = () => {
    if (!code || !name || !country) return alert("All fields are required");
    navigate(`/waiting-room/${code}`, {
        state: {
          name,
          country,
          code,
          isHost: false,
        },
      });
      
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
      <h1 className="text-3xl font-bold mb-6">Join Game Room</h1>

      <div className="bg-gray-800 p-6 rounded-xl space-y-4 w-full max-w-md shadow-lg">
        <div>
          <label className="block font-medium mb-1">Room Code</label>
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full p-2 rounded bg-gray-700 text-white"
            placeholder="e.g., ABC123"
          />
        </div>

        <div>
          <label className="block font-medium mb-1">Your Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-2 rounded bg-gray-700 text-white"
          />
        </div>

        <div>
          <label className="block font-medium mb-1">Country</label>
          <input
            type="text"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            className="w-full p-2 rounded bg-gray-700 text-white"
          />
        </div>

        <button
          onClick={handleJoinRoom}
          className="w-full bg-blue-600 hover:bg-blue-700 py-2 rounded-md"
        >
          Join Room
        </button>
      </div>
    </div>
  );
};

export default JoinRoom;

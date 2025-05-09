import { useState } from 'react';
import socket from '../../src/test/socket'; // adjust path if needed
const API_BASE = import.meta.env.VITE_API_BASE_URL;
type HostRoomProps = {
  onRoomCreated: (roomCode: string) => void;
};

const HostRoom = ({ onRoomCreated }: HostRoomProps) => {
  const [hostName, setHostName] = useState('');
  const [subject, setSubject] = useState<'Math' | 'Science'>('Math');
  const [maxPlayers, setMaxPlayers] = useState(2);
  const [roomCode, setRoomCode] = useState('');

  const createRoom = async () => {
    const generatedCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    setRoomCode(generatedCode);

    const roomData = {
      roomCode: generatedCode,
      hostName,
      subject,
      maxPlayers,
    };

    const res = await fetch(`${API_BASE}/api/rooms`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(roomData),
    });

    if (res.ok) {
      socket.emit('host-room', { roomCode: generatedCode, hostName });
      onRoomCreated(generatedCode);
    } else {
      console.error('Failed to create room');
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto bg-white shadow-md rounded">
      <h2 className="text-xl font-bold mb-4">Host a Room</h2>

      <label className="block mb-2">
        Host Name:
        <input
          type="text"
          className="w-full p-2 border mt-1 rounded"
          value={hostName}
          onChange={(e) => setHostName(e.target.value)}
          required
        />
      </label>

      <label className="block mb-2">
        Subject:
        <select
          className="w-full p-2 border mt-1 rounded"
          value={subject}
          onChange={(e) => setSubject(e.target.value as 'Math' | 'Science')}
        >
          <option value="Math">Math</option>
          <option value="Science">Science</option>
        </select>
      </label>

      <label className="block mb-4">
        Max Players:
        <select
          className="w-full p-2 border mt-1 rounded"
          value={maxPlayers}
          onChange={(e) => setMaxPlayers(Number(e.target.value))}
        >
          {[2, 4, 8, 16, 32].map((num) => (
            <option key={num} value={num}>{num}</option>
          ))}
        </select>
      </label>

      <button
        onClick={createRoom}
        className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Create Room
      </button>

      {roomCode && (
        <p className="mt-4 text-center">
          Room Code: <strong>{roomCode}</strong>
        </p>
      )}
    </div>
  );
};

export default HostRoom;

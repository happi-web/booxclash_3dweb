import { useState } from 'react';
import socket from '../../src/test/socket'; // Adjust the path as needed

type JoinRoomProps = {
  onJoin: (roomCode: string, playerName: string) => void;
};

const JoinRoom = ({ onJoin }: JoinRoomProps) => {
  const [roomCode, setRoomCode] = useState('');
  const [playerName, setPlayerName] = useState('');

  const handleJoin = () => {
    const trimmedCode = roomCode.trim().toUpperCase();
    const trimmedName = playerName.trim();

    if (trimmedCode && trimmedName) {
      socket.emit('join-room', { roomCode: trimmedCode, playerName: trimmedName });
      onJoin(trimmedCode, trimmedName);
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto bg-white shadow-md rounded">
      <h2 className="text-xl font-bold mb-4">Join a Room</h2>

      <input
        className="block w-full p-2 border mb-3 rounded"
        type="text"
        placeholder="Room Code"
        value={roomCode}
        onChange={(e) => setRoomCode(e.target.value)}
      />

      <input
        className="block w-full p-2 border mb-3 rounded"
        type="text"
        placeholder="Your Name"
        value={playerName}
        onChange={(e) => setPlayerName(e.target.value)}
      />

      <button
        className="w-full py-2 bg-green-600 text-white rounded hover:bg-green-700"
        onClick={handleJoin}
      >
        Join Room
      </button>
    </div>
  );
};

export default JoinRoom;

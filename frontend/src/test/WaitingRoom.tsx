import React, { useEffect, useState } from 'react';
import socket from '../../src/test/socket'; // Adjust the path if necessary

type WaitingRoomProps = {
  roomCode: string;
  players: string[];
  isHost: boolean;
  onStartQuiz: () => void;
};

const WaitingRoom: React.FC<WaitingRoomProps> = ({ roomCode, players: initialPlayers, isHost, onStartQuiz }) => {
  const [players, setPlayers] = useState<string[]>(initialPlayers);

  useEffect(() => {
    const handleUpdatePlayers = (updatedPlayers: { name: string }[]) => {
      setPlayers(updatedPlayers.map(p => p.name));
    };

    socket.on('update-players', handleUpdatePlayers);

    return () => {
      socket.off('update-players', handleUpdatePlayers);
    };
  }, []);
  const handleStartQuiz = () => {
    socket.emit('start-quiz', { roomCode });
    onStartQuiz(); // this will navigate to PlayGround
  };
  
  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-2">Room Code: {roomCode}</h2>
      <h3 className="text-lg mb-1">Players Joined:</h3>
      <ul className="list-disc ml-6">
        {players.map((player, idx) => (
          <li key={idx}>{player}</li>
        ))}
      </ul>
{isHost && (
  <button
    className="mt-4 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
    onClick={handleStartQuiz}
  >
    Start Quiz
  </button>
)}

    </div>
  );
};

export default WaitingRoom;

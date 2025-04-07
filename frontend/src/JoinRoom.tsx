import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import socket from './socket';
import axios from 'axios';

const JoinRoom = () => {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [joined, setJoined] = useState(false);
  const navigate = useNavigate();

  const joinRoom = async () => {
    try {
      await axios.post('http://localhost:5000/api/rooms/join-room', { name, code });
      socket.emit('join-room', { code, name });

      // Save room/player info
      localStorage.setItem('isHost', 'false');
      localStorage.setItem('playerName', name);
      localStorage.setItem('roomCode', code);

      setJoined(true);
    } catch (err) {
      alert('Room not found');
    }
  };

  useEffect(() => {
    const handleRedirect = (data: { code?: string }) => {
      const roomCode = data.code || code || localStorage.getItem('roomCode');
      if (roomCode) {
        navigate(`/game-room/${roomCode}`);
      } else {
        console.error('No valid room code for redirection');
      }
    };
  
    socket.on('redirect-to-game', handleRedirect);
  
    return () => {
      socket.off('redirect-to-game', handleRedirect);
    };
  }, [code, navigate]);
  

  return (
    <div>
      {!joined ? (
        <>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your Name"
            className="input"
          />
          <input
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="Room Code"
            className="input mt-2"
          />
          <button onClick={joinRoom} className="btn mt-4">Join Room</button>
        </>
      ) : (
        <h3>Joined room {code}! Waiting for game to start...</h3>
      )}
    </div>
  );
};

export default JoinRoom;

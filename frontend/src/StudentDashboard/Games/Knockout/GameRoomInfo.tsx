import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

interface Player {
  id: string;
  name: string;
  country?: string;
}

interface Room {
  _id: string;
  hostName: string;
  hostCountry: string;
  subject: string;
  level: string;
}

const GameRoomInfo: React.FC = () => {
  const { roomId, currentRound } = useParams<{ roomId: string; currentRound: string }>();
  
  const [room, setRoom] = useState<Room | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const API_BASE = import.meta.env.VITE_API_BASE_URL;
  useEffect(() => {
    const fetchRoomAndPlayers = async () => {
        try {
          setLoading(true);
          const [roomRes, playersRes] = await Promise.all([
            axios.get(`${API_BASE}/api/${roomId}`),  // Corrected the roomId URL here
            axios.get(`${API_BASE}/api/players/${roomId}/players`),
          ]);
      
          console.log('Room Response:', roomRes.data);
          console.log('Players Response:', playersRes.data);
      
          setRoom(roomRes.data);
          setPlayers(Array.isArray(playersRes.data) ? playersRes.data : []);
        } catch (error) {
          console.error('Error fetching room or players:', error);
        } finally {
          setLoading(false);
        }
      };
      
  
    fetchRoomAndPlayers();
  }, [roomId]);

  if (loading) {
    return <div className="text-yellow-400">Loading game info...</div>;
  }

  if (!room) {
    return <div className="text-red-400">Room not found.</div>;
  }

  return (
    <div style={{ border: '1px solid #333', padding: '1rem', borderRadius: '1rem', background: '#1e1e1e' }}>
      <h2 className="text-xl font-bold mb-2 text-yellow-300">Room ID: {room._id}</h2>
      <p><strong>Host:</strong> {room.hostName} ({room.hostCountry})</p>
      <p><strong>Subject:</strong> {room.subject}</p>
      <p><strong>Level:</strong> {room.level}</p>
      <p><strong>Current Round:</strong> {currentRound}</p>
      <p><strong>Total Players:</strong> {players.length}</p>
      <ul className="mt-2 list-disc list-inside text-sm text-gray-300">
        {players.map(player => (
          <li key={player.id}>{player.name} {player.country ? `(${player.country})` : ''}</li>
        ))}
      </ul>
    </div>
  );
};

export default GameRoomInfo;

import React from 'react';

interface Player {
  _id: string;
  name: string;
}

interface PlayersListProps {
  players: Player[];
  currentPair: Player[];
  userId: string | null;
}

const PlayersList: React.FC<PlayersListProps> = ({ players, currentPair, userId }) => {
  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold mb-2">🧑‍🤝‍🧑 Players in this room:</h2>
      <ul className="list-disc list-inside text-lg space-y-1">
        {players.map((p) => (
          <li
            key={p._id}
            className={currentPair.some(cp => cp._id === p._id) ? 'text-yellow-400 font-bold' : ''}
          >
            {p.name} {p._id === userId && '👈 (You)'}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PlayersList;

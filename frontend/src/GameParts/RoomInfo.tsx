import React from 'react';

interface RoomInfoProps {
  code: string | undefined;
  hostName: string | null;
  playerCount: number;
}

const RoomInfo: React.FC<RoomInfoProps> = ({ code, hostName, playerCount }) => (
  <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
    <div>
      <h1 className="text-2xl font-bold text-orange-400">
        Room Code: <span className="bg-white/20 px-2 py-1 rounded-lg">{code}</span>
      </h1>
      {hostName && (
        <p className="text-sm text-white/80 mt-1">
          👑 Host: <span className="font-semibold">{hostName}</span>
        </p>
      )}
    </div>
    <p className="text-sm text-white/70">Players Joined: {playerCount}</p>
  </div>
);

export default RoomInfo;

import React from 'react';

interface TimerProps {
  time: number | null;
}

const Timer: React.FC<TimerProps> = ({ time }) => {
  if (time === null) return null;
  return (
    <p className="text-xl font-bold text-red-400 animate-pulse mt-6">
      ⏱ {time} seconds left
    </p>
  );
};

export default Timer;

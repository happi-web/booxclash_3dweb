// hooks/useKnockoutGame.ts
import { useEffect, useState } from 'react';
import socket from './socket';

interface Player {
  _id: string;
  name: string;
}

interface Question {
  question: string;
  options: string[];
  answer?: string;
}

export const useKnockoutGame = (code: string) => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [currentPair, setCurrentPair] = useState<string[]>([]);
  const [question, setQuestion] = useState<Question | null>(null);
  const [timer, setTimer] = useState<number | null>(null);

  useEffect(() => {
    socket.emit('rejoin-room', { code });

    socket.on('game-started', (playerList: Player[]) => {
      setPlayers(playerList);
      setGameStarted(true);
    });

    socket.on('update-players', (playerList: Player[]) => {
      setPlayers(playerList);
    });

    socket.on('knockout-round-started', ({ players, question, timer }) => {
      setCurrentPair(players);
      setQuestion(question);
      setTimer(timer);

      const countdown = setInterval(() => {
        setTimer((prev) => {
          if (!prev || prev <= 1) {
            clearInterval(countdown);
            return null;
          }
          return prev - 1;
        });
      }, 1000);
    });

    return () => {
      socket.off('game-started');
      socket.off('update-players');
      socket.off('knockout-round-started');
    };
  }, [code]);

  const startKnockoutGame = (subject: string) => {
    socket.emit('start-knockout-game', { code, subject });
  };

  return {
    players,
    gameStarted,
    currentPair,
    question,
    timer,
    startKnockoutGame,
  };
};

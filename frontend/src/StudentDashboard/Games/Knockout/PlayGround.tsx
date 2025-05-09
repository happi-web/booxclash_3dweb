import React, { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";

import { io } from "socket.io-client";

const socket = io("http://localhost:5000"); // Replace with your server address

interface Player {
  id: string;
  name: string;
  country: string;
}


const questions = [
  { question: "Capital of France?", options: ["Berlin", "Paris", "Madrid", "Lisbon"], correctAnswer: "Paris" },
  { question: "Closest planet to the sun?", options: ["Venus", "Earth", "Mercury", "Mars"], correctAnswer: "Mercury" },
  { question: "Largest mammal?", options: ["Elephant", "Blue Whale", "Giraffe", "Hippo"], correctAnswer: "Blue Whale" },
  { question: "Language for styling web pages?", options: ["HTML", "JavaScript", "Python", "CSS"], correctAnswer: "CSS" },
  { question: "Red + Blue = ?", options: ["Purple", "Green", "Orange", "Brown"], correctAnswer: "Purple" },
  { question: "Spider has how many legs?", options: ["6", "8", "10", "12"], correctAnswer: "8" },
  { question: "Freezing point of water?", options: ["0°C", "32°C", "100°C", "4°C"], correctAnswer: "0°C" },
  { question: "Gas absorbed by plants?", options: ["Oxygen", "Nitrogen", "Carbon Dioxide", "Hydrogen"], correctAnswer: "Carbon Dioxide" }
];


const correctSound = new Audio("./sounds/correc.mp3");
const incorrectSound = new Audio("./sounds/incorrec.mp3");

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

const PlayGround: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const {
    roomId,
    players = [],  // Default to an empty array if players is not passed
    subject,
    hostName,
  } = location.state || {};

  if (!Array.isArray(players)) {
    console.error("players is not an array", players);  // Log for debugging
  }

  const allPlayers = useRef<Player[]>([...players]); // Ensure players is iterable
  const roundPool = useRef<Player[]>([...players]);
  const winners = useRef<any[]>([]);
  const eliminated = useRef<{ [name: string]: number }>({});
  const scores = useRef<{ [id: string]: number }>({});
  const currentPair = useRef<any[]>([]);
  const currentQuestionIndex = useRef(0);
  const currentPlayerTurn = useRef(0);
  const currentRound = useRef(1);
  const timer = useRef(15);
  const countdown = useRef(5);
  const timerInterval = useRef<NodeJS.Timeout | null>(null);
  const countdownInterval = useRef<NodeJS.Timeout | null>(null);
  const shownStages = useRef({ 1: false, 2: false, final: false });
  const [winnersDisplay, setWinnersDisplay] = useState<any[]>([]);
  const [eliminatedDisplay, setEliminatedDisplay] = useState<{ [name: string]: number }>({});
  const [allPlayersDisplay] = useState<Player[]>(players || []);
  const [playerList, setPlayerList] = useState<Player[]>(players || []); // Ensure players defaults to an empty array if undefined
  const [roomInfo, setRoomInfo] = useState({
    roomId,
    subject,
    hostName,
  });

  useEffect(() => {
    socket.on("startGame", () => {
      nextPair(); // Starts the game when the event is received
    });
  
    return () => {
      socket.off("startGame");
    };
  }, []);

  useEffect(() => {
    nextPair();
    return () => {
      if (timerInterval.current) clearInterval(timerInterval.current);
      if (countdownInterval.current) clearInterval(countdownInterval.current);
    };
  }, []);
  useEffect(() => {
    socket.on("gameStarting", () => {
      console.log("Game is starting...");
      nextPair();
    });
  
    socket.on("newQuestion", ({ question, currentPlayer, leaderboard, timeLeft }) => {
      console.log("New question received", question);
      renderIncomingQuestion(question, currentPlayer);
    });
  
    socket.on("timerUpdate", ({ timeLeft }) => {
      const timerEl = containerRef.current?.querySelector("#timer");
      if (timerEl) timerEl.textContent = `⏱ ${timeLeft} seconds left`;
    });
  
    socket.on("timeUp", () => {
      console.log("Time's up!");
      handleAnswer(null, questions[currentQuestionIndex.current].correctAnswer);
    });
  
    socket.on("roundEnded", ({ leaderboard }) => {
      console.log("Round ended", leaderboard);
      setWinnersDisplay(leaderboard);
    });
  
    socket.on("playerListUpdate", ({ players }) => {
      setPlayerList(players);
    });
  
    return () => {
      socket.off("gameStarting");
      socket.off("newQuestion");
      socket.off("timerUpdate");
      socket.off("timeUp");
      socket.off("roundEnded");
      socket.off("playerListUpdate");
    };
  }, []);
  
  function renderStageIntro(round: number, callback: () => void) {
    let message = "";
    let delay = 5000;

    if (round === 1 && !shownStages.current[1]) {
      message = "🎯 Round 1 Underway: Knockout Stage";
      shownStages.current[1] = true;
    } else if (round === 2 && !shownStages.current[2]) {
      message = "🔥 Round 2 Underway: Semi-Finals";
      shownStages.current[2] = true;
    } else if (round >= 3 && !shownStages.current.final) {
      message = "🏆 The Finals Begin: Only One Will Triumph!";
      delay = 10000;
      shownStages.current.final = true;
    }

    if (containerRef.current) {
      if (message) {
        containerRef.current.innerHTML = `
          <h2 style="font-size: 28px; font-weight: bold; margin-bottom: 10px; color: #facc15;">${message}</h2>
          <p id="stageCountdown" style="font-size: 48px; font-weight: bold;">${delay / 1000}</p>
        `;
        let remaining = delay / 1000;
        const countdownEl = containerRef.current.querySelector("#stageCountdown");

        const interval = setInterval(() => {
          remaining--;
          if (countdownEl) countdownEl.textContent = String(remaining);
          if (remaining <= 0) {
            clearInterval(interval);
            callback();
          }
        }, 1000);
      } else {
        callback();
      }
    }
  }

  function nextPair() {
    if (winners.current.length === 1 && roundPool.current.length === 0) {
      if (timerInterval.current) clearInterval(timerInterval.current);
      if (containerRef.current) {
        containerRef.current.innerHTML = `<h2 class="text-2xl font-bold text-green-400">🏆 Winner: ${winners.current[0].name}</h2>`;
      }
      return;
    }
  
    if (roundPool.current.length === 0) {
      if (winners.current.length > 0) {
        roundPool.current = [...winners.current];
        winners.current = [];
        currentRound.current++;
        roundPool.current = shuffle(roundPool.current);
      } else {
        roundPool.current = shuffle([...players]);
      }
    }
  
    if (roundPool.current.length === 1) {
      const byePlayer = roundPool.current.pop();
      if (byePlayer) {
        winners.current.push(byePlayer);
      }
      setTimeout(nextPair, 1000);
      return;
    }
  
    if (roundPool.current.length < 2 && winners.current.length > 0) {
      setTimeout(nextPair, 1000);
      return;
    }
  
    // Ensure there are two players to form a pair
    const player1 = roundPool.current.shift();
    const player2 = roundPool.current.shift();
  
    if (player1 && player2) {
      currentPair.current = [player1, player2];
      scores.current[currentPair.current[0].id] = 0;
      scores.current[currentPair.current[1].id] = 0;
      currentQuestionIndex.current = 0;
      currentPlayerTurn.current = 0;
  
      renderStageIntro(currentRound.current, renderCountdown);
    } else {
      console.error('Not enough players to form a pair', roundPool.current);
    }
  }
  

  function renderCountdown() {
    if (countdownInterval.current) clearInterval(countdownInterval.current);
    countdown.current = 5;

    if (containerRef.current) {
      containerRef.current.innerHTML = `
        <h2 style="color:#fb923c; font-size:24px; font-weight:bold">Round ${currentRound.current}</h2>
        <p style="font-size:22px; margin-top: 40px">⏳ Get ready!</p>
        <p id="countdown" style="font-size:48px; font-weight:bold; margin-top:10px;">${countdown.current}</p>
      `;

      const countdownEl = containerRef.current.querySelector("#countdown");
      countdownInterval.current = setInterval(() => {
        countdown.current--;
        if (countdownEl) countdownEl.textContent = String(countdown.current);
        if (countdown.current <= 0) {
          if (countdownInterval.current) clearInterval(countdownInterval.current);
          renderQuestion(questions[currentQuestionIndex.current], currentPair.current[currentPlayerTurn.current]);
        }
      }, 1000);
    }
  }

  function renderQuestion(questionData: any, currentPlayer: any) {
    const q = questionData; // from server
    const [p1, p2] = currentPair.current;
  
    if (containerRef.current) {
      containerRef.current.innerHTML = `
        <div class="timer" id="timer"></div>
        <div class="game-stage" style="display: flex; justify-content: space-around; align-items: center; width: 100%;">
          <div class="player-pod" id="playerA">${p1.name}</div>
          <div class="question-screen" id="questionCard">
            <h2>Question</h2>
            <p>${q.question}</p>
            <div id="options"></div>
          </div>
          <div class="player-pod" id="playerB">${p2.name}</div>
        </div>
      `;
  
      const optionsDiv = containerRef.current.querySelector("#options");
      q.options.forEach((opt: string) => {
        const btn = document.createElement("button");
        btn.textContent = opt;
        btn.disabled = currentPlayer.id !== socket.id; // Only current player can answer
        btn.onclick = () => handleAnswer(opt, q.correctAnswer);
        optionsDiv?.appendChild(btn);
      });
    }
  }
  

  function startTimer(correctAnswer: string) {
    const timerEl = containerRef.current?.querySelector("#timer");
    timerInterval.current = setInterval(() => {
      timer.current--;
      if (timerEl) timerEl.textContent = `⏱ ${timer.current} seconds left`;
      if (timer.current <= 0) {
        if (timerInterval.current) clearInterval(timerInterval.current);
        handleAnswer(null, correctAnswer);
      }
    }, 1000);
  }

  function handleAnswer(answer: string | null, correctAnswer: string) {
    if (timerInterval.current) clearInterval(timerInterval.current);
    const currentPlayer = currentPair.current[currentPlayerTurn.current];
    const feedback = containerRef.current?.querySelector("#feedback");

    const isCorrect = answer === correctAnswer;

    if (isCorrect) {
      scores.current[currentPlayer.id]++;
      correctSound.currentTime = 0;
      correctSound.play();
    } else {
      incorrectSound.currentTime = 0;
      incorrectSound.play();
    }

    if (feedback) feedback.textContent = `${currentPlayer.name} answered ${isCorrect ? "✅ Correct!" : "❌ Wrong or Timeout!"}`;
    disableButtons(correctAnswer, answer);

    if (scores.current[currentPlayer.id] === 2) {
      setTimeout(() => evaluatePair(), 1500);
      return;
    }

    currentPlayerTurn.current = (currentPlayerTurn.current + 1) % 2;
    setTimeout(() => {
      if (currentPlayerTurn.current === 0) currentQuestionIndex.current++;
      if (currentQuestionIndex.current < 3) {
        renderCountdown();
      } else {
        evaluatePair();
      }
    }, 1500);
  }

  function disableButtons(correct: string, chosen: string | null) {
    const buttons = containerRef.current?.querySelectorAll("button");
    buttons?.forEach(btn => {
      btn.disabled = true;
      if (btn.textContent === correct) btn.className = "btn green disabled";
      else if (btn.textContent === chosen) btn.className = "btn red disabled";
      else btn.className = "btn disabled";
    });
  }

function evaluatePair() {
    const [p1, p2] = currentPair.current;
    const p1Score = scores.current[p1.id];
    const p2Score = scores.current[p2.id];

    let advancingPlayer = null;
    let eliminatedPlayer = null;

    if (p1Score === 2) {
      advancingPlayer = p1;
      eliminatedPlayer = p2;
    } else if (p2Score === 2) {
      advancingPlayer = p2;
      eliminatedPlayer = p1;
    } else {
      advancingPlayer = Math.random() < 0.5 ? p1 : p2;
      eliminatedPlayer = advancingPlayer === p1 ? p2 : p1;
    }

    winners.current.push(advancingPlayer);
    eliminated.current[eliminatedPlayer.name] = (eliminated.current[eliminatedPlayer.name] || 0) + 1;

    // Update React state for UI
    setWinnersDisplay([...winners.current]);
    setEliminatedDisplay({ ...eliminated.current });

    if (currentRound.current >= 3 && roundPool.current.length === 0 && winners.current.length === 1) {
      containerRef.current!.innerHTML = `
        <h2 class="text-3xl font-bold text-yellow-400">🎉 Congratulations, ${advancingPlayer.name}!</h2>
        <p style="font-size: 20px; margin-top: 10px;">🏆 You are the Ultimate Champion!</p>
      `;
      return;
    } else {
      containerRef.current!.innerHTML = `
        <p>✅ ${advancingPlayer.name} advances to the next round!</p>
        <p>❌ ${eliminatedPlayer.name} is eliminated!</p>
      `;
      setTimeout(nextPair, 2000);
    }
  }

  return (
    <div className="flex flex-row gap-4 p-4">
      {/* Main game content */}
      <div className="flex-1">
      <div ref={containerRef} className="p-4 text-white"></div>
      </div>
  
      <div className="mb-4 bg-gray-800 p-4 rounded-xl shadow text-white">
      <h2 className="text-xl font-semibold">Game Details</h2>
      <p><strong>Room ID:</strong> {roomInfo.roomId}</p>
      <p><strong>Host:</strong> {roomInfo.hostName}</p>
      <p><strong>Subject:</strong> {roomInfo.subject}</p>
    </div>

    <div className="mb-6 bg-gray-800 p-4 rounded-xl shadow text-white">
      <h3 className="text-lg font-semibold mb-2">All Players</h3>
      <ul className="grid grid-cols-2 gap-2">
        {playerList.map((player) => (
          <li key={player.id} className="bg-gray-700 p-2 rounded text-sm text-center">
            {player.name} ({player.country})
          </li>
        ))}
      </ul>
    </div>

  
        <div>
          <h3 className="text-lg font-semibold text-green-400">✅ Winners This Round</h3>
          <ul className="list-disc list-inside text-sm mt-2">
            {winnersDisplay.map(p => (
              <li key={p.id}>{p.name}</li>
            ))}
          </ul>
        </div>
  
        <div>
          <h3 className="text-lg font-semibold text-red-400">❌ Eliminated Players</h3>
          <ul className="list-disc list-inside text-sm mt-2">
            {Object.entries(eliminatedDisplay).map(([name, count]) => (
              <li key={name}>{name} (×{count})</li>
            ))}
          </ul>
        </div>
      </div>
  );
  
};

export default PlayGround;






import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import io from "socket.io-client";

const socket = io("http://localhost:5000");

interface Player {
  _id: string;
  name: string;
  country: string;
}

interface Room {
  roomId: string;
  subject: string;
  level: string;
  hostName: string;
  hostCountry: string;
  players: Player[];
  numPlayers: number;
}

interface Question {
  question: string;
  options: string[];
  correctAnswer: string;
}

const GameRoom: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const winnersListRef = useRef<HTMLUListElement>(null);
  const eliminatedListRef = useRef<HTMLUListElement>(null);
  const { roomId } = useParams<{ roomId: string }>();

  const [room, setRoom] = useState<Room | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  // Game state variables
  const [players, setPlayers] = useState<Player[]>([]);
  const [currentPair, setCurrentPair] = useState<Player[]>([]);
  const [currentRound, setCurrentRound] = useState(1);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [timer, setTimer] = useState(15);
  const [countdown, setCountdown] = useState(5);
  const [winners, setWinners] = useState<Player[]>([]);
  const [eliminated, setEliminated] = useState<Record<string, number>>({});
  const [currentPlayerTurn, setCurrentPlayerTurn] = useState(0);
  const [roundPool, setRoundPool] = useState<Player[]>([]);
  const [shownStages, setShownStages] = useState({
    1: false,
    2: false,
    final: false
  });

  // Timer references
  const timerInterval = useRef<NodeJS.Timeout>();
  const countdownInterval = useRef<NodeJS.Timeout>();

  useEffect(() => {
    const fetchRoomAndQuestions = async () => {
      try {
        // Fetch room data
        const res = await fetch(`http://localhost:5000/api/rooms/${roomId}`);
        if (!res.ok) throw new Error("Failed to fetch room data");
        const roomData = await res.json();
        setRoom(roomData);

        // Initialize players
        setPlayers(roomData.players);

        // Fetch questions based on room subject and level
        const questionsRes = await fetch(
          `http://localhost:5000/api/questions/${roomData.subject}/${roomData.level}`
        );
        if (!questionsRes.ok) throw new Error("Failed to fetch questions");
        const questionsData = await questionsRes.json();
        setQuestions(questionsData);

        setLoading(false);
      } catch (err) {
        console.error(err);
        setError("Unable to load room data. Please try again.");
        setLoading(false);
      }
    };

    fetchRoomAndQuestions();

    return () => {
      socket.off("quizStarted");
      clearInterval(timerInterval.current);
      clearInterval(countdownInterval.current);
    };
  }, [roomId]);

  const shuffle = (arr: any[]) => [...arr].sort(() => Math.random() - 0.5);

  const renderStageIntro = (round: number, callback: () => void) => {
    const container = containerRef.current;
    let message = "";
    let delay = 5000;

    if (round === 1 && !shownStages[1]) {
      message = "🎯 Round 1 Underway: Knockout Stage";
      setShownStages(prev => ({ ...prev, 1: true }));
    } else if (round === 2 && !shownStages[2]) {
      message = "🔥 Round 2 Underway: Semi-Finals";
      setShownStages(prev => ({ ...prev, 2: true }));
    } else if (round >= 3 && !shownStages.final) {
      message = "🏆 The Finals Begin: Only One Will Triumph!";
      delay = 10000;
      setShownStages(prev => ({ ...prev, final: true }));
    }

    if (message && container) {
      container.innerHTML = `
        <h2 style="font-size: 28px; font-weight: bold; margin-bottom: 10px; color: #facc15;">${message}</h2>
        <p id="stageCountdown" style="font-size: 48px; font-weight: bold;">${delay / 1000}</p>
      `;
      let remaining = delay / 1000;
      const countdownEl = document.getElementById("stageCountdown");

      const interval = setInterval(() => {
        remaining--;
        if (countdownEl) countdownEl.textContent = `${remaining}`;
        if (remaining <= 0) {
          clearInterval(interval);
          callback();
        }
      }, 1000);
    } else {
      callback();
    }
  };

  const nextPair = () => {
    const container = containerRef.current;
    
    // Check for winner
    if (winners.length === 1 && roundPool.length === 0 && players.length === 0) {
      clearInterval(timerInterval.current);
      if (container) container.innerHTML = `<h2 class="text-2xl font-bold text-green-400">🏆 Winner: ${winners[0].name}</h2>`;
      return;
    }

    // Refill round pool if empty
    if (roundPool.length === 0) {
      const newRoundPool = [...players];
      setPlayers([]);
      setRoundPool(shuffle(newRoundPool));
      if (currentRound > 1 || shownStages[1]) {
        setCurrentRound(prev => prev + 1);
      }
    }

    // Handle odd number of players
    if (roundPool.length === 1) {
      setPlayers(prev => [...prev, roundPool[0]]);
      setRoundPool([]);
    }

    // Check for final winner
    if (roundPool.length < 2) {
      if (players.length === 0 && winners.length === 1) {
        if (container) container.innerHTML = `<h2 class="text-2xl font-bold text-green-400">🏆 Winner: ${winners[0].name}</h2>`;
        return;
      }
      setPlayers([...winners]);
      setWinners([]);
      nextPair();
      return;
    }

    // Set new pair
    const newPair = [roundPool[0], roundPool[1]];
    setCurrentPair(newPair);
    setScores({
      [newPair[0]._id]: 0,
      [newPair[1]._id]: 0
    });
    setCurrentQuestionIndex(0);
    setCurrentPlayerTurn(0);
    setRoundPool(prev => prev.slice(2));

    renderStageIntro(currentRound, renderCountdown);
  };

  const renderCountdown = () => {
    clearInterval(countdownInterval.current);
    setCountdown(5);
    const container = containerRef.current;

    if (container) {
      container.innerHTML = `
        <h2 style="color:#fb923c; font-size:24px; font-weight:bold">
          Round ${currentRound}: ${currentPair[0].name} 🆚 ${currentPair[1].name}
        </h2>
        <p style="font-size:22px; margin-top: 40px">⏳ Get ready!</p>
        <p id="countdown" style="font-size:48px; font-weight:bold; margin-top:10px;">${countdown}</p>
      `;
    }

    countdownInterval.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownInterval.current);
          renderQuestion();
          return 0;
        }
        return prev - 1;
      });
      
      const el = document.getElementById("countdown");
      if (el) el.textContent = `${countdown}`;
    }, 1000);
  };

  const renderQuestion = () => {
    clearInterval(timerInterval.current);
    setTimer(15);
    const q = questions[Math.floor(Math.random() * questions.length)];
    const container = containerRef.current;

    if (container) {
      container.innerHTML = `
        <h2 style="color:#fb923c; font-size:24px; font-weight:bold">
          Round ${currentRound}: ${currentPair[0].name} 🆚 ${currentPair[1].name}
        </h2>
        <p style="font-size:20px; margin:20px 0">${q.question}</p>
        <div id="options"></div>
        <div id="feedback" class="feedback"></div>
        <div id="timer" class="timer">⏱ ${timer} seconds left</div>
        <p style="margin-top: 16px;">${currentPair[0].name}: ${scores[currentPair[0]._id] || 0} | ${currentPair[1].name}: ${scores[currentPair[1]._id] || 0}</p>
      `;
    }

    const optionsDiv = document.getElementById("options");

    q.options.forEach(opt => {
      const btn = document.createElement("button");
      btn.textContent = opt;
      btn.className = "btn green";
      btn.onclick = () => handleAnswer(opt, q.correctAnswer);
      optionsDiv?.appendChild(btn);
    });

    startTimer(q.correctAnswer);
  };

  const startTimer = (correctAnswer: string) => {
    timerInterval.current = setInterval(() => {
      setTimer(prev => {
        if (prev <= 1) {
          clearInterval(timerInterval.current);
          handleAnswer(null, correctAnswer);
          return 0;
        }
        return prev - 1;
      });
      
      const timerEl = document.getElementById("timer");
      if (timerEl) timerEl.textContent = `⏱ ${timer} seconds left`;
    }, 1000);
  };

  const handleAnswer = (answer: string | null, correctAnswer: string) => {
    clearInterval(timerInterval.current);
    const currentPlayer = currentPair[currentPlayerTurn];
    const feedback = document.getElementById("feedback");

    const isCorrect = answer === correctAnswer;
    if (isCorrect) {
      setScores(prev => ({
        ...prev,
        [currentPlayer._id]: (prev[currentPlayer._id] || 0) + 1
      }));
    }

    if (feedback) {
      feedback.textContent = `${currentPlayer.name} answered ${isCorrect ? "✅ Correct!" : "❌ Wrong or Timeout!"}`;
    }

    disableButtons(correctAnswer, answer);

    if ((scores[currentPlayer._id] || 0) + (isCorrect ? 1 : 0) === 2) {
      setTimeout(() => evaluatePair(), 1500);
      return;
    }

    setCurrentPlayerTurn((currentPlayerTurn + 1) % 2);

    setTimeout(() => {
      if ((currentPlayerTurn + 1) % 2 === 0) {
        setCurrentQuestionIndex(prev => prev + 1);
      }
      if (currentQuestionIndex < 2) {
        renderCountdown();
      } else {
        evaluatePair();
      }
    }, 1500);
  };

  const disableButtons = (correctAnswer: string, chosen: string | null) => {
    const buttons = document.querySelectorAll("button");
    buttons.forEach(btn => {
      btn.disabled = true;
      if (btn.textContent === correctAnswer) {
        btn.className = "btn green disabled";
      } else if (btn.textContent === chosen) {
        btn.className = "btn red disabled";
      } else {
        btn.className = "btn disabled";
      }
    });
  };

  const evaluatePair = () => {
    const container = containerRef.current;
    const [p1, p2] = currentPair;
    const p1Score = scores[p1._id] || 0;
    const p2Score = scores[p2._id] || 0;

    let advancingPlayer, eliminatedPlayer;
    if (p1Score <= 1 && p2Score <= 1) {
      advancingPlayer = Math.random() < 0.5 ? p1 : p2;
    } else if (p1Score <= 1) {
      advancingPlayer = p2;
    } else {
      advancingPlayer = p1;
    }

    eliminatedPlayer = advancingPlayer === p1 ? p2 : p1;
    
    setPlayers(prev => [...prev, advancingPlayer]);
    setEliminated(prev => ({
      ...prev,
      [eliminatedPlayer.name]: (prev[eliminatedPlayer.name] || 0) + 1
    }));

    if (container) {
      if (currentRound >= 3) {
        container.innerHTML = `
          <h2 class="text-3xl font-bold text-yellow-400">🎉 Congratulations, ${advancingPlayer.name}!</h2>
          <p style="font-size: 20px; margin-top: 10px;">🏆 You are the Ultimate Champion!</p>
          <p style="color: #ef4444; font-size: 18px; margin-top: 12px;">💔 ${eliminatedPlayer.name} fought bravely and made it to the finals.</p>
        `;
      } else {
        container.innerHTML = `
          <h2 class="text-2xl font-bold text-green-400">✅ ${advancingPlayer.name} advances!</h2>
          <p style="color: #ef4444; font-size: 20px; margin-top: 12px;">❌ ${eliminatedPlayer.name} is eliminated.</p>
        `;
      }
    }

    updateStatusLists();

    setTimeout(() => nextPair(), currentRound >= 3 ? 4000 : 2500);
  };

  const updateStatusLists = () => {
    const winnersList = winnersListRef.current;
    const eliminatedList = eliminatedListRef.current;

    if (winnersList) {
      winnersList.innerHTML = "";
      players.forEach(p => {
        const li = document.createElement("li");
        li.style.color = "#4ade80";
        li.textContent = `${p.name} (Advancing)`;
        winnersList.appendChild(li);
      });
    }

    if (eliminatedList) {
      eliminatedList.innerHTML = "";
      for (const name in eliminated) {
        const li = document.createElement("li");
        li.style.color = "#f87171";
        li.textContent = `${name} (Eliminated: ${eliminated[name]}x)`;
        eliminatedList.appendChild(li);
      }
    }
  };

  useEffect(() => {
    if (!loading && players.length > 0 && questions.length > 0) {
      setPlayers(shuffle(players));
      setWinners([]);
      updateStatusLists();
      nextPair();
    }
  }, [loading, players, questions]);

  if (error) {
    return <div className="text-red-500 text-center mt-10">{error}</div>;
  }

  if (loading || !room) {
    return <div className="text-center text-orange-300 mt-10">Loading room info...</div>;
  }

  return (
    <div style={{ fontFamily: "sans-serif", background: "#121212", color: "white", padding: 20 }}>
      <div className="card" ref={containerRef}></div>
      <div style={{ display: "flex", justifyContent: "center", gap: 40, marginTop: 40 }}>
        <div>
          <h3 style={{ color: "#22c55e", fontSize: 20 }}>✅ Winners</h3>
          <ul ref={winnersListRef} style={{ color: "white", listStyle: "square", paddingLeft: 20 }} />
        </div>
        <div>
          <h3 style={{ color: "#ef4444", fontSize: 20 }}>❌ Eliminated</h3>
          <ul ref={eliminatedListRef} style={{ color: "white", listStyle: "square", paddingLeft: 20 }} />
        </div>
      </div>
    </div>
  );
};

export default GameRoom;
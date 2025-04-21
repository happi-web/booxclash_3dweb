import React, { useEffect, useRef } from "react";

const GameRoom: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const winnersListRef = useRef<HTMLUListElement>(null);
  const eliminatedListRef = useRef<HTMLUListElement>(null);

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

  let players = [
    { id: "p1", name: "Alice" },
    { id: "p2", name: "Bob" },
    { id: "p3", name: "Charlie" },
    { id: "p4", name: "Dana" },
    { id: "p5", name: "Eli" },
    { id: "p6", name: "Faye" },
    { id: "p7", name: "Gabe" },
    { id: "p8", name: "Hana" }
  ];

  let currentPair: any[] = [];
  let currentRound = 1;
  let currentQuestionIndex = 0;
  let scores: Record<string, number> = {};
  let timer = 15;
  let timerInterval: any;
  let countdown = 5;
  let countdownInterval: any;
  let winners: any[] = [];
  let eliminated: Record<string, number> = {};
  let currentPlayerTurn = 0;
  let roundPool: any[] = [];

  const shownStages = {
    1: false,
    2: false,
    final: false
  };

  const shuffle = (arr: any[]) => arr.sort(() => Math.random() - 0.5);

  const renderStageIntro = (round: number, callback: () => void) => {
    const container = containerRef.current;
    let message = "";
    let delay = 5000;

    if (round === 1 && !shownStages[1]) {
      message = "🎯 Round 1 Underway: Knockout Stage";
      shownStages[1] = true;
    } else if (round === 2 && !shownStages[2]) {
      message = "🔥 Round 2 Underway: Semi-Finals";
      shownStages[2] = true;
    } else if (round >= 3 && !shownStages.final) {
      message = "🏆 The Finals Begin: Only One Will Triumph!";
      delay = 10000;
      shownStages.final = true;
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
    if (winners.length === 1 && roundPool.length === 0 && players.length === 0) {
      clearInterval(timerInterval);
      if (container) container.innerHTML = `<h2 class="text-2xl font-bold text-green-400">🏆 Winner: ${winners[0].name}</h2>`;
      return;
    }

    if (roundPool.length === 0) {
      roundPool = [...players];
      players = [];
      shuffle(roundPool);
      if (currentRound > 1 || shownStages[1]) currentRound++;
    }

    if (roundPool.length === 1) {
      players.push(roundPool.pop());
    }

    if (roundPool.length < 2) {
      if (players.length === 0 && winners.length === 1) {
        if (container) container.innerHTML = `<h2 class="text-2xl font-bold text-green-400">🏆 Winner: ${winners[0].name}</h2>`;
        return;
      }
      players = [...winners];
      winners = [];
      nextPair();
      return;
    }

    currentPair = [roundPool.shift(), roundPool.shift()];
    scores[currentPair[0].id] = 0;
    scores[currentPair[1].id] = 0;
    currentQuestionIndex = 0;
    currentPlayerTurn = 0;

    renderStageIntro(currentRound, renderCountdown);
  };

  const renderCountdown = () => {
    clearInterval(countdownInterval);
    countdown = 5;
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

    countdownInterval = setInterval(() => {
      countdown--;
      const el = document.getElementById("countdown");
      if (el) el.textContent = `${countdown}`;
      if (countdown <= 0) {
        clearInterval(countdownInterval);
        renderQuestion();
      }
    }, 1000);
  };

  const renderQuestion = () => {
    clearInterval(timerInterval);
    timer = 15;
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
        <p style="margin-top: 16px;">${currentPair[0].name}: ${scores[currentPair[0].id]} | ${currentPair[1].name}: ${scores[currentPair[1].id]}</p>
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
    timerInterval = setInterval(() => {
      timer--;
      const timerEl = document.getElementById("timer");
      if (timerEl) timerEl.textContent = `⏱ ${timer} seconds left`;
      if (timer <= 0) {
        clearInterval(timerInterval);
        handleAnswer(null, correctAnswer);
      }
    }, 1000);
  };

  const handleAnswer = (answer: string | null, correctAnswer: string) => {
    clearInterval(timerInterval);
    const currentPlayer = currentPair[currentPlayerTurn];
    const feedback = document.getElementById("feedback");

    const isCorrect = answer === correctAnswer;
    if (isCorrect) scores[currentPlayer.id]++;

    if (feedback) {
      feedback.textContent = `${currentPlayer.name} answered ${isCorrect ? "✅ Correct!" : "❌ Wrong or Timeout!"}`;
    }

    disableButtons(correctAnswer, answer);

    if (scores[currentPlayer.id] === 2) {
      setTimeout(() => evaluatePair(), 1500);
      return;
    }

    currentPlayerTurn = (currentPlayerTurn + 1) % 2;

    setTimeout(() => {
      if (currentPlayerTurn === 0) currentQuestionIndex++;
      if (currentQuestionIndex < 3) {
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
    const p1Score = scores[p1.id];
    const p2Score = scores[p2.id];

    let advancingPlayer, eliminatedPlayer;
    if (p1Score <= 1 && p2Score <= 1) {
      advancingPlayer = Math.random() < 0.5 ? p1 : p2;
    } else if (p1Score <= 1) {
      advancingPlayer = p2;
    } else {
      advancingPlayer = p1;
    }

    eliminatedPlayer = advancingPlayer === p1 ? p2 : p1;
    players.push(advancingPlayer);
    eliminated[eliminatedPlayer.name] = (eliminated[eliminatedPlayer.name] || 0) + 1;

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
    players = shuffle(players);
    winners = [];
    updateStatusLists();
    nextPair();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

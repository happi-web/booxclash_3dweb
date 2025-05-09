import React, { useEffect, useState, useRef } from "react";

interface Question {
  question: string;
  options: string[];
  correctAnswer: string;
}

interface Player {
  id: string;
  name: string;
}

const roomId = "abc123"; // <-- Replace with dynamic routing later

const shuffle = <T,>(arr: T[]): T[] => arr.sort(() => Math.random() - 0.5);

const PlayGround: React.FC = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [roundPool, setRoundPool] = useState<Player[]>([]);
  const [, setWinners] = useState<Player[]>([]);
  const [currentPair, setCurrentPair] = useState<Player[]>([]);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [currentRound, setCurrentRound] = useState(1);
  const [currentPlayerTurn, setCurrentPlayerTurn] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [stageCountdown, setStageCountdown] = useState(0);
  const [timer, setTimer] = useState(15);
  const [countdown, setCountdown] = useState(5);
  const [room, setRoom] = useState<any>(null);
  const [message, setMessage] = useState("");
  const [feedback, setFeedback] = useState("");
  const [question, setQuestion] = useState<Question | null>(null);
  const [eliminated, setEliminated] = useState<Record<string, number>>({});
  const [phase, setPhase] = useState<"intro" | "countdown" | "question" | "result" | "done">("intro");

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countdownRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const shownStages = useRef({ 1: false, 2: false, final: false });

  useEffect(() => {
    const fetchGameData = async () => {
      try {
        const roomRes = await fetch(`http://localhost:5000/api/rooms/${roomId}`);
        const roomData = await roomRes.json();

        setRoom(roomData);
        setPlayers(shuffle(roomData.players));
        setRoundPool(shuffle(roomData.players));

        const qRes = await fetch(`http://localhost:5000/api/questions/${roomData.subject}/${roomData.level}`);
        const qData = await qRes.json();

        setQuestions(qData);
      } catch (err) {
        console.error("Error fetching room or questions:", err);
      }
    };

    fetchGameData();
  }, []);

  useEffect(() => {
    if (phase === "intro") handleStageIntro();
    else if (phase === "countdown") startCountdown();
    else if (phase === "question") startQuestion();
  }, [phase]);
  
  useEffect(() => {
    if (phase === "intro") {
      handleStageIntro();
    } else if (phase === "countdown") {
      startCountdown();
    } else if (phase === "question") {
      startQuestion();
    }
  }, [phase]);

  const handleStageIntro = () => {
    let text = "";
    let delay = 5;

    if (currentRound === 1 && !shownStages.current[1]) {
      text = "🎯 Round 1 Underway: Knockout Stage";
      shownStages.current[1] = true;
    } else if (currentRound === 2 && !shownStages.current[2]) {
      text = "🔥 Round 2 Underway: Semi-Finals";
      shownStages.current[2] = true;
    } else if (currentRound >= 3 && !shownStages.current.final) {
      text = "🏆 The Finals Begin: Only One Will Triumph!";
      delay = 10;
      shownStages.current.final = true;
    }

    setMessage(text);
    setStageCountdown(delay);

    const interval = setInterval(() => {
      setStageCountdown(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          setPhase("countdown");
        }
        return prev - 1;
      });
    }, 1000);
  };

  const startCountdown = () => {
    setCountdown(5);
    countdownRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownRef.current!);
          setPhase("question");
        }
        return prev - 1;
      });
    }, 1000);
  };

  const startQuestion = () => {
    setTimer(15);
    const q = questions[Math.floor(Math.random() * questions.length)];
    setQuestion(q);

    timerRef.current = setInterval(() => {
      setTimer(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          handleAnswer(null);
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleAnswer = (answer: string | null) => {
    clearInterval(timerRef.current!);
    const currentPlayer = currentPair[currentPlayerTurn];
    const correct = question?.correctAnswer === answer;
    const updatedScores = { ...scores };

    if (correct) updatedScores[currentPlayer.id] = (updatedScores[currentPlayer.id] || 0) + 1;
    setScores(updatedScores);
    setFeedback(`${currentPlayer.name} answered ${correct ? "✅ Correct!" : "❌ Wrong or Timeout!"}`);

    const nextTurn = (currentPlayerTurn + 1) % 2;
    setCurrentPlayerTurn(nextTurn);

    setTimeout(() => {
      if (nextTurn === 0) {
        const newIndex = currentQuestionIndex + 1;
        setCurrentQuestionIndex(newIndex);
        if (newIndex >= 3) {
          evaluatePair(updatedScores);
        } else {
          setPhase("countdown");
        }
      } else {
        setPhase("countdown");
      }
    }, 1500);
  };

  const evaluatePair = (scoresMap: Record<string, number>) => {
    const [p1, p2] = currentPair;
    const p1Score = scoresMap[p1.id] || 0;
    const p2Score = scoresMap[p2.id] || 0;

    let advancing: Player;
    let eliminatedPlayer: Player;

    if (p1Score <= 1 && p2Score <= 1) {
      advancing = Math.random() < 0.5 ? p1 : p2;
    } else if (p1Score > p2Score) {
      advancing = p1;
    } else {
      advancing = p2;
    }

    eliminatedPlayer = advancing === p1 ? p2 : p1;

    setPlayers(prev => [...prev, advancing]);
    setEliminated(prev => ({
      ...prev,
      [eliminatedPlayer.name]: (prev[eliminatedPlayer.name] || 0) + 1,
    }));

    if (currentRound >= 3) {
      setMessage(`🎉 Congratulations, ${advancing.name}!\n🏆 You are the Ultimate Champion!\n💔 ${eliminatedPlayer.name} made it to the finals.`);
      setPhase("done");
    } else {
      setMessage(`✅ ${advancing.name} advances!\n❌ ${eliminatedPlayer.name} is eliminated.`);
      setTimeout(() => {
        nextPair();
        setPhase("intro");
      }, 2500);
    }
  };

  const nextPair = () => {
    const pool = [...roundPool];
    if (pool.length < 2) {
      const newRoundPlayers = [...players];
      setWinners([]);
      setPlayers([]);
      setRoundPool(newRoundPlayers);
      setCurrentRound(prev => prev + 1);
      return;
    }

    const pair = [pool.shift()!, pool.shift()!];
    setCurrentPair(pair);
    setRoundPool(pool);
    setScores({});
    setCurrentQuestionIndex(0);
    setCurrentPlayerTurn(0);
  };

  // Start initial pair after load
  useEffect(() => {
    if (roundPool.length >= 2 && currentPair.length === 0) {
      nextPair();
    }
  }, [roundPool]);

  return (
    <div className="p-6 max-w-xl mx-auto">
      {phase === "intro" && (
        <div>
          <h2 className="text-xl font-bold text-yellow-400">{message}</h2>
          <p className="text-4xl font-bold">{stageCountdown}</p>
        </div>
      )}
      {phase === "countdown" && (
        <div>
          <h2 className="text-lg font-bold text-orange-400">
            Round {currentRound}: {currentPair[0]?.name} 🆚 {currentPair[1]?.name}
          </h2>
          <p className="text-2xl mt-4">⏳ Get ready!</p>
          <p className="text-4xl font-bold mt-2">{countdown}</p>
        </div>
      )}
      {phase === "question" && question && (
        <div>
          <h2 className="text-lg font-bold text-orange-400">
            Round {currentRound}: {currentPair[0]?.name} 🆚 {currentPair[1]?.name}
          </h2>
          <p className="text-xl mt-4">{question.question}</p>
          <div className="grid grid-cols-2 gap-2 mt-4">
            {question.options.map(opt => (
              <button
                key={opt}
                className="btn bg-green-300"
                onClick={() => handleAnswer(opt)}
              >
                {opt}
              </button>
            ))}
          </div>
          <p className="mt-4 text-sm">⏱ {timer} seconds left</p>
          <p className="mt-2">{currentPair[0]?.name}: {scores[currentPair[0]?.id] || 0} | {currentPair[1]?.name}: {scores[currentPair[1]?.id] || 0}</p>
          <p className="mt-2 text-blue-500">{feedback}</p>
        </div>
      )}
      {phase === "done" && (
        <div className="text-center">
          <h2 className="text-3xl font-bold text-yellow-400">{message}</h2>
        </div>
      )}
      <div className="mt-6">
        <h3 className="font-bold text-green-400">Advancing:</h3>
        <ul>
          {players.map(p => (
            <li key={p.id}>{p.name}</li>
          ))}
        </ul>
        <h3 className="font-bold text-red-400 mt-4">Eliminated:</h3>
        <ul>
          {Object.entries(eliminated).map(([name, count]) => (
            <li key={name}>{name} (x{count})</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default PlayGround;

import { useEffect, useState } from 'react';

const TILE_TYPES = ['Cell', 'Neuron', 'DNA', 'Heart', 'Lung', 'Bone'];

const getRandomTile = () => TILE_TYPES[Math.floor(Math.random() * TILE_TYPES.length)];

const QUIZ_QUESTIONS = [
  {
    question: "Which organelle is known as the powerhouse of the cell?",
    options: ["Mitochondria", "Nucleus", "Ribosome", "Chloroplast"],
    answer: "Mitochondria",
  },
  {
    question: "Which part of the cell contains genetic material?",
    options: ["Nucleus", "Golgi Apparatus", "Cytoplasm", "Lysosome"],
    answer: "Nucleus",
  },
  {
    question: "Which system is responsible for transporting blood?",
    options: ["Circulatory", "Respiratory", "Digestive", "Nervous"],
    answer: "Circulatory",
  },
  {
    question: "What is the basic unit of life?",
    options: ["Cell", "Tissue", "Organ", "Organism"],
    answer: "Cell",
  },
  {
    question: "Which body system controls reflex actions?",
    options: ["Nervous", "Muscular", "Respiratory", "Endocrine"],
    answer: "Nervous",
  }
];

const generateBoard = (rows = 6, cols = 6) =>
  Array.from({ length: rows }, () =>
    Array.from({ length: cols }, getRandomTile)
  );

export default function BiologyMatch3Game() {
  const [board, setBoard] = useState(generateBoard());
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<[number, number] | null>(null);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizQuestion, setQuizQuestion] = useState<null | typeof QUIZ_QUESTIONS[0]>(null);
  const [multiplier, setMultiplier] = useState(1);
  const [, setMatchEffects] = useState<Set<string>>(new Set());
  const [shakeEffect, setShakeEffect] = useState<Set<string>>(new Set());

  useEffect(() => {
    const matches = findMatches(board);
    if (matches.length > 0) {
      const newBoard = [...board.map(row => [...row])];
      const matchedIds = new Set<string>();
      matches.forEach(([r, c]) => {
        matchedIds.add(`${r}-${c}`);
      });
      setMatchEffects(matchedIds);
      setTimeout(() => {
        matches.forEach(([r, c]) => {
          newBoard[r][c] = getRandomTile();
        });
        setBoard(newBoard);
        setMatchEffects(new Set());
      }, 500);

      setScore(prev => prev + matches.length * 10 * multiplier);
      if (Math.random() < 0.25) {
        const random = QUIZ_QUESTIONS[Math.floor(Math.random() * QUIZ_QUESTIONS.length)];
        setQuizQuestion(random);
        setShowQuiz(true);
      }
    }
  }, [board]);

  function findMatches(board: string[][]) {
    const matches: [number, number][] = [];

    for (let r = 0; r < board.length; r++) {
      for (let c = 0; c < board[r].length - 2; c++) {
        if (
          board[r][c] === board[r][c + 1] &&
          board[r][c] === board[r][c + 2]
        ) {
          matches.push([r, c], [r, c + 1], [r, c + 2]);
        }
      }
    }

    for (let c = 0; c < board[0].length; c++) {
      for (let r = 0; r < board.length - 2; r++) {
        if (
          board[r][c] === board[r + 1][c] &&
          board[r][c] === board[r + 2][c]
        ) {
          matches.push([r, c], [r + 1, c], [r + 2, c]);
        }
      }
    }

    return matches;
  }

  function handleTileClick(row: number, col: number) {
    if (!selected) {
      setSelected([row, col]);
    } else {
      const [prevRow, prevCol] = selected;
      const isAdjacent =
        (Math.abs(prevRow - row) === 1 && prevCol === col) ||
        (Math.abs(prevCol - col) === 1 && prevRow === row);

      if (isAdjacent) {
        const newBoard = board.map(row => [...row]);
        [newBoard[prevRow][prevCol], newBoard[row][col]] = [
          newBoard[row][col],
          newBoard[prevRow][prevCol],
        ];
        const previewMatches = findMatches(newBoard);
        if (previewMatches.length === 0) {
          const id1 = `${prevRow}-${prevCol}`;
          const id2 = `${row}-${col}`;
          setShakeEffect(new Set([id1, id2]));
          setTimeout(() => setShakeEffect(new Set()), 500);
        } else {
          setBoard(newBoard);
        }
        setSelected(null);
      } else {
        setSelected([row, col]);
      }
    }
  }

  function handleQuizAnswer(correct: boolean) {
    if (correct) {
      setMultiplier(2);
      setTimeout(() => setMultiplier(1), 10000);
    }
    setShowQuiz(false);
    setQuizQuestion(null);
  }

  return (
    <div className="max-w-md mx-auto bg-gray-900 text-white p-6 rounded-2xl shadow-xl mt-10">
      <h2 className="text-2xl font-bold text-center mb-2">🧬 Biology Match-3</h2>
      <p className="text-center mb-4">
        Score: <span className="font-semibold">{score}</span>
        {multiplier > 1 && <span className="ml-2 text-yellow-400">✨ x{multiplier}</span>}
      </p>

      <div className="grid grid-cols-6 gap-1 justify-center">
        {board.map((row, rIdx) =>
          row.map((tile, cIdx) => {
            const isSelected = selected?.[0] === rIdx && selected?.[1] === cIdx;
            const isPaired =
              selected &&
              ((Math.abs(selected[0] - rIdx) === 1 && selected[1] === cIdx) ||
                (Math.abs(selected[1] - cIdx) === 1 && selected[0] === rIdx));
            const isHighlighted = isSelected || isPaired;
            const tileId = `${rIdx}-${cIdx}`;

            return (
              <div
                key={tileId}
                className={`bg-purple-700 rounded-md text-sm text-center py-2 cursor-pointer transition-transform ${
                  isHighlighted ? 'ring-2 ring-green-400 scale-105' : 'hover:scale-105'
                } ${shakeEffect.has(tileId) ? 'animate-shake' : ''}`}
                onClick={() => handleTileClick(rIdx, cIdx)}
              >
                {tile}
              </div>
            );
          })
        )}
      </div>

      {showQuiz && quizQuestion && (
        <div className="mt-6 bg-gray-800 p-4 rounded-xl border border-purple-600">
          <h4 className="text-lg font-semibold mb-2">🔍 Biology Bonus Question</h4>
          <p className="mb-3">{quizQuestion.question}</p>
          <div className="grid grid-cols-2 gap-3">
            {quizQuestion.options.map(option => (
              <button
                key={option}
                onClick={() => handleQuizAnswer(option === quizQuestion.answer)}
                className="bg-blue-600 hover:bg-blue-500 px-3 py-2 rounded-md text-sm"
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

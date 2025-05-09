import { useState, useEffect } from "react";
import { Howl } from "howler";
import correctSoundFile from "/sounds/correct.mp3";
import wrongSoundFile from "/sounds/incorrect.mp3";

const correctSound = new Howl({ src: [correctSoundFile] });
const wrongSound = new Howl({ src: [wrongSoundFile] });

const levels = [
  { base: 2, number: 13 },
  { base: 5, number: 23 },
  { base: 8, number: 42 },
];

interface GetDigitsResult {
    (number: number, base: number): number[];
}

const getDigits: GetDigitsResult = (number, base) => {
    return number.toString(base).split("").map(Number);
};

interface PlaceValuesResult {
    (base: number, length: number): number[];
}

const placeValues: PlaceValuesResult = (base, length) => {
    return Array.from({ length }, (_, i) => Math.pow(base, length - i - 1));
};

const NumberBases = () => {
  const [currentLevel, setCurrentLevel] = useState(0);
  const [digits, setDigits] = useState<number[]>([]);
  const [dropZones, setDropZones] = useState<(number | null)[]>([]);
  const [timer, setTimer] = useState(30);
  const [challengeMode, setChallengeMode] = useState(false);

  const level = levels[currentLevel];

  useEffect(() => {
    const digitArray = getDigits(level.number, level.base);
    setDigits([...digitArray].sort(() => Math.random() - 0.5));
    setDropZones(new Array(digitArray.length).fill(null));
    setTimer(30);
  }, [currentLevel, level.number, level.base]);

  useEffect(() => {
    const countdown = setInterval(() => {
      setTimer((prev) => {
        if (prev === 1) {
          clearInterval(countdown);
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(countdown);
  }, [currentLevel]);

  const checkAnswer = () => {
    const playerAnswer = dropZones.join("");
    const correct = level.number.toString(level.base);
    if (playerAnswer === correct) {
      correctSound.play();
      setTimeout(() => {
        setCurrentLevel((prev) => (prev + 1) % levels.length);
      }, 1500);
    } else {
      wrongSound.play();
    }
  };

interface HandleDropParams {
    digit: number;
    index: number;
}

const handleDrop = ({ digit, index }: HandleDropParams) => {
    const newDropZones = [...dropZones];
    newDropZones[index] = digit;
    setDropZones(newDropZones);
};

  const placeVal = placeValues(level.base, dropZones.length);

  return (
    <div className="p-6 max-w-3xl mx-auto text-center">
      <h1 className="text-2xl font-bold mb-2">Base Converter Challenge</h1>
      <p className="mb-4">
        Convert <strong>{level.number}</strong> into base <strong>{level.base}</strong>
      </p>
      <p className="text-red-500 mb-4">Time left: {timer}s</p>

      <div className="flex justify-center gap-3 mb-4">
        {dropZones.map((zone, i) => (
          <div
            key={i}
            onClick={() => {
              const newDropZones = [...dropZones];
              newDropZones[i] = null;
              setDropZones(newDropZones);
            }}
            className="w-14 h-14 border-2 border-dashed rounded text-xl flex items-center justify-center bg-white text-black relative"
          >
            {zone !== null ? zone : "?"}
            <span className="absolute text-xs top-full left-1/2 -translate-x-1/2 mt-1">
              {level.base}<sup>{placeVal[i].toString().length - 1}</sup>
            </span>
          </div>
        ))}
      </div>

      <div className="flex justify-center gap-2 mb-4">
        {digits.map((digit, i) => (
          <button
            key={i}
            onClick={() => {
              const emptyIndex = dropZones.indexOf(null);
              if (emptyIndex !== -1) {
                handleDrop({ digit, index: emptyIndex });
              }
            }}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            {digit}
          </button>
        ))}
      </div>

      <div className="flex justify-center gap-3 mt-6">
        <button
          onClick={checkAnswer}
          className="bg-green-600 text-white px-5 py-2 rounded hover:bg-green-700"
        >
          Check
        </button>
        <button
          onClick={() => setChallengeMode(!challengeMode)}
          className="bg-yellow-500 text-black px-5 py-2 rounded hover:bg-yellow-600"
        >
          {challengeMode ? "Normal Mode" : "Challenge Mode"}
        </button>
      </div>
    </div>
  );
};

export default NumberBases;

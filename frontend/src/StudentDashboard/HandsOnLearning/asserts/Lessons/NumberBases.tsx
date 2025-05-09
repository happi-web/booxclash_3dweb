import { useState, useEffect } from "react";
import Confetti from "react-confetti";
import { Howl } from "howler";
import {
  DndContext,
  useSensor,
  useSensors,
  PointerSensor,
  DragEndEvent,
  closestCenter,
  useDroppable,
} from "@dnd-kit/core";
import {
  useSortable,
  SortableContext,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import correctSoundFile from "/sounds/correct.mp3";
import wrongSoundFile from "/sounds/incorrect.mp3";

const correctSound = new Howl({ src: [correctSoundFile] });
const wrongSound = new Howl({ src: [wrongSoundFile] });

const levels = [
  { base: 2, number: 13 },
  { base: 3, number: 25 },
  { base: 5, number: 44 },
  { base: 8, number: 66 },
  { base: 4, number: 30 },
];

const divideSteps = (number: number, base: number) => {
  const steps = [];
  while (number > 0) {
    const quotient = Math.floor(number / base);
    const remainder = number % base;
    steps.push({ quotient, remainder, original: number });
    number = quotient;
  }
  return steps;
};

type DigitItem = { id: string; value: string };

const SortableDigit = ({ id, value }: { id: string; value: string }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={style}
      className="px-4 py-2 bg-blue-500 text-white rounded shadow hover:bg-blue-600 cursor-pointer"
    >
      {value}
    </div>
  );
};

const DroppableSlot = ({ id, children }: { id: string; children: React.ReactNode }) => {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      id={id}
      className={`w-14 h-14 border-2 border-dashed rounded-md bg-gray-100 text-xl flex items-center justify-center transition ${
        isOver ? "bg-blue-100" : ""
      }`}
    >
      {children}
    </div>
  );
};

const NumberBases = () => {
  const [currentLevel, setCurrentLevel] = useState(0);
  const [steps, setSteps] = useState<{ quotient: number; remainder: number; original: number }[]>([]);
  const [remainders, setRemainders] = useState<DigitItem[]>([]);
  const [placed, setPlaced] = useState<(DigitItem | null)[]>([]);
  const [timer, setTimer] = useState(30);
  const [showConfetti, setShowConfetti] = useState(false);

  const level = levels[currentLevel];

  const shuffleArray = (arr: string[]) => {
    return [...arr].sort(() => Math.random() - 0.5);
  };

  useEffect(() => {
    const levelSteps = divideSteps(level.number, level.base);
    const remaindersList = levelSteps.map((step) => step.remainder.toString());

    const shuffled = shuffleArray(remaindersList);
    const withIds = shuffled.map((value, idx) => ({
      id: `${value}-${idx}`,
      value,
    }));

    setSteps(levelSteps);
    setRemainders(withIds);
    setPlaced(new Array(remaindersList.length).fill(null));
    setTimer(30);
    setShowConfetti(false);
  }, [currentLevel]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [currentLevel]);

  const sensors = useSensors(useSensor(PointerSensor));

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const fromItem = remainders.find((d) => d.id === active.id);
    const overIndex = parseInt(over.id as string);

    if (fromItem && !placed[overIndex]) {
      const updatedPlaced = [...placed];
      updatedPlaced[overIndex] = fromItem;

      const updatedRemainders = remainders.filter((d) => d.id !== active.id);

      setPlaced(updatedPlaced);
      setRemainders(updatedRemainders);
    }
  };

  const checkAnswer = () => {
    const correctAnswer = steps.map((s) => s.remainder.toString()).join("");
    const userAnswer = placed.map((p) => p?.value ?? "").join("");
    if (userAnswer === correctAnswer) {
      correctSound.play();
      setShowConfetti(true);
      setTimeout(() => {
        setCurrentLevel((prev) => (prev + 1) % levels.length);
      }, 2000);
    } else {
      wrongSound.play();
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto text-center">
      <h1 className="text-2xl font-bold mb-2">Convert to Base {level.base}</h1>
      <p className="mb-4">
        Convert <strong>{level.number}</strong> to base {level.base}
      </p>
      <p className="text-red-500 mb-4">⏱ Time left: {timer}s</p>

      <div className="grid grid-cols-3 gap-3 mb-6">
        {steps.map((step, i) => (
          <div key={i} className="border rounded-lg p-3 bg-white shadow">
            <p className="text-sm">Step {i + 1}</p>
            <p className="text-lg font-semibold">
              {step.original} ÷ {level.base} = {step.quotient} R{" "}
              <strong>{placed[i]?.value ?? "?"}</strong>
            </p>
          </div>
        ))}
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={remainders.map((r) => r.id)} strategy={rectSortingStrategy}>
          <div className="flex justify-center gap-3 mb-6">
            {remainders.map((digit) => (
              <SortableDigit key={digit.id} id={digit.id} value={digit.value} />
            ))}
          </div>
        </SortableContext>

        <div className="flex justify-center gap-4 mb-6">
          {placed.map((val, i) => (
            <DroppableSlot key={i} id={i.toString()}>
              {val?.value ?? "?"}
            </DroppableSlot>
          ))}
        </div>
      </DndContext>

      <div className="mt-6">
        <button
          onClick={checkAnswer}
          className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
        >
          Check Answer
        </button>
      </div>

      {showConfetti && <Confetti />}
    </div>
  );
};

export default NumberBases;

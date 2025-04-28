import React, { useState, useEffect } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

type Apparatus = {
  id: string;
  name: string;
  correctZone: string;
};

const apparatusList: Apparatus[] = [
  { id: "1", name: "Beaker", correctZone: "Holding liquids" },
  { id: "2", name: "Measuring Cylinder", correctZone: "Measuring volume" },
  { id: "3", name: "Bunsen Burner", correctZone: "Heating substances" },
  { id: "4", name: "Thermometer", correctZone: "Measuring temperature" },
  { id: "5", name: "Tripod Stand", correctZone: "Heating substances" },
  { id: "6", name: "Test Tube", correctZone: "Holding liquids" },
];

const zones = [
  "Measuring volume",
  "Heating substances",
  "Holding liquids",
  "Measuring temperature",
];

// Draggable Item
const DraggableItem: React.FC<{ item: Apparatus }> = ({ item }) => {
  const [{ isDragging }, dragRef] = useDrag(() => ({
    type: "APPARATUS",
    item,
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  return (
    <div
      ref={dragRef as unknown as React.Ref<HTMLDivElement>}
      className={`p-2 m-2 border rounded cursor-move bg-purple-400 text-white ${
        isDragging ? "opacity-50" : "opacity-100"
      }`}
    >
      {item.name}
    </div>
  );
};

// Drop Zone
const DropZone: React.FC<{
  zone: string;
  onDrop: (item: Apparatus) => void;
  children: React.ReactNode;
}> = ({ zone, onDrop, children }) => {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: "APPARATUS",
    drop: (item: Apparatus) => onDrop(item),
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }));

  return (
    <div
      ref={drop as unknown as React.Ref<HTMLDivElement>}
      className={`p-4 min-h-[150px] border-2 ${
        isOver ? "bg-green-200" : "bg-white"
      } rounded transition-all duration-300`}
    >
      <h3 className="text-lg font-semibold mb-2 text-purple-800">{zone}</h3>
      {children}
    </div>
  );
};

const LabSetup: React.FC = () => {
  const [droppedItems, setDroppedItems] = useState<{ [zone: string]: Apparatus[] }>({});
  const [showSplash, setShowSplash] = useState(false);
  const [, setCompleted] = useState(false);
  const [showCompletedSplash, setShowCompletedSplash] = useState(false);

  const correctSound = new Audio("/sounds/correct.mp3");
  const incorrectSound = new Audio("/sounds/incorrect.mp3");

  const handleDrop = (zone: string, item: Apparatus) => {
    if (item.correctZone === zone) {
      correctSound.play();
      setDroppedItems((prev) => ({
        ...prev,
        [zone]: [...(prev[zone] || []), item],
      }));
      setShowSplash(true);
      setTimeout(() => setShowSplash(false), 1000);
    } else {
      incorrectSound.play();
      alert("Incorrect! Try again.");
    }
  };

  const availableItems = apparatusList.filter(
    (item) =>
      !Object.values(droppedItems)
        .flat()
        .some((dropped) => dropped.id === item.id)
  );

  useEffect(() => {
    if (Object.values(droppedItems).flat().length === apparatusList.length) {
      setCompleted(true);
      setShowCompletedSplash(true);

      const timer = setTimeout(() => {
        setShowCompletedSplash(false);
      }, 10000); // Hide after 10 seconds

      return () => clearTimeout(timer);
    }
  }, [droppedItems]);

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="relative flex flex-col h-full">
        {/* Splash for correct drop */}
        {showSplash && (
          <div className="absolute inset-0 bg-green-400 bg-opacity-70 flex items-center justify-center text-white text-4xl font-bold z-50 animate-ping">
            Great Job!
          </div>
        )}

        {/* Items to Drag */}
        <div className="p-4 bg-purple-900 text-white">
          <h2 className="text-xl font-bold mb-4">Drag the apparatus to their correct use!</h2>
          <div className="flex flex-wrap gap-4">
            {availableItems.map((item) => (
              <DraggableItem key={item.id} item={item} />
            ))}
          </div>
        </div>

        {/* Drop Zones */}
        <div className="grid grid-cols-2 gap-6 p-6 bg-gray-100 flex-grow">
          {zones.map((zone) => (
            <DropZone key={zone} zone={zone} onDrop={(item) => handleDrop(zone, item)}>
              {droppedItems[zone]?.map((item) => (
                <div key={item.id} className="bg-purple-300 text-white p-2 rounded mt-2">
                  {item.name}
                </div>
              ))}
            </DropZone>
          ))}
        </div>

        {/* Completion Message with fade-out */}
        {showCompletedSplash && (
          <div className="fixed inset-0 bg-black bg-opacity-80 flex flex-col items-center justify-center text-center text-white z-50 animate-fadeOut">
            <h1 className="text-4xl font-bold mb-4">🎉 Well Done! 🎉</h1>
            <p className="text-xl">You matched all the apparatus correctly!</p>
          </div>
        )}
      </div>
    </DndProvider>
  );
};

export default LabSetup;

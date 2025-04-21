import React from "react";

type Game = {
  id: number;
  title: string;
  image: string;
};

const games: Game[] = [
  {
    id: 1,
    title: "Quiz Clash",
    image: "/images/quiz.jpg",
  },
  {
    id: 2,
    title: "Memory Match",
    image: "/images/memory.jpg",
  },
  {
    id: 3,
    title: "Word Race",
    image: "/images/wordrace.jpg",
  },
  {
    id: 4,
    title: "Logic Battle",
    image: "/images/logic.jpg",
  },
];

const Games: React.FC = () => {
  return (
    <div className="p-6">
      <h2 className="text-3xl font-bold mb-6 text-center">Available Games</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {games.map((game) => (
          <div
            key={game.id}
            className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-lg transition-shadow"
          >
            <img
              src={game.image}
              alt={game.title}
              className="w-full h-40 object-cover"
            />
            <div className="p-4 flex flex-col items-center">
              <h3 className="text-xl font-semibold mb-2">{game.title}</h3>
              <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-xl transition-colors">
                Play
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Games;

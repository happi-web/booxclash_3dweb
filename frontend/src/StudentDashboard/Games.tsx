import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

type Game = {
  _id: string;
  title: string;
  imageUrl: string;
  component: string;
};

const Games: React.FC = () => {
  const [games, setGames] = useState<Game[]>([]);

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/games");
        setGames(res.data);
      } catch (err) {
        console.error("Failed to load games:", err);
      }
    };

    fetchGames();
  }, []);

  const getFullImageUrl = (url: string) => {
    const normalizedUrl = url.replace(/\\/g, "/");
    return normalizedUrl.startsWith("http")
      ? normalizedUrl
      : `http://localhost:5000/${normalizedUrl}`;
  };

  return (
    <div className="p-6 bg-gradient-to-br from-black via-purple-950 to-black min-h-screen text-white">
      <h2 className="text-3xl font-extrabold mb-8 text-center text-orange-400">
        🎯 Available Games
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {games.map((game) => (
          <div
            key={game._id}
            className="bg-gray-900 border border-purple-700 rounded-2xl shadow-xl overflow-hidden hover:shadow-purple-500/40 transition-shadow duration-300"
          >
            <img
              src={getFullImageUrl(game.imageUrl)}
              alt={game.title}
              className="w-full h-40 object-cover"
              onError={(e) =>
                (e.currentTarget.src =
                  "https://via.placeholder.com/400x200?text=No+Image")
              }
            />
            <div className="p-4 flex flex-col items-center">
              <h3 className="text-lg font-semibold text-white mb-3">{game.title}</h3>
              <Link to={game.component}>
                <button className="bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 px-5 rounded-full transition duration-200">
                  Play
                </button>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Games;

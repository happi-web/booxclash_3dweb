import React from "react";
import { Link } from "react-router-dom";

const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-700 to-indigo-800 text-white flex flex-col items-center">
      {/* Hero Section */}
      <section className="w-full max-w-5xl px-6 py-24 text-center">
        <h1 className="text-5xl md:text-6xl font-bold mb-6">
          Clash Minds. Learn Fast.
        </h1>
        <p className="text-xl md:text-2xl mb-10">
          BooxClash turns learning into an epic game of knowledge, skill, and fun.
        </p>
        <Link
          to="/signup"
          className="bg-white text-purple-800 font-semibold px-8 py-3 rounded-2xl shadow-lg hover:bg-gray-100 transition"
        >
          Get Started Free
        </Link>
      </section>

      {/* Stats Section (optional) */}
      <section className="w-full max-w-4xl px-6 py-10 grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
        <div>
          <h3 className="text-4xl font-bold">12K+</h3>
          <p className="text-lg">Clashes Played</p>
        </div>
        <div>
          <h3 className="text-4xl font-bold">50+</h3>
          <p className="text-lg">Topics Available</p>
        </div>
        <div>
          <h3 className="text-4xl font-bold">100%</h3>
          <p className="text-lg">Fun & Learning</p>
        </div>
      </section>
    </div>
  );
};

export default HomePage;

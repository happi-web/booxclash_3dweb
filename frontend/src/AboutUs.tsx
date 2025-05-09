import { Link } from "react-router-dom";
import Navbar from "./Navbar";

const AboutUs = () => {
  return (
    <div>
        <Navbar/>
    <div className="bg-purple-950/70 min-h-screen py-20 px-6 md:px-20 text-center">
      <h2 className="text-4xl font-bold text-blue-600 mb-6">About BooxClash</h2>
      <p className="text-white text-lg max-w-3xl mx-auto mb-8 leading-relaxed">
        BooxClash is an interactive learning platform designed to make education fun and engaging for students from K–12. 
        Through fun games, videos, and drag-and-drop activities, we help learners boost their math and science skills while keeping them excited and motivated.
        Our mission is to bridge the engagement gap in traditional education using modern, curriculum-aligned tools.
      </p>
      <Link to="/signup">
        <button className="bg-blue-600 text-white px-6 py-3 rounded-lg text-lg hover:bg-blue-700 transition">
          Get Started
        </button>
      </Link>
    </div>
    </div>

  );
};

export default AboutUs;

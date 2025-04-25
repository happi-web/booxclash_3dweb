import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import NET from "vanta/dist/vanta.net.min";
import { Link } from "react-router-dom";
import Navbar from "./StudentDashboard/Games/Knockout/Navbar";

const HomePage = () => {
  const vantaRef = useRef<HTMLDivElement>(null);
  const [vantaEffect, setVantaEffect] = useState<any>(null);

  useEffect(() => {
    if (!vantaEffect && vantaRef.current) {
      const effect = NET({
        el: vantaRef.current,
        THREE,
        mouseControls: true,
        touchControls: true,
        gyroControls: false,
        minHeight: 100.0,
        minWidth: 100.0,
        scale: 1.0,
        scaleMobile: 1.0,
        spacing: 20.0,
        color: 0x00ff00,
        maxDistance: 26.0,
        backgroundColor: 0x20153c,
      });
      setVantaEffect(effect);
    }

    return () => {
      vantaEffect?.destroy();
    };
  }, [vantaEffect]);

  return (
    <div
      ref={vantaRef}
      className="min-h-screen w-full text-orange-200 flex flex-col items-center justify-center relative overflow-hidden"
    >
      <Navbar />

      <div className="z-10 w-full max-w-5xl px-6 py-24 text-center">
        <h1 className="text-5xl md:text-6xl font-extrabold mb-6 drop-shadow-lg">
          Clash Minds. Learn Fast.
        </h1>
        <p className="text-xl md:text-2xl mb-10 font-light drop-shadow">
          BooxClash turns learning into an epic game of knowledge, skill, and fun.
        </p>
        <Link
          to="/signup"
          className="bg-white text-purple-800 font-semibold px-8 py-3 rounded-2xl shadow-lg hover:bg-orange-400 hover:text-white transition duration-300"
        >
          Get Started Free
        </Link>
      </div>

      <section className="z-10 w-full max-w-4xl px-6 py-10 grid grid-cols-1 md:grid-cols-3 gap-6 text-center backdrop-blur-md">
        <div>
          <h3 className="text-4xl font-bold text-orange-300">12K+</h3>
          <p className="text-lg">Clashes Played</p>
        </div>
        <div>
          <h3 className="text-4xl font-bold text-blue-300">50+</h3>
          <p className="text-lg">Topics Available</p>
        </div>
        <div>
          <h3 className="text-4xl font-bold text-purple-300">100%</h3>
          <p className="text-lg">Fun & Learning</p>
        </div>
      </section>
    </div>
  );
};

export default HomePage;

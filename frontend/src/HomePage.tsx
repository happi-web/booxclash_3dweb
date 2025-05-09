import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import Navbar from "./Navbar";

const HomePage = () => {
  const vantaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadScripts = async () => {
      const loadScript = (src: string) =>
        new Promise<void>((resolve, reject) => {
          const script = document.createElement("script");
          script.src = src;
          script.async = true;
          script.onload = () => resolve();
          script.onerror = () => reject();
          document.body.appendChild(script);
        });

      try {
        await loadScript("https://cdnjs.cloudflare.com/ajax/libs/three.js/r121/three.min.js");
        await loadScript("https://cdn.jsdelivr.net/npm/vanta@latest/dist/vanta.rings.min.js");

        // @ts-ignore - VANTA is injected globally
        if (window.VANTA && vantaRef.current) {
          // @ts-ignore
          window.VANTA.RINGS({
            el: vantaRef.current,
            mouseControls: true,
            touchControls: true,
            gyroControls: false,
            minHeight: 200.0,
            minWidth: 200.0,
            scale: 1.0,
            scaleMobile: 1.0,
            backgroundColor: 0x20153c,
          });
        }
      } catch (err) {
        console.error("Vanta or THREE failed to load", err);
      }
    };

    loadScripts();
  }, []);

  return (
    <div
      ref={vantaRef}
      className="min-h-screen w-full text-white flex flex-col items-center justify-center relative backdrop-blur-md overflow-hidden"
    >
      <Navbar />

      <div className="z-10 w-full max-w-5xl px-6 py-24 text-center ">
        <h1 className="text-5xl md:text-6xl font-bold mb-6 drop-shadow-lg">
          Clash Minds || Learn Fast.
        </h1>
        <p className="text-xl md:text-2xl mb-10 font-md drop-shadow">
          BooxClash turns learning into an epic game of knowledge, skill, and fun.
        </p>
        <Link
          to="/signup"
          className="bg-white text-purple-800 font-semibold px-8 py-3 rounded-2xl shadow-lg hover:bg-orange-400 hover:text-white transition duration-300"
        >
          Get Started Free
        </Link>
      </div>

      <section className="z-10 w-full max-w-4xl px-6 py-10 grid grid-cols-1 md:grid-cols-3 gap-6 text-center backdrop-blur-md ">
        <div>
          <h3 className="text-4xl font-bold text-white">12K+</h3>
          <p className="text-lg">Clashes Played</p>
        </div>
        <div>
          <h3 className="text-4xl font-bold text-white">50+</h3>
          <p className="text-lg">Topics Available</p>
        </div>
        <div>
          <h3 className="text-4xl font-bold text-white">100%</h3>
          <p className="text-lg">Fun & Learning</p>
        </div>
      </section>
    </div>
  );
};

export default HomePage;

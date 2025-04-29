import { useState } from "react";
import { motion } from "framer-motion";
import { Droplet, TestTube } from "lucide-react";

export default function DropperExperiment() {
  const [drops, setDrops] = useState(0);
  const [color, setColor] = useState("bg-blue-400");

  const handleDrop = () => {
    if (drops < 3) {
      setDrops(drops + 1);
      if (drops === 2) setColor("bg-purple-500"); // simulate reaction
    }
  };

  return (
    <div className="flex flex-col items-center gap-6 mt-10">
      <button onClick={handleDrop} className="relative">
        <Droplet className="w-12 h-12 text-blue-500" />
        <span className="text-sm">Drop Liquid</span>
      </button>

      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
        key={drops}
      >
        {drops > 0 && (
          <motion.div
            className="w-2 h-6 bg-blue-400 rounded-full mb-2"
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
          />
        )}
      </motion.div>

      <div
        className={`w-12 h-24 border-2 border-gray-600 rounded-b-full ${color} transition-colors duration-500`}
      >
        <TestTube className="w-full h-full opacity-10 absolute pointer-events-none" />
      </div>

      <p className="text-sm text-gray-600">Drops: {drops}</p>
    </div>
  );
}

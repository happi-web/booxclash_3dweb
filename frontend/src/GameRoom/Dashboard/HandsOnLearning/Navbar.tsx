// NavBar.tsx
import React from "react";

type NavBarProps = {
  selectedSubject: string;
  setSelectedSubject: (subject: string) => void;
  selectedLevel: number;
  setSelectedLevel: (level: number) => void;
};

const NavBar: React.FC<NavBarProps> = ({
  selectedSubject,
  setSelectedSubject,
  selectedLevel,
  setSelectedLevel,
}) => {
  const subjects = ["Math", "Science"];
  const levels = [1, 2, 3, 4];

  return (
    <div className="flex items-center justify-between bg-white shadow p-4 mb-4">
      <div>
        <label className="mr-2 font-semibold">Subject:</label>
        <select
          value={selectedSubject}
          onChange={(e) => setSelectedSubject(e.target.value)}
          className="border p-2 rounded"
        >
          {subjects.map((subj) => (
            <option key={subj} value={subj}>
              {subj}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mr-2 font-semibold">Level:</label>
        <select
          value={selectedLevel}
          onChange={(e) => setSelectedLevel(Number(e.target.value))}
          className="border p-2 rounded"
        >
          {levels.map((lvl) => (
            <option key={lvl} value={lvl}>
              Level {lvl}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default NavBar;
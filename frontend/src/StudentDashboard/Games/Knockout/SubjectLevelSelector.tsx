import React, { useState } from 'react';

type SelectorProps = {
  onStart: (subject: string, level: string) => void;
};

const SubjectLevelSelector: React.FC<SelectorProps> = ({ onStart }) => {
  const [subject, setSubject] = useState('');
  const [level, setLevel] = useState('');

  const handleStart = () => {
    if (subject && level) {
      onStart(subject, level);
    } else {
      alert('Please select both subject and level.');
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-6">Start Your Quiz</h1>

      <div className="mb-4">
        <label className="block mb-1 font-medium">Subject</label>
        <select
          className="w-full p-2 border rounded"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
        >
          <option value="">-- Choose Subject --</option>
          <option value="math">Math</option>
          <option value="science">Science</option>
        </select>
      </div>

      <div className="mb-6">
        <label className="block mb-1 font-medium">Level</label>
        <select
          className="w-full p-2 border rounded"
          value={level}
          onChange={(e) => setLevel(e.target.value)}
        >
          <option value="">-- Choose Level --</option>
          <option value="level1">Level 1</option>
          <option value="level2">Level 2</option>
        </select>
      </div>

      <button
        onClick={handleStart}
        className="bg-blue-600 text-white px-4 py-2 rounded w-full hover:bg-blue-700"
      >
        Start Quiz
      </button>
    </div>
  );
};

export default SubjectLevelSelector;

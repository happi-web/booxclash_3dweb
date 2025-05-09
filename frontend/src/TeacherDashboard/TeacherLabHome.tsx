import { useState } from 'react';

interface Student {
  id: number;
  name: string;
  grade: number;
}

interface Experiment {
  id: number;
  title: string;
  description: string;
  materials: string[];
  steps: string[];
}

interface Test {
  id: number;
  title: string;
  questions: string[];
}

function TeacherExperimentRoom() {
  const [students, setStudents] = useState<Student[]>([
    { id: 1, name: 'Alice', grade: 85 },
    { id: 2, name: 'Bob', grade: 90 },
  ]);
  const [] = useState<Experiment[]>([]);
  const [] = useState<Test[]>([]);
  const [selectedTab, setSelectedTab] = useState<'students' | 'experiments' | 'tests'>('students');

  const updateGrade = (id: number, newGrade: number) => {
    setStudents(prev =>
      prev.map(student => (student.id === id ? { ...student, grade: newGrade } : student))
    );
  };



  return (
    <div className="p-6 min-h-screen bg-gray-100">
      {/* Tabs */}
      <div className="flex justify-center mb-6">
        <button onClick={() => setSelectedTab('students')} className="mx-2 p-2 bg-blue-500 text-black rounded">
          Manage Students
        </button>
        <button onClick={() => setSelectedTab('experiments')} className="mx-2 p-2 bg-green-500 text-black rounded">
          Create Experiment
        </button>
        <button onClick={() => setSelectedTab('tests')} className="mx-2 p-2 bg-purple-500 text-black rounded">
          Create Test
        </button>
      </div>

      {/* Screens */}
      {selectedTab === 'students' && (
        <div className="bg-black p-4 rounded shadow">
          <h2 className="text-2xl font-bold mb-4">Student Grades & Monitoring</h2>
          {students.map(student => (
            <div key={student.id} className="flex items-center justify-between my-2">
              <span>{student.name}</span>
              <input
                type="number"
                value={student.grade}
                onChange={(e) => updateGrade(student.id, parseInt(e.target.value))}
                className="border p-2 rounded w-20"
              />
            </div>
          ))}
        </div>
      )}

      {selectedTab === 'experiments' && (
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-2xl font-bold mb-4">Create New Experiment</h2>
          {/* You can put your experiment creation form or a drag-and-drop lab builder here */}
          <p>(Interactive lab environment will go here!)</p>
        </div>
      )}

      {selectedTab === 'tests' && (
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-2xl font-bold mb-4">Create Laboratory Test</h2>
          {/* Add form to create/save tests */}
          <p>(Test creation and test bank will go here!)</p>
        </div>
      )}
    </div>
  );
}

export default TeacherExperimentRoom;

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'; // 👈 import navigate
import axios from 'axios'; // 👈 import axios

interface Experiment {
  _id: string;
  name: string;
  thumbnailUrl: string;
  materials: string[];
  tools: string[];
  result: string;
}
const API_BASE = import.meta.env.VITE_API_BASE_URL;
type Section = 'experiments' | 'grades' | 'tests' | 'schedule';

function StudentsLabHome() {
  const [activeSection, setActiveSection] = useState<Section>('experiments');
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchExperiments = async () => {
      try {
        const response = await axios.get(`${API_BASE}/api/experiments`);
        setExperiments(response.data); // assuming the response is an array of experiments
      } catch (error) {
        console.error('Error fetching experiments:', error);
      }
    };

    fetchExperiments();
  }, []);

  const handleButtonClick = (section: Section): void => {
    setActiveSection(section);
  };

  const startExperiment = (experiment: Experiment) => {
    navigate('/student-experiment-room', { state: { id: experiment._id } });
  };
  

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Virtual Science Lab 🧪</h1>

      {/* Top Buttons */}
      <div className="flex gap-4 mb-8">
        <button
          onClick={() => handleButtonClick('experiments')}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Experiments
        </button>
        <button
          onClick={() => handleButtonClick('grades')}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Grades
        </button>
        <button
          onClick={() => handleButtonClick('tests')}
          className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
        >
          Tests
        </button>
        <button
          onClick={() => handleButtonClick('schedule')}
          className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
        >
          Schedule
        </button>
      </div>

      {/* Different Sections */}
      {activeSection === 'experiments' && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          {experiments.map((exp) => (
            <div
              key={exp._id}
              className="border rounded-lg overflow-hidden shadow hover:shadow-md transition p-4 flex flex-col items-center"
            >
              <img
                src={`${API_BASE}/${exp.thumbnailUrl}`} // 👈 correctly load image
                alt={exp.name}
                className="h-32 w-32 object-cover mb-4"
              />
              <h3 className="font-semibold text-center mb-2">{exp.name}</h3>
              <button
                onClick={() => startExperiment(exp)}
                className="px-3 py-1 bg-indigo-500 text-white rounded hover:bg-indigo-600"
              >
                Start Experiment
              </button>
            </div>
          ))}
        </div>
      )}

      {/* GRADES */}
      {activeSection === 'grades' && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold mb-4">Your Grades</h2>
          <div className="p-4 bg-green-100 rounded-lg">
            <p><strong>Mixing Acids and Bases:</strong> 90%</p>
            <p><strong>Growing Crystals:</strong> 85%</p>
            <p><strong>Magnetism Experiment:</strong> 88%</p>
          </div>
        </div>
      )}

      {/* TESTS */}
      {activeSection === 'tests' && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold mb-4">Your Tests</h2>
          <div className="p-4 bg-yellow-100 rounded-lg">
            <p><strong>Acids and Bases Quiz:</strong> Pending</p>
            <p><strong>Photosynthesis Test:</strong> Completed</p>
          </div>
        </div>
      )}

      {/* SCHEDULE */}
      {activeSection === 'schedule' && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold mb-4">Your Schedule</h2>
          <div className="p-4 bg-purple-100 rounded-lg">
            <p>🔬 Virtual Chemistry Class - Monday 9 AM</p>
            <p>🧬 Biology Project Due - Wednesday 3 PM</p>
            <p>🧲 Physics Lab Session - Friday 11 AM</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default StudentsLabHome;

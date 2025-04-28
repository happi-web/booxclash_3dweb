import { useState } from 'react';
import AdminManageMaterials from './AdminManageMaterials';
import VirtualExperiment from './VirtualExperiment';

function TeacherExperimentRoom() {
  const [selectedTab, setSelectedTab] = useState< 'experiments' | 'tests' | 'materials'>('experiments');
  return (
    <div className="p-6 min-h-screen bg-gray-100">
      {/* Tabs */}
      <div className="flex justify-center mb-6">
        <button onClick={() => setSelectedTab('experiments')} className="mx-2 p-2 bg-green-500 text-black rounded">
          Create Experiment
        </button>
        <button onClick={() => setSelectedTab('tests')} className="mx-2 p-2 bg-purple-500 text-black rounded">
          Create Test
        </button>
        <button onClick={() => setSelectedTab('materials')} className="mx-2 p-2 bg-purple-500 text-black rounded">
          Create Materials
        </button>
      </div>

      {selectedTab === 'experiments' && (
        <div className="bg-white p-4 rounded shadow">
          <VirtualExperiment/>
        </div>
      )}
      {selectedTab === 'materials' && (
        <div className="bg-white p-4 rounded shadow">
          <AdminManageMaterials />
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

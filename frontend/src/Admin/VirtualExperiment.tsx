import React, { useState, useEffect } from 'react';
import axios from 'axios';
const API_BASE = import.meta.env.VITE_API_BASE_URL;
interface MaterialToolItem {
  id: string;
  name: string;
  imageUrl: string;
}

interface Experiment {
  _id: string;
  topic: string;
  thumbnail: string;
  name: string;
  steps: string[];
  materials: MaterialToolItem[];
  tools: MaterialToolItem[];
  result: string;
}

const VirtualExperiment: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [materials, setMaterials] = useState<MaterialToolItem[]>([]);
  const [tools, setTools] = useState<MaterialToolItem[]>([]);
  const [selectedMaterials, setSelectedMaterials] = useState<MaterialToolItem[]>([]);
  const [selectedTools, setSelectedTools] = useState<MaterialToolItem[]>([]);
  const [experimentName, setExperimentName] = useState('');
  const [expectedResult, setExpectedResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [steps, setSteps] = useState('1. ');
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [savedExperiments, setSavedExperiments] = useState<Experiment[]>([]);
  const [editingExperimentId, setEditingExperimentId] = useState<string | null>(null);

  useEffect(() => {
    fetchSavedExperiments();
  }, []);

  const fetchSavedExperiments = async () => {
    try {
      const response = await axios.get(`${API_BASE}/api/experiments`);
      setSavedExperiments(response.data);
    } catch (error) {
      console.error('Error fetching saved experiments:', error);
    }
  };

  const fetchMaterialsAndTools = async (selectedTopic: string) => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE}/api/materials-tools?topic=${encodeURIComponent(selectedTopic)}`);
      setMaterials(response.data.materials || []);
      setTools(response.data.tools || []);
    } catch (error) {
      console.error('Error fetching materials and tools:', error);
      setMaterials([]);
      setTools([]);
    } finally {
      setLoading(false);
    }
  };

  const handleLoadMaterials = () => {
    if (topic.trim() !== '') {
      fetchMaterialsAndTools(topic.trim());
    }
  };

  const handleAddMaterial = (item: MaterialToolItem) => {
    setSelectedMaterials(prev => [...prev, item]);
  };

  const handleAddTool = (item: MaterialToolItem) => {
    setSelectedTools(prev => [...prev, item]);
  };

  const handleSubmitExperiment = async () => {
    try {
      const formData = new FormData();
      formData.append('topic', topic);
      formData.append('name', experimentName);
      formData.append('result', expectedResult);
      if (thumbnail) {
        formData.append('thumbnail', thumbnail);
      }
      formData.append('materials', JSON.stringify(selectedMaterials));
      formData.append('steps', JSON.stringify(steps.split('\n')));
      formData.append('tools', JSON.stringify(selectedTools));
  
      const url = editingExperimentId
        ? `${API_BASE}/api/experiments/${editingExperimentId}`
        : `${API_BASE}/api/experiments`;
  
      const method = editingExperimentId ? 'PUT' : 'POST';
  
      await fetch(url, {
        method,
        body: formData,
      });
  
      // reset form, reload saved experiments, etc.
      resetForm();
      fetchSavedExperiments();
    } catch (error) {
      console.error('Error submitting experiment:', error);
    }
  };
  

  const handleEditExperiment = (experiment: Experiment) => {
    setTopic(experiment.topic);
    setExperimentName(experiment.name);
    setSelectedMaterials(experiment.materials);
    setSelectedTools(experiment.tools);
    setExpectedResult(experiment.result);
    setEditingExperimentId(experiment._id);
  };

  const handleDeleteExperiment = async (id: string) => {
    if (confirm('Are you sure you want to delete this experiment?')) {
      try {
        await axios.delete(`${API_BASE}/api/experiments/${id}`);
        alert('Experiment deleted!');
        fetchSavedExperiments();
      } catch (error) {
        console.error('Error deleting experiment:', error);
        alert('Failed to delete experiment.');
      }
    }
  };

  const resetForm = () => {
    setTopic('');
    setExperimentName('');
    setSelectedMaterials([]);
    setSelectedTools([]);
    setExpectedResult('');
    setThumbnail(null); // <-- CLEAR the uploaded thumbnail
    setMaterials([]);   // <-- CLEAR the dynamically loaded materials
    setTools([]);       // <-- CLEAR the dynamically loaded tools
    setEditingExperimentId(null);
  };
  

  const allowDrop = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDropMaterial = (e: React.DragEvent, item: MaterialToolItem) => {
    e.preventDefault();
    handleAddMaterial(item);
  };

  const handleDropTool = (e: React.DragEvent, item: MaterialToolItem) => {
    e.preventDefault();
    handleAddTool(item);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h2 className="text-2xl font-bold mb-4">
        {editingExperimentId ? 'Edit Virtual Experiment' : 'Create New Virtual Experiment'}
      </h2>

      {/* Form Fields */}
      <div className="mb-6">
          <label className="block font-medium">Upload Thumbnail</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                setThumbnail(e.target.files[0]);
              }
            }}
            className="border p-2 rounded w-full"
          />
          {thumbnail && (
            <div className="mt-2">
              <img
                src={URL.createObjectURL(thumbnail)}
                alt="Thumbnail Preview"
                className="w-32 h-32 object-cover rounded"
              />
            </div>
          )}
        </div>

      <div className="mb-4">
        <label className="block font-medium">Topic</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="border p-2 rounded w-full"
            placeholder="Enter experiment topic"
          />
          <button
            onClick={handleLoadMaterials}
            className="bg-blue-500 text-white px-4 rounded hover:bg-blue-600"
          >
            Load
          </button>
        </div>
      </div>

      <div className="mb-6">
        <label className="block font-medium">Experiment Name</label>
        <input
          type="text"
          value={experimentName}
          onChange={(e) => setExperimentName(e.target.value)}
          className="border p-2 rounded w-full"
          placeholder="Enter experiment name"
        />
      </div>

      {loading ? (
        <p className="text-center font-medium text-gray-500">Loading materials and tools...</p>
      ) : (
        <>
          {/* Materials and Tools */}
          <div className="grid grid-cols-2 gap-6 mb-8">
            <div>
              <h3 className="text-xl font-semibold mb-2">Materials</h3>
              <div className="grid grid-cols-4 gap-2 bg-white p-4 rounded shadow">
                {materials?.map(item => (
                  <div
                    key={item.id}
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData("material", JSON.stringify(item));
                    }}
                    className="cursor-pointer"
                  >
                    <img
                      src={`${API_BASE}/${item.imageUrl.replace(/\\/g, '/')}`}
                      alt={item.name}
                      className="w-12 h-12 mx-auto"
                    />
                    <p className="text-center text-xs mt-1">{item.name}</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-2">Laboratory Tools</h3>
              <div className="grid grid-cols-4 gap-2 bg-white p-4 rounded shadow">
                {tools?.map(item => (
                  <div
                    key={item.id}
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData("tool", JSON.stringify(item));
                    }}
                    className="cursor-pointer"
                  >
                    <img
                      src={`${API_BASE}/${item.imageUrl.replace(/\\/g, '/')}`}
                      alt={item.name}
                      className="w-12 h-12 mx-auto"
                    />
                    <p className="text-center text-xs mt-1">{item.name}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Selected Experiment Setup */}
      <div className="grid grid-cols-3 gap-6 mb-8">
        <div
          className="bg-white p-4 rounded shadow min-h-[100px] border border-dashed"
          onDrop={(e) => {
            const material = JSON.parse(e.dataTransfer.getData("material"));
            handleDropMaterial(e, material);
          }}
          onDragOver={allowDrop}
        >
          <h3 className="text-lg font-semibold mb-2">Selected Materials</h3>
          {selectedMaterials.map(item => (
            <div key={item.id} className="flex items-center gap-2">
              <img
                src={`${API_BASE}/${item.imageUrl.replace(/\\/g, '/')}`}
                alt={item.name}
                className="w-12 h-12"
              />
              <p className="text-sm">{item.name}</p>
            </div>
          ))}
        </div>

        <div
          className="bg-white p-4 rounded shadow min-h-[100px] border border-dashed"
          onDrop={(e) => {
            const tool = JSON.parse(e.dataTransfer.getData("tool"));
            handleDropTool(e, tool);
          }}
          onDragOver={allowDrop}
        >
          <h3 className="text-lg font-semibold mb-2">Selected Tools</h3>
          {selectedTools.map(item => (
            <div key={item.id} className="flex items-center gap-2">
              <img
                src={`${API_BASE}/${item.imageUrl.replace(/\\/g, '/')}`}
                alt={item.name}
                className="w-12 h-12"
              />
              <p className="text-sm">{item.name}</p>
            </div>
          ))}
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2">Expected Result</h3>
          <textarea
            value={expectedResult}
            onChange={(e) => setExpectedResult(e.target.value)}
            className="w-full border p-2 rounded min-h-[100px]"
            placeholder="Describe the expected result..."
          />
        </div>
      </div>
      <div>
        <h3 className="text-lg font-semibold mb-2">Experiment Steps</h3>
        <textarea
          value={steps}
          onChange={(e) => setSteps(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              const lines = steps.split('\n');
              const lastLine = lines[lines.length - 1];
              const match = lastLine.match(/^(\d+)\./);
              const nextNumber = match ? parseInt(match[1]) + 1 : 1;
              setSteps(prev => prev + '\n' + nextNumber + '. ');
            }
          }}
          className="w-full border p-2 rounded min-h-[150px]"
          placeholder="Write the experiment steps..."
        />
      </div>

      {/* Submit and Reset Buttons */}
      <div className="flex gap-4 mb-12">
        <button
          onClick={handleSubmitExperiment}
          className="bg-pink-500 text-white px-6 py-2 rounded hover:bg-pink-600"
        >
          {editingExperimentId ? 'Update' : 'Submit'}
        </button>
        <button
          onClick={resetForm}
          className="bg-gray-300 text-black px-6 py-2 rounded hover:bg-gray-400"
        >
          Reset
        </button>
      </div>

      {/* Display Saved Experiments */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Saved Experiments</h2>
        <div className="grid gap-4">
          {savedExperiments.map(exp => (
            <div key={exp._id} className="bg-white p-4 rounded shadow">
              <h3 className="text-lg font-semibold">{exp.name}</h3>
              <p className="text-sm text-gray-600 mb-2">Topic: {exp.topic}</p>
              <p className="text-sm mb-2">Result: {exp.result}</p>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEditExperiment(exp)}
                  className="bg-yellow-400 text-white px-3 py-1 rounded hover:bg-yellow-500"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteExperiment(exp._id)}
                  className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default VirtualExperiment;

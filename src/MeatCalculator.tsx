// MeatCalculator.tsx
import React, { useState } from 'react';
import { FaPen } from 'react-icons/fa';

interface WeightEntry {
  id: number;
  value: number;
}

const MeatCalculator: React.FC = () => {
  const [inputValue, setInputValue] = useState('');
  const [weights, setWeights] = useState<WeightEntry[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingValue, setEditingValue] = useState<string>('');

  // Function to add a new weight.
  const handleAddWeight = () => {
    const parsed = parseFloat(inputValue);
    if (!isNaN(parsed)) {
      // Create a new weight entry with a unique id (using Date.now() here).
      const newEntry: WeightEntry = { id: Date.now(), value: parsed };
      setWeights(prev => [...prev, newEntry]);
      setInputValue('');
    }
  };

  // Reset the list of weights.
  const handleReset = () => {
    setWeights([]);
  };

  // Compute total weight.
  const totalWeight = weights.reduce((sum, entry) => sum + entry.value, 0);

  // Handle key press on the main input field.
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddWeight();
    }
  };

  // Begin editing a specific weight.
  const handleEdit = (id: number, currentValue: number) => {
    setEditingId(id);
    setEditingValue(currentValue.toString());
  };

  // Save the edited value.
  const handleSaveEdit = () => {
    const parsed = parseFloat(editingValue);
    if (!isNaN(parsed)) {
      setWeights(prev =>
        prev.map(entry =>
          entry.id === editingId ? { ...entry, value: parsed } : entry
        )
      );
      setEditingId(null);
      setEditingValue('');
    }
  };

  // Cancel editing.
  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingValue('');
  };

  // Handle key press on the edit input field.
  const handleEditKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSaveEdit();
    }
  };

  return (
    <div className="bg-primary min-h-screen text-gray-100 flex flex-col items-center p-4">
      <h3 className="text-secondary text-2xl font-bold mb-2">Lihalaskuri</h3>
      <div className="flex flex-col space-y-2">
        <div className="flex space-x-2">
          <input
            type="number"
            step="0.001"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Anna lihan paino (kg)"
            className="border border-gray-300 rounded px-2 py-1"
          />
        </div>
        <button 
          onClick={handleReset} 
          className="bg-red-500 text-white px-4 py-2 rounded"
        >
          Nollaa
        </button>
      </div>
      {weights.length > 0 && (
        <div className="mt-4">
          <p className="font-bold mt-2">Yhteensä: {totalWeight.toFixed(3)} kg</p>
          <ul>
            {weights.map((entry) => (
              <li key={entry.id} className="flex items-center space-x-2">
                {editingId === entry.id ? (
                  <>
                    <input
                      type="number"
                      step="0.001"
                      value={editingValue}
                      onChange={(e) => setEditingValue(e.target.value)}
                      onKeyDown={handleEditKeyDown}
                      className="border rounded px-2 py-1 w-24"
                    />
                    <button
                      onClick={handleSaveEdit}
                      className="bg-green-500 text-white px-2 py-1 rounded"
                    >
                      Tallenna
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="bg-gray-500 text-white px-2 py-1 rounded"
                    >
                      Peruuta
                    </button>
                  </>
                ) : (
                  <>
                    <span>{entry.value.toFixed(3)} kg</span>
                    <button
                      onClick={() => handleEdit(entry.id, entry.value)}
                      className="text-blue-500 hover:text-blue-700"
                      title="Muokkaa"
                    >
                      <FaPen />
                    </button>
                  </>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default MeatCalculator;

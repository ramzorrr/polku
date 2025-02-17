import React, { useState, useEffect } from 'react';
import localforage from 'localforage';

const Multiplier: React.FC = () => {
  // Initialize total from localForage (default to 0 if nothing is saved)
  const [total, setTotal] = useState<number>(0);
  const [inputValue, setInputValue] = useState('');

  // On mount, load saved total from localForage.
  useEffect(() => {
    localforage.getItem('multiplierTotal')
      .then((savedTotal) => {
        if (savedTotal !== null) {
          setTotal(parseFloat(savedTotal as string));
        }
      })
      .catch((err) => console.error('Error loading multiplierTotal:', err));
  }, []);

  // Update localForage whenever total changes.
  useEffect(() => {
    localforage.setItem('multiplierTotal', total.toString())
      .catch((err) => console.error('Error saving multiplierTotal:', err));
  }, [total]);

  // Function to add the current input value.
  const handleAdd = () => {
    const trimmed = inputValue.trim();
    let valueToAdd = 0;

    if (trimmed.startsWith('(') && trimmed.endsWith(')')) {
      // Remove the parentheses and parse the inside value.
      const inside = trimmed.substring(1, trimmed.length - 1);
      const parsed = parseFloat(inside.replace(',', '.'));
      if (!isNaN(parsed)) {
        valueToAdd = parsed;
      }
    } else {
      const parsed = parseFloat(trimmed.replace(',', '.'));
      if (!isNaN(parsed)) {
        // Multiply the parsed value by 0.07
        valueToAdd = parsed * 0.07;
      }
    }
    
    setTotal(prevTotal => prevTotal + valueToAdd);
    setInputValue('');
  };

  // Handle Enter key in the input to add the value.
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAdd();
    }
  };

  // Reset total.
  const handleReset = () => {
    setTotal(0);
  };

  return (
    <div className="bg-primary min-h-screen text-gray-100 flex flex-col items-center p-4">
      <h3 className="text-secondary text-2xl font-bold mb-2">Pohjalaskuri</h3>
      <div className="flex flex-col space-y-2">
        <div className="flex space-x-2">
          <input
            type="text"
            inputMode="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Pohja tai suorite (x)"
            className="border border-gray-300 rounded px-2 py-1"
          />
          <button
            onClick={handleAdd}
            className="bg-secondary text-white px-4 py-2 rounded"
          >
            Lisää
          </button>
        </div>
        <button
          onClick={handleReset}
          className="bg-red-500 text-white px-4 py-2 rounded"
        >
          Nollaa
        </button>
      </div>
      <div className="mt-2">
        <strong>Yhteensä: </strong>
        {total.toFixed(2)}
      </div>
    </div>
  );
};

export default Multiplier;

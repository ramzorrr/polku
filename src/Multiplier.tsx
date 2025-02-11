// Multiplier.tsx
import React, { useState, useEffect } from 'react';

const Multiplier: React.FC = () => {
  // Initialize total from localStorage (or default to 0 if nothing is saved)
  const [total, setTotal] = useState(() => {
    const savedTotal = localStorage.getItem('multiplierTotal');
    return savedTotal ? parseFloat(savedTotal) : 0;
  });
  const [inputValue, setInputValue] = useState('');

  // Update localStorage whenever total changes.
  useEffect(() => {
    localStorage.setItem('multiplierTotal', total.toString());
  }, [total]);

  // Function to add the current input value.
  const handleAdd = () => {
    const trimmed = inputValue.trim();
    let valueToAdd = 0;
    if (trimmed.startsWith('(') && trimmed.endsWith(')')) {
      // Remove the parentheses and parse the inside value.
      const inside = trimmed.substring(1, trimmed.length - 1);
      const parsed = parseFloat(inside);
      if (!isNaN(parsed)) {
        valueToAdd = parsed;
      }
    } else {
      const parsed = parseFloat(trimmed);
      if (!isNaN(parsed)) {
        // Multiply the parsed value by 0.075
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
      <h3 className="text-lg font-bold mb-2">Pohjalaskuri</h3>
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

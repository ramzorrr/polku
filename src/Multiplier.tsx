import React, { useState } from 'react';

const Multiplier = () => {
  const [inputValue, setInputValue] = useState('');
  const [total, setTotal] = useState(0);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
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
          valueToAdd = parsed * 0.07;
        }
      }
      
      setTotal(prevTotal => prevTotal + valueToAdd);
      setInputValue('');
    }
  };

  const handleReset = () => {
    setTotal(0);
  };

  return (
    <div className="multiplier p-4 border rounded shadow-md">
      <div className="flex items-center space-x-2">
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
          onClick={handleReset}
          className="px-3 py-1 bg-red-500 text-white rounded"
        >
          Nollaa
        </button>
      </div>
      <div className="mt-2">
        <strong>Total: </strong>
        {total.toFixed(2)}
      </div>
    </div>
  );
};

export default Multiplier;

import React, { useState, useEffect } from 'react';

const Multiplier = () => {
  // Initialize total from localStorage (or default to 0 if nothing is saved)
  const [total, setTotal] = useState(() => {
    const savedTotal = localStorage.getItem('multiplierTotal');
    return savedTotal ? parseFloat(savedTotal) : 0;
  });
  const [inputValue, setInputValue] = useState('');

  // Whenever the total changes, update it in localStorage.
  useEffect(() => {
    localStorage.setItem('multiplierTotal', total.toString());
  }, [total]);

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
          valueToAdd = parsed * 0.075;
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
        <strong>Yhteensä: </strong>
        {total.toFixed(2)}
      </div>
    </div>
  );
};

export default Multiplier;

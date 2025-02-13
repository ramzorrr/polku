import React from 'react';

interface DirectToGoalProps {
  value: string;
  percentage: number;
  label?: string;
}

const DirectToGoal: React.FC<DirectToGoalProps> = ({
  value,
  percentage,
  label = "Suoraan tavoitteeseen",
}) => {
  return (
    <div className="p-6 bg-gradient-to-r from-green-600 to-green-400 text-white rounded-lg shadow-md hover:shadow-xl transform hover:scale-105 transition duration-300">
      <h3 className="text-xl font-semibold mb-2">{label}</h3>
      <p className="text-2xl font-bold">{value} <span className="text-lg">({percentage}%)</span></p>
    </div>
  );
};

export default DirectToGoal;

import React from 'react';

interface DirectToGoalProps {
  value: string;
  percentage: number;
  label?: string;
}

const DirectToGoal: React.FC<DirectToGoalProps> = ({
  value,
  percentage,
  label = "Suoraan tavoitteeseen", // default value if none provided
}) => {
  return (
    <div className="p-4 bg-green-500 text-white rounded shadow-lg">
      <h3 className="text-lg font-bold">{label}</h3>
      <p>
        {value} ({percentage}%)
      </p>
    </div>
  );
};

export default DirectToGoal;

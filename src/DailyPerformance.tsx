import React from 'react';

interface DailyPerformanceProps {
  value: string;
  percentage: number;
  label?: string; // optional label prop
}

const DailyPerformance: React.FC<DailyPerformanceProps> = ({
  value,
  percentage,
  label = "Päivittäinen suorite", // default label if none is provided
}) => {
  return (
    <div className="p-4 bg-blue-500 text-white rounded shadow-lg">
      <h3 className="text-lg font-bold">{label}</h3>
      <p>{value} ({percentage}%)</p>
    </div>
  );
};

export default DailyPerformance;

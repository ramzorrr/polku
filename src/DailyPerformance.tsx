import React from 'react';

interface DailyPerformanceProps {
  value: string;
  percentage: number;
  label?: string;
}

const DailyPerformance: React.FC<DailyPerformanceProps> = ({
  value,
  percentage,
  label = "Päivittäinen suorite",
}) => {
  return (
    <div className="p-6 bg-gradient-to-r from-blue-600 to-blue-400 text-white rounded-lg shadow-md hover:shadow-xl transform hover:scale-105 transition duration-300">
      <h3 className="text-xl font-semibold mb-2">{label}</h3>
      <p className="text-2xl font-bold">{value} <span className="text-lg">({percentage}%)</span></p>
    </div>
  );
};

export default DailyPerformance;

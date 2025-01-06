import React from 'react';

const DailyPerformance = ({ value, percentage }: { value: string, percentage: number }) => {
  return (
    <div className="p-4 bg-blue-500 text-white rounded shadow-lg">
      <h3 className="text-lg font-bold">Päivittäinen suorite</h3>
      <p>{value} ({percentage}%)</p>
    </div>
  );
};

export default DailyPerformance;
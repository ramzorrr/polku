import React from 'react';

const DirectToGoal = ({ value, percentage }: { value: string, percentage: number }) => {
  return (
    <div className="p-4 bg-green-500 text-white rounded shadow-lg">
      <h3 className="text-lg font-bold">Suoraan tavoitteeseen</h3>
      <p>{value} ({percentage}%)</p>
    </div>
  );
};

export default DirectToGoal;
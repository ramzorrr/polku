import React from 'react';

const RemainingWorkdays = ({ days }: { days: number }) => {
  return (
    <div className="p-4 bg-red-500 text-white rounded shadow-lg">
      <h3 className="text-lg font-bold">Työpäiviä jäljellä</h3>
      <p>{days}</p>
    </div>
  );
};

export default RemainingWorkdays;
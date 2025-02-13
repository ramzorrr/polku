import React from 'react';

const RemainingWorkdays = ({ days }: { days: number }) => {
  return (
    <div className="p-6 bg-gradient-to-r from-red-600 to-red-400 text-white rounded-lg shadow-md hover:shadow-xl transform hover:scale-105 transition duration-300">
      <h3 className="text-xl font-semibold mb-2">Työpäiviä jäljellä</h3>
      <p className="text-2xl font-bold">{days}</p>
    </div>
  );
};

export default RemainingWorkdays;

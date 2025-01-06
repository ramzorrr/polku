import React, { useState, useEffect } from 'react';
import DailyPerformance from './DailyPerformance';
import DirectToGoal from './DirectToGoal';
import RemainingWorkdays from './RemainingWorkdays';

const Tavoite = ({ data, period }: { data: { [key: string]: number }, period: string }) => {
  const [goal, setGoal] = useState(7.25);
  const [savedGoal, setSavedGoal] = useState<number | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    // Load the saved goal from localStorage when the component mounts
    const storedGoal = localStorage.getItem('savedGoal');
    if (storedGoal) {
      setSavedGoal(parseFloat(storedGoal));
      console.log('Loaded saved goal:', storedGoal);
    }
  }, []);

  const calculatePercentage = (value: number) => {
    const percentage = ((value - 7.25) / (10.88 - 7.25)) * 50 + 100;
    return Math.round(percentage); // Round to the nearest integer
  };

  const handleSliderChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setGoal(parseFloat(event.target.value));
  };

  const handleSaveGoal = () => {
    localStorage.setItem('savedGoal', goal.toString());
    setSavedGoal(goal);
    setMessage('Tavoite tallennettu');
    console.log('Saved goal:', goal);
    setTimeout(() => setMessage(null), 3000); // Clear the message after 3 seconds
  };

  const countWeekdays = (startDay: number, endDay: number, fullYear: number, month: number): number => {
    let weekdays = 0;
    for (let i = startDay; i <= endDay; i++) {
      const date = new Date(fullYear, month, i);
      const dayOfWeek = date.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        weekdays++;
      }
    }
    return weekdays;
  };

  const calculateRemainingAverage = () => {
    if (savedGoal === null) return null;
  
    const today = new Date();
    const fullYear = today.getFullYear();
    const month = today.getMonth();
    const startDay = today.getDate() <= 15 ? 1 : 16;
    const endDay = today.getDate() <= 15 ? 15 : new Date(fullYear, month + 1, 0).getDate();
    const totalWeekdays = countWeekdays(startDay, endDay, fullYear, month);
    const remainingWeekdays = countWeekdays(today.getDate() + 1, endDay, fullYear, month);
  
    // Filter data for the current period
    const filteredDates = Object.keys(data).filter((dateString) => {
      const date = new Date(dateString);
      const day = date.getDate();
      const isCurrentPeriod =
        period === 'Jakso 1' ? day >= 1 && day <= 15 : day >= 16;
      return isCurrentPeriod;
    });
  
    const total = filteredDates.reduce((sum, dateString) => sum + (data[dateString] || 0), 0);
    const currentAverage = filteredDates.length ? total / filteredDates.length : 0;

    const requiredTotal = savedGoal * totalWeekdays;
    const requiredRemaining = requiredTotal - total;

    // Calculate remaining weekdays, including weekends with data
    const remainingDays = Array.from({ length: endDay - today.getDate() }, (_, i) => today.getDate() + i + 1)
      .filter(day => {
        const date = new Date(fullYear, month, day);
        const dayOfWeek = date.getDay();
        return dayOfWeek !== 0 && dayOfWeek !== 6 || data[`${fullYear}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`];
      }).length;

    const remainingAverage = remainingWeekdays ? (requiredRemaining / remainingWeekdays).toFixed(2) : '0.00';
    const nextDayPerformance = (savedGoal * (filteredDates.length + 1) - total).toFixed(2);

    return {
      remainingAverage,
      nextDayPerformance,
      currentAverage: currentAverage.toFixed(2),
      remainingDays,
      currentAveragePercentage: calculatePercentage(currentAverage),
      remainingAveragePercentage: calculatePercentage(parseFloat(remainingAverage)),
      nextDayPerformancePercentage: calculatePercentage(parseFloat(nextDayPerformance)),
    };
  };

  const remainingAverageData = calculateRemainingAverage();

  return (
    <div className="flex flex-col items-center p-4">
      <h2 className="text-2xl font-pmedium text-secondary mb-4">Aseta tavoite</h2>
      <div className="mt-4">
        <p className="text-lg font-bold">Tavoite: {goal} {calculatePercentage(goal)}%</p>
      </div>
      <input
        type="range"
        min="7.25"
        max="10.88"
        step="0.01"
        value={goal}
        onChange={handleSliderChange}
        className="w-full"
      />
      <button
        onClick={handleSaveGoal}
        className="bg-secondary text-white px-4 py-2 mt-4 rounded"
      >
        Aseta Tavoite
      </button>
      {message && (
        <div className="mt-4 p-2 bg-green-500 text-white rounded">
          {message}
        </div>
      )}
      {savedGoal !== null && (
        <div className="mt-4">
          <p className="text-lg font-bold">Tallennettu tavoite: {savedGoal} {calculatePercentage(savedGoal)}%</p>
        </div>
      )}
      {savedGoal !== null && remainingAverageData && (
        <div className="mt-4 grid grid-cols-1 gap-4">
          <DailyPerformance value={remainingAverageData.remainingAverage} percentage={remainingAverageData.remainingAveragePercentage} />
          <DirectToGoal value={remainingAverageData.nextDayPerformance} percentage={remainingAverageData.nextDayPerformancePercentage} />
          <RemainingWorkdays days={remainingAverageData.remainingDays} />
        </div>
      )}
    </div>
  );
};

export default Tavoite;
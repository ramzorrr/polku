// Tavoite.tsx
import React, { useState, useEffect } from 'react';
import DailyPerformance from './DailyPerformance';
import DirectToGoal from './DirectToGoal';
import RemainingWorkdays from './RemainingWorkdays';
import localforage from 'localforage';
import { DailyData, calculatePercentage, performanceToEuro, forkliftPerformanceToEuro } from './utils';
import { usePerformanceCalculations } from './usePerformanceCalculations';
import { FaWarehouse } from 'react-icons/fa';

interface TavoiteProps {
  data: { [key: string]: DailyData };
  period: string;
  selectedDate: Date;
  warehouse: string;
}

const Tavoite: React.FC<TavoiteProps> = ({ data, period, selectedDate, warehouse }) => {
  const [goal, setGoal] = useState(100);
  const [savedGoal, setSavedGoal] = useState<number | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const todayWithoutTime = new Date();
  todayWithoutTime.setHours(0, 0, 0, 0);
  const selectedDateWithoutTime = new Date(selectedDate);
  selectedDateWithoutTime.setHours(0, 0, 0, 0);
  const isPastPeriod = selectedDateWithoutTime < todayWithoutTime;

  // Load saved goal.
  useEffect(() => {
    const storedGoal = localStorage.getItem('savedGoal');
    if (storedGoal) {
      const parsedGoal = parseFloat(storedGoal);
      setSavedGoal(parsedGoal);
      setGoal(parsedGoal);
    }
  }, []);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setGoal(parseFloat(e.target.value));
  };

  const handleSaveGoal = () => {
    localStorage.setItem('savedGoal', goal.toString());
    setSavedGoal(goal);
    setMessage('Tavoite tallennettu');
    setTimeout(() => setMessage(null), 3000);
  };

  const formatDate = (dateString: string): string => {
    const [year, month, day] = dateString.split('-');
    return `${day}.${month}.${year}`;
  };

  const filterDates = (d: Date): boolean => {
    const day = d.getDate();
    return period === 'Jakso 1' ? day >= 1 && day <= 15 : day >= 16;
  };

  // Use the custom hook to get calculated values.
  const {
    remainingDataNormal,
    remainingDataForklift,
    sharedMissingDays,
    overallAverage,
    overallAveragePercentage,
  } = usePerformanceCalculations(data, period, selectedDate, savedGoal);

  // Determine if the period is complete.
  const now = new Date();
  const currentDay = now.getDate();
  let periodCompleted = false;
  if (period === 'Jakso 1' && currentDay > 15) {
    periodCompleted = true;
  } else if (period === 'Jakso 2') {
    const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    if (currentDay === lastDayOfMonth) {
      periodCompleted = true;
    }
  }

  // Compute helper flags to determine if any normal or forklift data exists.
  const hasNormalData = Object.keys(data).some((dateString) => {
    const dObj = new Date(dateString + "T00:00:00");
    if (dObj.getFullYear() === selectedDate.getFullYear() && dObj.getMonth() === selectedDate.getMonth()) {
      const d = dObj.getDate();
      return period === 'Jakso 1'
        ? (d >= 1 && d <= 15 && data[dateString].normal !== undefined)
        : (d >= 16 && data[dateString].normal !== undefined);
    }
    return false;
  });

  const hasForkliftData = Object.keys(data).some((dateString) => {
    const dObj = new Date(dateString + "T00:00:00");
    if (dObj.getFullYear() === selectedDate.getFullYear() && dObj.getMonth() === selectedDate.getMonth()) {
      const d = dObj.getDate();
      return period === 'Jakso 1'
        ? (d >= 1 && d <= 15 && data[dateString].forklift !== undefined)
        : (d >= 16 && data[dateString].forklift !== undefined);
    }
    return false;
  });

  const selectedDateString = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`;
  const selectedDayData = data[selectedDateString] || {};

  return (
    <div className="flex flex-col items-center p-4">
      <div className="mt-4">
        <p className="text-lg font-bold">Tavoite: {goal}%</p>
      </div>
      <input
        type="range"
        min="100"
        max="150"
        step="1"
        value={goal}
        onChange={handleSliderChange}
        className="w-full"
      />
      <button onClick={handleSaveGoal} className="bg-secondary text-white px-4 py-2 mt-4 rounded">
        Aseta Tavoite
      </button>
      {message && (
        <div className="mt-4 p-2 bg-green-500 text-white rounded">
          {message}
        </div>
      )}

      <div className="mt-4 grid grid-cols-1 gap-4">{!isPastPeriod && <RemainingWorkdays days={sharedMissingDays} />}</div>

      {savedGoal !== null && remainingDataNormal && hasNormalData && (
        <div className="mt-4 grid grid-cols-1 gap-4">
          <h1 className="text-xl font-semibold mb-2">Keräys</h1>
          <div className="p-6 bg-gradient-to-r from-pink-600 to-pink-400 text-white rounded-lg shadow-md hover:shadow-xl transform hover:scale-105 transition duration-300">
            <h3 className="text-xl font-semibold mb-2">Jakson keskisuorite</h3>
            <p className="text-2xl font-bold">{remainingDataNormal.currentAveragePercentage}%</p>
            <h3 className="text-xl font-semibold mt-4">Maksetut työtunnit</h3>
            <p className="text-2xl font-bold">{remainingDataNormal.totalInputHours} h</p>
            <h3 className="text-xl font-semibold mt-4">Maksettu suoritteesta</h3>
            <p className="text-xl font-bold">
            {remainingDataNormal.totalInputHours}h x {performanceToEuro(Number(remainingDataNormal.currentAveragePercentage), warehouse)} €/h = {(Number(remainingDataNormal.totalInputHours) * performanceToEuro(Number(remainingDataNormal.currentAveragePercentage), warehouse)).toFixed(2)} €
            </p>
          </div>
          {!periodCompleted && (
            <>
              <DailyPerformance
                value={remainingDataNormal.dailyRequiredAbsolute}
                percentage={parseInt(remainingDataNormal.dailyRequiredPercentage)}
                label="Päivittäinen suorite"
              />
              <DirectToGoal
                value={remainingDataNormal.instantlyToGoalAbsolute}
                percentage={parseInt(remainingDataNormal.instantlyToGoalPercentage)}
                label="Suoraan tavoitteeseen"
              />
            </>
          )}
        </div>
      )}

      {savedGoal !== null && remainingDataForklift && hasForkliftData && (
        <div className="mt-8 grid grid-cols-1 gap-4">
          <h1 className="text-xl font-semibold mb-2">Trukki</h1>
          <div className="p-6 bg-gradient-to-r from-purple-600 to-purple-400 text-white rounded-lg shadow-md hover:shadow-xl transform hover:scale-105 transition duration-300">
            <h3 className="text-xl font-semibold mb-2">Jakson keskisuorite</h3>
            <p className="text-2xl font-bold">{remainingDataForklift.currentAveragePercentage}%</p>
            <h3 className="text-xl font-semibold mt-4">Maksetut työtunnit</h3>
            <p className="text-2xl font-bold">{remainingDataForklift.totalInputHours} h</p>
            <h3 className="text-xl font-semibold mt-4">Maksettu suoritteesta</h3>
            <p className="text-xl font-bold">
              {remainingDataForklift.totalInputHours}h x {forkliftPerformanceToEuro(Number(remainingDataForklift.currentAveragePercentage), warehouse)} €/h = {(Number(remainingDataForklift.totalInputHours) * forkliftPerformanceToEuro(Number(remainingDataForklift.currentAveragePercentage), warehouse)).toFixed(2)} €
            </p>
          </div>
          {!periodCompleted && (
            <>
              <DailyPerformance
                value={remainingDataForklift.dailyRequiredAbsolute}
                percentage={parseInt(remainingDataForklift.dailyRequiredPercentage)}
                label="Päivittäinen suorite"
              />
              <DirectToGoal
                value={remainingDataForklift.instantlyToGoalAbsolute}
                percentage={parseInt(remainingDataForklift.instantlyToGoalPercentage)}
                label="Suoraan tavoitteeseen"
              />
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default Tavoite;

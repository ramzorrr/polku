// Tavoite.tsx
import React, { useState, useEffect } from 'react';
import DailyPerformance from './DailyPerformance';
import DirectToGoal from './DirectToGoal';
import RemainingWorkdays from './RemainingWorkdays';
import localforage from 'localforage';
import {
  DateData,
  DailyData,
  effectiveHours,
  computePerformancePercentage,
  calculateAverage,
  calculatePercentage,
} from './utils';

interface TavoiteProps {
  data: { [key: string]: DailyData };
  period: string;
  selectedDate: Date;
}

const Tavoite: React.FC<TavoiteProps> = ({ data, period, selectedDate }) => {
  // Goal is a percentage.
  const [goal, setGoal] = useState(100); // default value
  const [savedGoal, setSavedGoal] = useState<number | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  // For days with no data, assume a default 8‑hour day:
  // Normal day: effective = 8 − 0.75 = 7.25  
  // (We use the same default for normal mode)
  const defaultHours = 8;
  const defaultEffective = 7.25;
  // (For forklift, we now use the same baseline as normal mode.)

  // On mount, load saved goal from localforage.
  useEffect(() => {
    localforage.getItem('savedGoal')
      .then((storedGoal) => {
        if (storedGoal != null) {
          const parsedGoal = parseFloat(storedGoal.toString());
          setSavedGoal(parsedGoal);
          setGoal(parsedGoal);
        }
      })
      .catch((err) => console.error('Error retrieving savedGoal from localforage:', err));
  }, []);

  const handleSliderChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setGoal(parseFloat(event.target.value));
  };

  const handleSaveGoal = () => {
    localforage.setItem('savedGoal', goal)
      .then(() => {
        setSavedGoal(goal);
        setMessage('Tavoite tallennettu');
        setTimeout(() => setMessage(null), 3000);
      })
      .catch((err) => console.error('Error saving savedGoal to localforage:', err));
  };

  // Utility function for formatting date strings.
  const formatDate = (dateString: string): string => {
    const [year, month, day] = dateString.split('-');
    return `${day}.${month}.${year}`;
  };

  // Use the passed 'period' prop to filter dates.
  const filterDates = (date: Date): boolean => {
    const day = date.getDate();
    return period === 'Jakso 1' ? day >= 1 && day <= 15 : day >= 16;
  };

  // Use selectedDate instead of new Date()
  const selectedDateString = `${selectedDate.getFullYear()}-${String(
    selectedDate.getMonth() + 1
  ).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`;

  // --- Shared missing days calculation ---
  const today = selectedDate;
  const fullYear = today.getFullYear();
  const month = today.getMonth();
  const periodStartDay = period === 'Jakso 1' ? 1 : 16;
  const periodEndDay =
    period === 'Jakso 1' ? 15 : new Date(fullYear, month + 1, 0).getDate();

  let totalWorkingDays = 0;
  let sharedLoggedDays = 0;
  for (let d = periodStartDay; d <= periodEndDay; d++) {
    const currDate = new Date(fullYear, month, d);
    if (currDate.getDay() === 0 || currDate.getDay() === 6) continue;
    totalWorkingDays++;
    const dateStr = `${fullYear}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    // A day is considered logged if it has either normal or forklift data.
    if (data[dateStr] && (data[dateStr].normal || data[dateStr].forklift)) {
      sharedLoggedDays++;
    }
  }
  const sharedMissingDays = totalWorkingDays - sharedLoggedDays;

  // --- Normal mode remaining data calculation ---
  const calculateRemainingDataNormal = () => {
    if (savedGoal === null) return null;
    let totalEffectiveLogged = 0;
    let totalPerformanceLogged = 0;
    let totalInputHours = 0;
    // Iterate over all dates in the current month that fall in the period.
    Object.keys(data).forEach((dateString) => {
      const dObj = new Date(dateString + "T00:00:00");
      if (dObj.getFullYear() === fullYear && dObj.getMonth() === month) {
        const d = dObj.getDate();
        if (d >= periodStartDay && d <= periodEndDay) {
          // Use only normal mode data.
          if (data[dateString] && data[dateString].normal) {
            const entry = data[dateString].normal;
            // PAID HOURS ADJUSTMENT: deduct 0.5h for normal shifts (if shift is at least 4h, not overtime or free day)
            const paidHours =
              (entry.hours >= 4 && !entry.overtime && !entry.freeDay)
                ? entry.hours - 0.5
                : entry.hours;
            totalInputHours += paidHours;
            const eff = effectiveHours(entry.hours, entry.overtime, entry.freeDay);
            totalEffectiveLogged += eff;
            totalPerformanceLogged += entry.performance;
          }
        }
      }
    });
    const totalEffectivePeriod = totalEffectiveLogged + sharedMissingDays * defaultEffective;
    const targetTotalPerformance = totalEffectivePeriod * (savedGoal / 100);
    const remainingRequired = targetTotalPerformance - totalPerformanceLogged;
    const dailyRequiredAbsolute = sharedMissingDays > 0 ? remainingRequired / sharedMissingDays : 0;
    const dailyRequiredPercentage = defaultEffective > 0 ? (dailyRequiredAbsolute / defaultEffective) * 100 : 0;
    const currentAveragePercentage = totalEffectiveLogged > 0 ? (totalPerformanceLogged / totalEffectiveLogged) * 100 : 0;
    const instantlyToGoalAbsolute =
      totalEffectiveLogged + defaultEffective > 0
        ? (savedGoal / 100) * (totalEffectiveLogged + defaultEffective) - totalPerformanceLogged
        : 0;
    const instantlyToGoalPercentage = defaultEffective > 0 ? (instantlyToGoalAbsolute / defaultEffective) * 100 : 0;
    return {
      dailyRequiredAbsolute: dailyRequiredAbsolute.toFixed(2),
      dailyRequiredPercentage: dailyRequiredPercentage.toFixed(0),
      currentAveragePercentage: currentAveragePercentage.toFixed(0),
      missingDays: sharedMissingDays,
      instantlyToGoalAbsolute: instantlyToGoalAbsolute.toFixed(2),
      instantlyToGoalPercentage: instantlyToGoalPercentage.toFixed(0),
      totalInputHours: totalInputHours.toFixed(2),
    };
  };

  const remainingDataNormal = calculateRemainingDataNormal();

  // --- Forklift remaining data calculation ---
  const calculateRemainingDataForklift = () => {
    if (savedGoal === null) return null;
    let totalEffectiveLogged = 0;
    let totalPerformanceLogged = 0;
    let totalInputHours = 0;
    Object.keys(data).forEach((dateString) => {
      const dObj = new Date(dateString + "T00:00:00");
      if (dObj.getFullYear() === fullYear && dObj.getMonth() === month) {
        const d = dObj.getDate();
        if (d >= periodStartDay && d <= periodEndDay) {
          // Use only forklift data.
          if (data[dateString] && data[dateString].forklift) {
            const entry = data[dateString].forklift;
            // PAID HOURS ADJUSTMENT: apply same deduction for forklift as normal mode.
            const paidHours =
              (entry.hours >= 4 && !entry.overtime && !entry.freeDay)
                ? entry.hours - 0.5
                : entry.hours;
            totalInputHours += paidHours;
            const eff = effectiveHours(entry.hours, entry.overtime, entry.freeDay);
            totalEffectiveLogged += eff;
            totalPerformanceLogged += entry.performance;
          }
        }
      }
    });
    const totalEffectivePeriod = totalEffectiveLogged + sharedMissingDays * defaultEffective;
    const targetTotalPerformance = totalEffectivePeriod * (savedGoal / 100);
    const remainingRequired = targetTotalPerformance - totalPerformanceLogged;
    const dailyRequiredAbsolute = sharedMissingDays > 0 ? remainingRequired / sharedMissingDays : 0;
    const dailyRequiredPercentage = defaultEffective > 0 ? (dailyRequiredAbsolute / defaultEffective) * 100 : 0;
    const currentAveragePercentage = totalEffectiveLogged > 0 ? (totalPerformanceLogged / totalEffectiveLogged) * 100 : 0;
    const instantlyToGoalAbsolute =
      totalEffectiveLogged + defaultEffective > 0
        ? (savedGoal / 100) * (totalEffectiveLogged + defaultEffective) - totalPerformanceLogged
        : 0;
    const instantlyToGoalPercentage = defaultEffective > 0 ? (instantlyToGoalAbsolute / defaultEffective) * 100 : 0;
    return {
      dailyRequiredAbsolute: dailyRequiredAbsolute.toFixed(2),
      dailyRequiredPercentage: dailyRequiredPercentage.toFixed(0),
      currentAveragePercentage: currentAveragePercentage.toFixed(0),
      missingDays: sharedMissingDays,
      instantlyToGoalAbsolute: instantlyToGoalAbsolute.toFixed(2),
      instantlyToGoalPercentage: instantlyToGoalPercentage.toFixed(0),
      totalInputHours: totalInputHours.toFixed(2),
    };
  };

  const remainingDataForklift = calculateRemainingDataForklift();

  // Check if any forklift data exists.
  const hasForkliftData = Object.keys(data).some(
    dateString => data[dateString] && data[dateString].forklift !== undefined
  );

  // Overall period average using imported helpers (unchanged for normal).
  const overallAverage = parseFloat(calculateAverage(data as any, filterDates));
  const overallAveragePercentage = calculatePercentage(overallAverage);

  return (
    <div className="flex flex-col items-center p-4">
      {/* Goal slider */}
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

      {/* Normal Performance Summary */}
      {savedGoal !== null && remainingDataNormal && (
        <div className="mt-4 grid grid-cols-1 gap-4">
          <div className="p-6 bg-gradient-to-r from-pink-600 to-pink-400 text-white rounded-lg shadow-md hover:shadow-xl transform hover:scale-105 transition duration-300">
            <h3 className="text-xl font-semibold mb-2">Jakson keskisuorite (0591)</h3>
            <p className="text-2xl font-bold">{remainingDataNormal.currentAveragePercentage}%</p>
            <h3 className="text-xl font-semibold mt-4">Maksetut työtunnit (0591)</h3>
            <p className="text-2xl font-bold">{remainingDataNormal.totalInputHours} h</p>
          </div>
          <DailyPerformance
            value={remainingDataNormal.dailyRequiredAbsolute}
            percentage={parseInt(remainingDataNormal.dailyRequiredPercentage)}
            label="Päivittäinen suorite (0591)"
          />
          <DirectToGoal
            value={remainingDataNormal.instantlyToGoalAbsolute}
            percentage={parseInt(remainingDataNormal.instantlyToGoalPercentage)}
            label="Suoraan tavoitteeseen (0591)"
          />
        </div>
      )}

      {/* Forklift Performance Summary */}
      {savedGoal !== null && remainingDataForklift && hasForkliftData && (
        <div className="mt-8 grid grid-cols-1 gap-4">
          <div className="p-6 bg-gradient-to-r from-purple-600 to-purple-400 text-white rounded-lg shadow-md hover:shadow-xl transform hover:scale-105 transition duration-300">
            <h3 className="text-xl font-semibold mb-2">Jakson keskisuorite (2301)</h3>
            <p className="text-2xl font-bold">{remainingDataForklift.currentAveragePercentage}%</p>
            <h3 className="text-xl font-semibold mt-4">Maksetut työtunnit (2301)</h3>
            <p className="text-2xl font-bold">{remainingDataForklift.totalInputHours} h</p>
          </div>
          <DailyPerformance
            value={remainingDataForklift.dailyRequiredAbsolute}
            percentage={parseInt(remainingDataForklift.dailyRequiredPercentage)}
            label="Päivittäinen suorite (2301)"
          />
          <DirectToGoal
            value={remainingDataForklift.instantlyToGoalAbsolute}
            percentage={parseInt(remainingDataForklift.instantlyToGoalPercentage)}
            label="Suoraan tavoitteeseen (2301)"
          />
          <RemainingWorkdays days={sharedMissingDays} />
        </div>
      )}
    </div>
  );
};

export default Tavoite;

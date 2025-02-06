import React, { useState, useEffect } from 'react';
import DailyPerformance from './DailyPerformance';
import DirectToGoal from './DirectToGoal';
import RemainingWorkdays from './RemainingWorkdays';

interface DateData {
  performance: number;
  hours: number;
  overtime: boolean;
}

const Tavoite = ({
  data,
  period,
}: {
  data: { [key: string]: DateData };
  period: string;
}) => {
  // Goal is now a percentage.
  const [goal, setGoal] = useState(100); // e.g., default to 110%
  const [savedGoal, setSavedGoal] = useState<number | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  // For days with no data, assume a default 8-hour day (overtime off)
  const defaultHours = 8;
  const defaultOvertime = false;
  const defaultEffective = defaultHours - 0.75; // = 7.25

  useEffect(() => {
    const storedGoal = localStorage.getItem('savedGoal');
    if (storedGoal) {
      setSavedGoal(parseFloat(storedGoal));
    }
  }, []);

  const handleSliderChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setGoal(parseFloat(event.target.value));
  };

  const handleSaveGoal = () => {
    localStorage.setItem('savedGoal', goal.toString());
    setSavedGoal(goal);
    setMessage('Tavoite tallennettu');
    setTimeout(() => setMessage(null), 3000);
  };

  // Calculate effective hours based on the number of hours worked and overtime flag.
  const effectiveHours = (hours: number, overtime: boolean): number => {
    if (hours <= 8) {
      return hours - 0.75;
    } else {
      if (overtime) {
        // Only one break is deducted even if hours > 8.
        return hours - 0.75;
      } else {
        // Deduct one break per (full or partial) 8-hour block.
        const breaks = Math.ceil(hours / 8);
        return hours - 0.75 * breaks;
      }
    }
  };

  const calculateRemainingAverage = () => {
    if (savedGoal === null) return null;

    const today = new Date();
    const fullYear = today.getFullYear();
    const month = today.getMonth();
    const dayToday = today.getDate();

    // Determine period boundaries.
    const periodStartDay = period === 'Jakso 1' ? 1 : 16;
    const periodEndDay =
      period === 'Jakso 1' ? 15 : new Date(fullYear, month + 1, 0).getDate();

    // Sum performance and effective hours from logged days.
    let totalEffectiveLogged = 0;
    let totalPerformanceLogged = 0;
    let loggedDays = 0;

    Object.keys(data).forEach((dateString) => {
      const date = new Date(dateString);
      if (date.getFullYear() === fullYear && date.getMonth() === month) {
        const d = date.getDate();
        if (d >= periodStartDay && d <= periodEndDay) {
          const entry = data[dateString];
          const eff = effectiveHours(entry.hours, entry.overtime);
          totalEffectiveLogged += eff;
          totalPerformanceLogged += entry.performance;
          loggedDays++;
        }
      }
    });

    // Count missing (yet-to-be logged) workdays from today onward.
    let missingDays = 0;
    for (let d = dayToday; d <= periodEndDay; d++) {
      const currentDate = new Date(fullYear, month, d);
      // Only consider weekdays.
      if (currentDate.getDay() !== 0 && currentDate.getDay() !== 6) {
        const dateStr = `${fullYear}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        if (!(dateStr in data)) {
          missingDays++;
        }
      }
    }

    // Total effective hours for the period =
    // (logged effective hours) + (missing days * default effective hours).
    const totalEffectivePeriod = totalEffectiveLogged + missingDays * defaultEffective;

    // The target total performance for the period is:
    //   totalEffectivePeriod * (goal percentage / 100).
    const targetTotalPerformance = totalEffectivePeriod * (savedGoal / 100);

    // Remaining performance that must be achieved.
    const remainingRequired = targetTotalPerformance - totalPerformanceLogged;

    // For missing days (assumed to be default days), the daily required absolute performance:
    const dailyRequiredAbsolute = missingDays > 0 ? remainingRequired / missingDays : 0;
    // And as a percentage (relative to default effective hours):
    const dailyRequiredPercentage = defaultEffective > 0 ? (dailyRequiredAbsolute / defaultEffective) * 100 : 0;

    // Current average percentage (weighted by effective hours of logged days).
    const currentAveragePercentage =
      totalEffectiveLogged > 0 ? (totalPerformanceLogged / totalEffectiveLogged) * 100 : 0;

    // Instantly to goal:
    // Determine the performance (on a default day) needed so that
    // (current performance + x) / (current effective hours + defaultEffective) = savedGoal/100.
    const instantlyToGoalAbsolute =
      totalEffectiveLogged + defaultEffective > 0
        ? (savedGoal / 100) * (totalEffectiveLogged + defaultEffective) - totalPerformanceLogged
        : 0;
    const instantlyToGoalPercentage =
      defaultEffective > 0 ? (instantlyToGoalAbsolute / defaultEffective) * 100 : 0;

    return {
      dailyRequiredAbsolute: dailyRequiredAbsolute.toFixed(2),
      dailyRequiredPercentage: dailyRequiredPercentage.toFixed(0),
      currentAveragePercentage: currentAveragePercentage.toFixed(0),
      missingDays,
      instantlyToGoalAbsolute: instantlyToGoalAbsolute.toFixed(2),
      instantlyToGoalPercentage: instantlyToGoalPercentage.toFixed(0),
    };
  };

  const remainingData = calculateRemainingAverage();

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
      {savedGoal !== null && remainingData && (
        <div className="mt-4 grid grid-cols-1 gap-4">
          <div className="p-4 bg-pink-500 text-white rounded shadow-lg">
            <h3 className="text-lg font-bold">Jakson keskisuorite</h3>
            <p>{remainingData.currentAveragePercentage}%</p>
          </div>
          <DailyPerformance
            value={remainingData.dailyRequiredAbsolute}
            percentage={parseInt(remainingData.dailyRequiredPercentage)}
            label="Päivittäinen suorite"
          />
          <DirectToGoal
            value={remainingData.instantlyToGoalAbsolute}
            percentage={parseInt(remainingData.instantlyToGoalPercentage)}
            label="Suoraan tavoitteeseen"
          />
          <RemainingWorkdays days={remainingData.missingDays} />
        </div>
      )}
    </div>
  );
};

export default Tavoite;

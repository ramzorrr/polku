// Tavoite.tsx
import React, { useState, useEffect } from 'react';
import DailyPerformance from './DailyPerformance';
import DirectToGoal from './DirectToGoal';
import RemainingWorkdays from './RemainingWorkdays';
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

  // Default effective hours for missing days.
  const defaultEffectiveNormal = 7.25;
  const defaultEffectiveForklift = 7.75; // assumed default for forklift

  useEffect(() => {
    const storedGoal = localStorage.getItem('savedGoal');
    if (storedGoal) {
      const parsedGoal = parseFloat(storedGoal);
      setSavedGoal(parsedGoal);
      setGoal(parsedGoal);
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

  const formatDate = (dateString: string): string => {
    const [year, month, day] = dateString.split('-');
    return `${day}.${month}.${year}`;
  };

  const filterDates = (date: Date): boolean => {
    const day = date.getDate();
    return period === 'Jakso 1' ? day >= 1 && day <= 15 : day >= 16;
  };

  const selectedDateString = `${selectedDate.getFullYear()}-${String(
    selectedDate.getMonth() + 1
  ).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`;

  // Shared missing days: count working days in period and mark days with any data as logged.
  const today = selectedDate;
  const fullYear = today.getFullYear();
  const month = today.getMonth();
  const dayToday = today.getDate();
  const periodStartDay = period === 'Jakso 1' ? 1 : 16;
  const periodEndDay =
    period === 'Jakso 1' ? 15 : new Date(fullYear, month + 1, 0).getDate();

  let totalWorkingDays = 0;
  let loggedDays = 0;

  // Totals for each mode (only summing over days with data for that mode)
  let normalTotalEffective = 0;
  let normalTotalPerformance = 0;
  let normalTotalInputHours = 0;

  let forkliftTotalEffective = 0;
  let forkliftTotalPerformance = 0;
  let forkliftTotalInputHours = 0;

  // Loop over every working day in the period.
  for (let d = periodStartDay; d <= periodEndDay; d++) {
    const currDate = new Date(fullYear, month, d);
    // Skip weekends.
    if (currDate.getDay() === 0 || currDate.getDay() === 6) continue;
    totalWorkingDays++;

    const dateStr = `${fullYear}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const dayData = data[dateStr];

    // Consider the day as logged if there is any data.
    if (dayData && (dayData.normal || dayData.forklift)) {
      loggedDays++;
    }

    // For normal mode: if there's data, update totals.
    if (dayData && dayData.normal) {
      // Determine majority rule if both modes exist on the same day.
      let normalApply = true;
      if (dayData.normal && dayData.forklift) {
        normalApply = dayData.normal.hours >= dayData.forklift.hours;
      }
      const entry = dayData.normal;
      const eff = effectiveHours(entry.hours, entry.overtime, entry.freeDay, false, normalApply);
      normalTotalEffective += eff;
      normalTotalPerformance += entry.performance;
      normalTotalInputHours += entry.hours;
    }
    // For forklift mode:
    if (dayData && dayData.forklift) {
      let forkliftApply = true;
      if (dayData.normal && dayData.forklift) {
        forkliftApply = dayData.forklift.hours > dayData.normal.hours;
      }
      const entry = dayData.forklift;
      const eff = effectiveHours(entry.hours, entry.overtime, entry.freeDay, true, forkliftApply);
      forkliftTotalEffective += eff;
      forkliftTotalPerformance += entry.performance;
      forkliftTotalInputHours += entry.hours;
    }
  }

  // Shared missing days = working days without any record.
  const sharedMissingDays = totalWorkingDays - loggedDays;

  // Add default effective hours for missing days.
  const totalEffectiveNormal = normalTotalEffective + sharedMissingDays * defaultEffectiveNormal;
  const totalEffectiveForklift = forkliftTotalEffective + sharedMissingDays * defaultEffectiveForklift;

  // Compute target performance and remaining required performance for each mode.
  const targetTotalPerformanceNormal = totalEffectiveNormal * (savedGoal ? savedGoal / 100 : 1);
  const remainingRequiredNormal = targetTotalPerformanceNormal - normalTotalPerformance;
  const dailyRequiredAbsoluteNormal = sharedMissingDays > 0 ? remainingRequiredNormal / sharedMissingDays : 0;
  const dailyRequiredPercentageNormal = defaultEffectiveNormal > 0 ? (dailyRequiredAbsoluteNormal / defaultEffectiveNormal) * 100 : 0;
  const currentAveragePercentageNormal = totalEffectiveNormal > 0 ? (normalTotalPerformance / totalEffectiveNormal) * 100 : 0;
  const instantlyToGoalAbsoluteNormal = totalEffectiveNormal > 0
    ? (savedGoal ? savedGoal / 100 : 1) * totalEffectiveNormal - normalTotalPerformance
    : 0;
  const instantlyToGoalPercentageNormal = defaultEffectiveNormal > 0 ? (instantlyToGoalAbsoluteNormal / defaultEffectiveNormal) * 100 : 0;

  const targetTotalPerformanceForklift = totalEffectiveForklift * (savedGoal ? savedGoal / 100 : 1);
  const remainingRequiredForklift = targetTotalPerformanceForklift - forkliftTotalPerformance;
  const dailyRequiredAbsoluteForklift = sharedMissingDays > 0 ? remainingRequiredForklift / sharedMissingDays : 0;
  const dailyRequiredPercentageForklift = defaultEffectiveForklift > 0 ? (dailyRequiredAbsoluteForklift / defaultEffectiveForklift) * 100 : 0;
  const currentAveragePercentageForklift = totalEffectiveForklift > 0 ? (forkliftTotalPerformance / totalEffectiveForklift) * 100 : 0;
  const instantlyToGoalAbsoluteForklift = totalEffectiveForklift > 0
    ? (savedGoal ? savedGoal / 100 : 1) * totalEffectiveForklift - forkliftTotalPerformance
    : 0;
  const instantlyToGoalPercentageForklift = defaultEffectiveForklift > 0 ? (instantlyToGoalAbsoluteForklift / defaultEffectiveForklift) * 100 : 0;

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

      {/* Summary for Normal Performance */}
      {savedGoal !== null && (
        <>
          <div className="mt-4 grid grid-cols-1 gap-4">
            <div className="p-6 bg-gradient-to-r from-pink-600 to-pink-400 text-white rounded-lg shadow-md hover:shadow-xl transform hover:scale-105 transition duration-300">
              <h3 className="text-xl font-semibold mb-2">Jakson keskisuorite (0591)</h3>
              <p className="text-2xl font-bold">{currentAveragePercentageNormal.toFixed(0)}%</p>
              <h3 className="text-xl font-semibold mt-4">Maksetut työtunnit (0591)</h3>
              <p className="text-2xl font-bold">{normalTotalInputHours.toFixed(2)} h</p>
            </div>
            <DailyPerformance
              value={dailyRequiredAbsoluteNormal.toFixed(2)}
              percentage={parseInt(dailyRequiredPercentageNormal.toFixed(0))}
              label="Päivittäinen suorite (0591)"
            />
            <DirectToGoal
              value={instantlyToGoalAbsoluteNormal.toFixed(2)}
              percentage={parseInt(instantlyToGoalPercentageNormal.toFixed(0))}
              label="Suoraan tavoitteeseen (0591)"
            />
          </div>

          {/* Summary for Forklift Performance */}
          <div className="mt-8 grid grid-cols-1 gap-4">
            <div className="p-6 bg-gradient-to-r from-purple-600 to-purple-400 text-white rounded-lg shadow-md hover:shadow-xl transform hover:scale-105 transition duration-300">
              <h3 className="text-xl font-semibold mb-2">Jakson keskisuorite (2301)</h3>
              <p className="text-2xl font-bold">{currentAveragePercentageForklift.toFixed(0)}%</p>
              <h3 className="text-xl font-semibold mt-4">Maksetut työtunnit (2301)</h3>
              <p className="text-2xl font-bold">{forkliftTotalInputHours.toFixed(2)} h</p>
            </div>
            <DailyPerformance
              value={dailyRequiredAbsoluteForklift.toFixed(2)}
              percentage={parseInt(dailyRequiredPercentageForklift.toFixed(0))}
              label="Päivittäinen suorite (2301)"
            />
            <DirectToGoal
              value={instantlyToGoalAbsoluteForklift.toFixed(2)}
              percentage={parseInt(instantlyToGoalPercentageForklift.toFixed(0))}
              label="Suoraan tavoitteeseen (2301)"
            />
            <RemainingWorkdays days={sharedMissingDays} />
          </div>
        </>
      )}
    </div>
  );
};

export default Tavoite;

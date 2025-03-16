// usePerformanceCalculations.ts
import { useMemo } from 'react';
import { DailyData, effectiveHours, calculateAverage, calculatePercentage } from './utils';

interface PerformanceCalculationResults {
  remainingDataNormal: {
    dailyRequiredAbsolute: string;
    dailyRequiredPercentage: string;
    currentAveragePercentage: string;
    missingDays: number;
    instantlyToGoalAbsolute: string;
    instantlyToGoalPercentage: string;
    totalInputHours: string;
  } | null;
  remainingDataForklift: {
    dailyRequiredAbsolute: string;
    dailyRequiredPercentage: string;
    currentAveragePercentage: string;
    missingDays: number;
    instantlyToGoalAbsolute: string;
    instantlyToGoalPercentage: string;
    totalInputHours: string;
  } | null;
  sharedMissingDays: number;
  overallAverage: number;
  overallAveragePercentage: number;
}

export const usePerformanceCalculations = (
  data: { [key: string]: DailyData },
  period: string,
  selectedDate: Date,
  savedGoal: number | null
): PerformanceCalculationResults => {
  const defaultHours = 8;
  const defaultEffective = 7.25;

  return useMemo(() => {
    // Calculate shared missing days:
    const fullYear = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    const periodStartDay = period === 'Jakso 1' ? 1 : 16;
    const periodEndDay =
      period === 'Jakso 1'
        ? 15
        : new Date(fullYear, month + 1, 0).getDate();

    let totalWorkingDays = 0;
    let sharedLoggedDays = 0;
    for (let d = periodStartDay; d <= periodEndDay; d++) {
      const currDate = new Date(fullYear, month, d);
      if (currDate.getDay() === 0 || currDate.getDay() === 6) continue;
      totalWorkingDays++;
      const dateStr = `${fullYear}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      if (data[dateStr] && (data[dateStr].normal || data[dateStr].forklift)) {
        sharedLoggedDays++;
      }
    }
    const sharedMissingDays = totalWorkingDays - sharedLoggedDays;

    const filterDates = (d: Date): boolean => {
        const day = d.getDate();
        return period === 'Jakso 1' ? day >= 1 && day <= 15 : day >= 16;
      };

    // Calculation for Normal mode.
    const remainingDataNormal = (() => {
      if (savedGoal === null) return null;
      let totalEffectiveLogged = 0;
      let totalPerformanceLogged = 0;
      let totalInputHours = 0;
      Object.keys(data).forEach((dateString) => {
        const dObj = new Date(dateString + "T00:00:00");
        if (dObj.getFullYear() === fullYear && dObj.getMonth() === month) {
          const d = dObj.getDate();
          if (d >= periodStartDay && d <= periodEndDay && data[dateString]?.normal) {
            const entry = data[dateString].normal;
            // Deduct 0.5h if shift is at least 4h and not overtime/freeDay.
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
    })();

    // Calculation for Forklift mode.
    const remainingDataForklift = (() => {
      if (savedGoal === null) return null;
      let totalEffectiveLogged = 0;
      let totalPerformanceLogged = 0;
      let totalInputHours = 0;
      Object.keys(data).forEach((dateString) => {
        const dObj = new Date(dateString + "T00:00:00");
        if (dObj.getFullYear() === fullYear && dObj.getMonth() === month) {
          const d = dObj.getDate();
          if (d >= periodStartDay && d <= periodEndDay && data[dateString]?.forklift) {
            const entry = data[dateString].forklift;
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
    })();

    // Overall period averages.
    const overallAverage = parseFloat(calculateAverage(data, filterDates));
    const overallAveragePercentage = calculatePercentage(overallAverage);

    return {
      remainingDataNormal,
      remainingDataForklift,
      sharedMissingDays,
      overallAverage,
      overallAveragePercentage,
    };
  }, [data, period, selectedDate, savedGoal]);
};

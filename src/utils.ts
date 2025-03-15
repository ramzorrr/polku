// utils.ts

export interface DateData {
  performance: number;
  hours: number;
  overtime: boolean;
  freeDay: boolean;
}

export interface DailyData {
  normal?: DateData;
  forklift?: DateData;
}

/**
 * Calculates effective working hours.
 *
 * @param hours - input hours
 * @param overtime - overtime flag
 * @param freeDay - freeDay flag
 * @param applyBreakDeduction - if false, no break deduction is applied
 * @returns effective hours
 */
export const effectiveHours = (
  hours: number,
  overtime: boolean,
  freeDay: boolean,
  applyBreakDeduction: boolean = true
): number => {
  if (freeDay) {
    // Free day: use raw hours multiplied by 0.967.
    return hours * 0.967;
  } else if (overtime) {
    // Overtime day: enforce minimum 8 and maximum 16 hours.
    const clampedHours = Math.max(8, Math.min(hours, 16));
    return 7.25 + (clampedHours - 8) * 0.967;
  } else {
    // Normal (non-overtime) day:
    if (hours < 4) {
      // No deduction for very short shifts.
      return hours;
    } else if (hours <= 8) {
      return applyBreakDeduction ? hours - 0.75 : hours;
    } else {
      return applyBreakDeduction ? 7.25 + (hours - 8) * 0.967 : 8 + (hours - 8) * 0.967;
    }
  }
};

/**
 * Computes performance percentage given an entry.
 */
export const computePerformancePercentage = (
  entry: DateData,
  applyBreakDeduction: boolean = true
): number => {
  const eff = effectiveHours(entry.hours, entry.overtime, entry.freeDay, applyBreakDeduction);
  if (eff <= 0) return 0;
  return Math.round((entry.performance / eff) * 100);
};

/**
 * Calculates the average performance over the dates that pass the filter.
 * The mode parameter indicates whether to use "normal" or "forklift" data.
 */
export const calculateAverage = (
  data: { [key: string]: DailyData },
  filterDates: (date: Date) => boolean,
  mode: 'normal' | 'forklift' = 'normal'
): string => {
  const filteredDates = Object.keys(data).filter((dateString) => {
    const dateObj = new Date(dateString + "T00:00:00");
    return filterDates(dateObj);
  });
  const total = filteredDates.reduce((sum, dateString) => {
    const entry = data[dateString][mode];
    const perf = entry ? Number(entry.performance) : 0;
    return sum + (isNaN(perf) ? 0 : perf);
  }, 0);
  const average = filteredDates.length > 0 ? total / filteredDates.length : 0;
  return average.toFixed(2);
};

export const calculatePercentage = (value: number): number => {
  const percentage = ((value - 7.25) / (10.88 - 7.25)) * 50 + 100;
  return Math.round(percentage);
};

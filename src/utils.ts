// utils.ts

export interface DateData {
  performance: number;
  hours: number;
  overtime: boolean;
  freeDay: boolean;
}

/**
 * Calculates effective working hours.
 *
 * Modes:
 * - Normal (freeDay === false, overtime === false):
 *    - For hours ≤ 8: effective = hours - 0.75
 *    - For hours > 8: effective = 7.25 (base for 8 hours) + (extra hours - 0.75)
 * - Overtime on a regular day (freeDay === false, overtime === true):
 *    - For hours ≤ 8: effective = hours - 0.75
 *    - For hours > 8: effective = 7.25 (base) + (extra hours * 0.967)
 * - Overtime on a free day (freeDay === true):
 *    - For hours ≤ 8: effective = hours - 0.25
 *    - For hours > 8: effective = (8 - 0.25) + (extra hours × 0.967)
 */
export const effectiveHours = (
  hours: number,
  overtime: boolean,
  freeDay: boolean
): number => {
  // If working less than 4 hours, no deduction is applied.
  if (hours < 4) {
    return hours;
  }
  
  if (freeDay) {
    // Overtime on a free day: always multiply the total hours by 0.967.
    return hours * 0.967;
  } else {
    // Normal or overtime on a regular day.
    if (!overtime) {
      // Normal day:
      if (hours <= 8) {
        return hours - 0.75;
      } else {
        const extra = hours - 8;
        return 7.25 + (extra - 0.75);
      }
    } else {
      // Overtime on a regular day:
      if (hours <= 8) {
        return hours * 0.967;
      } else {
        const extra = hours - 8;
        return 7.25 + (extra * 0.967);
      }
    }
  }
};

/**
 * Computes performance percentage given an entry.
 * The percentage is computed as (performance / effectiveHours) * 100.
 */
export const computePerformancePercentage = (entry: DateData): number => {
  const eff = effectiveHours(entry.hours, entry.overtime, entry.freeDay);
  if (eff <= 0) return 0;
  return Math.round((entry.performance / eff) * 100);
};

/**
 * Calculates the average performance over the dates that pass the filter.
 * 
 * @param data - A record mapping date strings to DateData.
 * @param filterDates - A function that takes a Date and returns true if it should be included.
 * @returns The average performance as a string (fixed to 2 decimals).
 */
export const calculateAverage = (
  data: { [key: string]: DateData },
  filterDates: (date: Date) => boolean
): string => {
  const filteredDates = Object.keys(data).filter((dateString) => {
    const dateObj = new Date(dateString + "T00:00:00");
    return filterDates(dateObj);
  });
  const total = filteredDates.reduce((sum, dateString) => {
    const perf = Number(data[dateString].performance);
    return sum + (isNaN(perf) ? 0 : perf);
  }, 0);
  const average = filteredDates.length > 0 ? total / filteredDates.length : 0;
  return average.toFixed(2);
};


export const calculatePercentage = (value: number): number => {
  const percentage = ((value - 7.25) / (10.88 - 7.25)) * 50 + 100;
  return Math.round(percentage);
};
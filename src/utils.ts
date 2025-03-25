// utils.ts

export interface DateData {
  performance: number;
  hours: number;
  overtime: boolean;
  freeDay: boolean;
  startTime?: string;
  endTime?: string;
  tuntikortti?: number;
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

export const performanceToEuro = (percentage: number, warehouse: string = "pakaste"): number => {
  if (warehouse !== "pakaste") {
    // For KV1/KV2, return 0 (or a placeholder value) until rates are added.
    return 0;
  }


  const performanceRates: { [key: number]: number } = {
    150: 7.07,
    149: 7.02,
    148: 6.94,
    147: 6.89,
    146: 6.84,
    145: 6.78,
    144: 6.69,
    143: 6.61,
    142: 6.53,
    141: 6.44,
    140: 6.37,
    139: 6.32,
    138: 6.19,
    137: 6.11,
    136: 6.01,
    135: 5.96,
    134: 5.89,
    133: 5.79,
    132: 5.68,
    131: 5.63,
    130: 5.61,
    129: 5.54,
    128: 5.48,
    127: 5.42,
    126: 5.36,
    125: 5.28,
    124: 5.18,
    123: 5.05,
    122: 4.94,
    121: 4.84,
    120: 4.73,
    119: 4.57,
    118: 4.44,
    117: 4.13,
    116: 3.96,
    115: 3.77,
    114: 3.63,
    113: 3.45,
    112: 3.28,
    111: 3.07,
    110: 2.8,
    109: 2.69,
    108: 2.52,
    107: 2.47,
    106: 2.35,
    105: 2.23,
    104: 2.13,
    103: 2.04,
    102: 1.93,
    101: 1.81,
    100: 1.74,
    99: 1.52,
    98: 1.38,
    97: 1.16,
    96: 0.93,
    95: 0.51,
    94: 0.0,
  };

  // Round the given percentage.
  const rounded = Math.round(percentage);
  // Return the corresponding €/h or a fallback within the valid range.
  return performanceRates[rounded] ?? performanceRates[Math.max(94, Math.min(150, rounded))];
};

// forkliftPerformanceToEuro.ts (or place in utils.ts)

export const forkliftPerformanceToEuro = (percentage: number, warehouse: string = "pakaste"): number => {
  if (warehouse !== "pakaste") {
    return 0;
  }


  const forkliftRates: { [key: number]: number } = {
    150: 7.46,
    149: 7.38,
    148: 7.29,
    147: 7.21,
    146: 7.13,
    145: 7.05,
    144: 6.94,
    143: 6.86,
    142: 6.76,
    141: 6.68,
    140: 6.58,
    139: 6.42,
    138: 6.34,
    137: 6.24,
    136: 6.13,
    135: 5.95,
    134: 5.83,
    133: 5.75,
    132: 5.67,
    131: 5.58,
    130: 5.47,
    129: 5.32,
    128: 5.20,
    127: 5.13,
    126: 5.01,
    125: 4.89,
    124: 4.77,
    123: 4.66,
    122: 4.55,
    121: 4.46,
    120: 4.34,
    119: 4.23,
    118: 4.04,
    117: 3.91,
    116: 3.77,
    115: 3.60,
    114: 3.44,
    113: 3.24,
    112: 3.08,
    111: 2.97,
    110: 2.85,
    109: 2.71,
    108: 2.58,
    107: 2.50,
    106: 2.42,
    105: 2.34,
    104: 2.26,
    103: 2.18,
    102: 2.10,
    101: 2.03,
    100: 1.94,
    99: 1.60,
    98: 1.25,
    97: 0.91,
    96: 0.56,
    95: 0.23,
  };

  // Round the given percentage to the nearest integer.
  const rounded = Math.round(percentage);
  // Return the corresponding €/h or a fallback within the valid range.
  return forkliftRates[rounded] ?? forkliftRates[Math.max(95, Math.min(150, rounded))];
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

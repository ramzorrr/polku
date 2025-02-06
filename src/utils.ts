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
 *    - For hours > 8: effective = 7.25 (base) + (extra hours - 0.25)
 * - Overtime on a free day (freeDay === true):
 *    - For hours ≤ 8: effective = hours - 0.25
 *    - For hours > 8: effective = (8 - 0.25) + (extra hours × 0.967)
 */
export const effectiveHours = (
  hours: number,
  overtime: boolean,
  freeDay: boolean
): number => {
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
        return hours - 0.75;
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

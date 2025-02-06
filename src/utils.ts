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
   *    - For hours > 8: effective = 7.75 (base for 8 hours) + (extra hours - 0.25)
   */
  export const effectiveHours = (
    hours: number,
    overtime: boolean,
    freeDay: boolean
  ): number => {
    if (hours <= 8) {
      return freeDay ? hours - 0.25 : hours - 0.75;
    } else {
      const extra = hours - 8;
      let base: number, extraDeduction: number;
      if (freeDay) {
        base = 8 - 0.25; // 7.75 effective for the first 8 hours
        extraDeduction = 0.25;
      } else {
        base = 8 - 0.75; // 7.25 effective for the first 8 hours
        extraDeduction = overtime ? 0.25 : 0.75;
      }
      const extraEffective = extra - extraDeduction;
      return base + extraEffective;
    }
  };
  
  /**
   * Computes performance percentage given an entry.
   * The percentage is computed as (performance / effective hours) * 100.
   */
  export const computePerformancePercentage = (entry: DateData): number => {
    const effective = effectiveHours(entry.hours, entry.overtime, entry.freeDay);
    if (effective <= 0) return 0;
    return Math.round((entry.performance / effective) * 100);
  };
  
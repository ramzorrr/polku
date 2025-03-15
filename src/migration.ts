// migration.ts
import { DailyData, DateData } from './utils';

/**
 * Migrates old data format to the new DailyData format.
 *
 * If an entry is in the old format (i.e. it has a "performance" property directly and no "normal" property),
 * it wraps that entry in an object under the "normal" key.
 *
 * @param oldData - The data object loaded from localForage.
 * @returns A new data object with the old entries migrated to the new format.
 */
export const migrateOldData = (oldData: { [key: string]: any }): { [key: string]: DailyData } => {
  const newData: { [key: string]: DailyData } = {};
  for (const dateStr in oldData) {
    if (oldData.hasOwnProperty(dateStr)) {
      const entry = oldData[dateStr];
      // If entry is not already in the new format (i.e. does not have a "normal" property)
      if (entry && entry.performance !== undefined && entry.normal === undefined) {
        newData[dateStr] = { normal: entry as DateData };
      } else {
        newData[dateStr] = entry as DailyData;
      }
    }
  }
  return newData;
};

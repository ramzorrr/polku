// migrateStorage.ts
import localforage from 'localforage';

export async function migrateLocalStorageToLocalForage() {
  const keysToMigrate = ['calendarData', 'multiplierTotal', 'savedGoal'];

  for (const key of keysToMigrate) {
    const localData = localStorage.getItem(key);
    if (localData !== null) {
      try {
        await localforage.setItem(key, localData);
        localStorage.removeItem(key);
        console.log(`Migrated key: ${key}`);
      } catch (error) {
        console.error(`Error migrating key ${key}:`, error);
      }
    }
  }
}

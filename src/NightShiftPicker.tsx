// NightShiftPicker.tsx

import React, { useState, useEffect } from 'react';

interface NightShiftPickerProps {
  onChangeStartTime: (val: string) => void;
  onChangeEndTime: (val: string) => void;
}

/**
 * For an 'Night shift' scenario:
 * - Sign in time: allowed hours are 21 or 22
 *    - If hour=21 → minutes between 45 and 59
 *    - If hour=22 → minutes between 0 and 15
 *
 * - Sign out time: free input using native <input type="time">
 *   Its constraints are defined in PerformanceModal.
 */
function NightShiftPicker({ onChangeStartTime, onChangeEndTime }: NightShiftPickerProps) {
  // Default sign in: hour=21, minute=45 (21:45)
  const [startHour, setStartHour] = useState<number>(21);
  const [startMinute, setStartMinute] = useState<number>(45);

  // We assume that the sign out time will be entered via a native time input in the parent.
  // Therefore, this component only handles the sign-in (start) time.

  // Helper to format "HH:MM" in 24-hour format.
  function formatTime(h: number, m: number): string {
    return String(h).padStart(2, '0') + ':' + String(m).padStart(2, '0');
  }

  /**
   * START (Sign in) logic:
   * Valid hours: [21, 22]
   * - If hour=21: minutes must be between 45 and 59.
   * - If hour=22: minutes must be between 0 and 15.
   */
  const handleStartHourChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newHour = parseInt(e.target.value, 10);
    setStartHour(newHour);
    let newMin = startMinute;
    if (newHour === 21 && newMin < 45) {
      newMin = 45;
    }
    if (newHour === 22 && newMin > 15) {
      newMin = 15;
    }
    setStartMinute(newMin);
    onChangeStartTime(formatTime(newHour, newMin));
  };

  const handleStartMinuteChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newMin = parseInt(e.target.value, 10);
    setStartMinute(newMin);
    onChangeStartTime(formatTime(startHour, newMin));
  };

  function getStartMinutes(h: number): number[] {
    if (h === 21) {
      // Allowed minutes: 45..59
      return Array.from({ length: 15 }, (_, i) => i + 45);
    } else {
      // If hour is 22: allowed minutes: 0..15
      return Array.from({ length: 16 }, (_, i) => i);
    }
  }

  return (
    <div className="p-2 border rounded">
      <p className="font-bold">Yövuoro – Sisään</p>
      <div className="mt-2">
        <div className="flex space-x-2">
          <select value={startHour} onChange={handleStartHourChange} className="border px-2 rounded">
            <option value={21}>21</option>
            <option value={22}>22</option>
          </select>
          <span>:</span>
          <select value={startMinute} onChange={handleStartMinuteChange} className="border px-2 rounded">
            {getStartMinutes(startHour).map((m) => (
              <option key={m} value={m}>
                {String(m).padStart(2, '0')}
              </option>
            ))}
          </select>
        </div>
      </div>
      {/* Note: Sign-out time will be handled separately as a free input */}
    </div>
  );
}

export default NightShiftPicker;

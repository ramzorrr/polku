// NightShiftPicker.tsx

import React, { useState } from 'react';

interface NightShiftPickerProps {
  onChangeStartTime: (val: string) => void;
  onChangeEndTime: (val: string) => void;
}

/**
 * For a 'night shift' scenario:
 * Sign in time => 21:xx or 22:xx
 * Sign out time => 05:xx or 06:xx
 * 
 * For example:
 *  - Sign in between 21:45..22:15
 *  - Sign out between 05:45..06:15
 */
function NightShiftPicker({ onChangeStartTime, onChangeEndTime }: NightShiftPickerProps) {
  // Default start time: hour=21, minute=45
  const [startHour, setStartHour] = useState<number>(21);
  const [startMinute, setStartMinute] = useState<number>(45);

  // Default end time: hour=5, minute=45
  const [endHour, setEndHour] = useState<number>(5);
  const [endMinute, setEndMinute] = useState<number>(45);

  // Build "HH:MM"
  function formatTime(h: number, m: number) {
    return String(h).padStart(2, '0') + ':' + String(m).padStart(2, '0');
  }

  /**
   * START (Sign in) logic
   * Valid hours for sign in => [21, 22]
   * If hour=21 => minutes might be 45..59
   * If hour=22 => minutes might be 0..15
   */
  const handleStartHourChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newHour = parseInt(e.target.value, 10);
    setStartHour(newHour);

    let newMin = startMinute;
    // if hour=21 => must be minute >=45
    if (newHour === 21 && newMin < 45) {
      newMin = 45;
    }
    // if hour=22 => must be minute <=15
    if (newHour === 22 && newMin > 15) {
      newMin = 15;
    }
    setStartMinute(newMin);

    onChangeStartTime(formatTime(newHour, newMin));
  };

  const handleStartMinuteChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    let newMin = parseInt(e.target.value, 10);
    setStartMinute(newMin);
    onChangeStartTime(formatTime(startHour, newMin));
  };

  function getStartMinutes(h: number): number[] {
    if (h === 21) {
      // 45..59
      return Array.from({ length: 15 }, (_, i) => i + 45);
    } else {
      // hour=22 => 0..15
      return Array.from({ length: 16 }, (_, i) => i);
    }
  }

  /**
   * END (Sign out) logic
   * Valid hours => [5, 6]
   * If hour=5 => minutes might be 45..59
   * If hour=6 => minutes might be 0..15
   */
  const handleEndHourChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newHour = parseInt(e.target.value, 10);
    setEndHour(newHour);

    let newMin = endMinute;
    // if hour=5 => minute >=45
    if (newHour === 5 && newMin < 45) {
      newMin = 45;
    }
    // if hour=6 => minute <=15
    if (newHour === 6 && newMin > 15) {
      newMin = 15;
    }
    setEndMinute(newMin);

    onChangeEndTime(formatTime(newHour, newMin));
  };

  const handleEndMinuteChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    let newMin = parseInt(e.target.value, 10);
    setEndMinute(newMin);
    onChangeEndTime(formatTime(endHour, newMin));
  };

  function getEndMinutes(h: number): number[] {
    if (h === 5) {
      // 45..59
      return Array.from({ length: 15 }, (_, i) => i + 45);
    } else {
      // hour=6 => 0..15
      return Array.from({ length: 16 }, (_, i) => i);
    }
  }

  return (
    <div className="p-2 border rounded">
      <p className="font-bold">Yövuoro</p>
    

      {/* START TIME FIELDS */}
      <div className="mt-2">
        <label className="block text-sm font-medium text-gray-700">Sisään</label>
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

      {/* END TIME FIELDS */}
      <div className="mt-4">
        <label className="block text-sm font-medium text-gray-700">Ulos</label>
        <div className="flex space-x-2">
          <select value={endHour} onChange={handleEndHourChange} className="border px-2 rounded">
            <option value={5}>05</option>
            <option value={6}>06</option>
          </select>
          <span>:</span>
          <select value={endMinute} onChange={handleEndMinuteChange} className="border px-2 rounded">
            {getEndMinutes(endHour).map((m) => (
              <option key={m} value={m}>
                {String(m).padStart(2, '0')}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}

export default NightShiftPicker;

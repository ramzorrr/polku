// EveningShiftPicker.tsx

import React, { useState } from 'react';

interface EveningShiftPickerProps {
  onChangeStartTime: (val: string) => void;
  onChangeEndTime: (val: string) => void;
}

/**
 * For an 'evening shift' scenario:
 * Sign in time => 13:xx or 14:xx (13:45..14:15)
 * Sign out time => 21:xx or 22:xx (21:45..22:15)
 */
function EveningShiftPicker({ onChangeStartTime, onChangeEndTime }: EveningShiftPickerProps) {
  // Default sign in: hour=13, minute=45 (13:45)
  const [startHour, setStartHour] = useState<number>(13);
  const [startMinute, setStartMinute] = useState<number>(45);

  // Default sign out: hour=21, minute=45 (21:45)
  const [endHour, setEndHour] = useState<number>(21);
  const [endMinute, setEndMinute] = useState<number>(45);

  // Helper to build "HH:MM"
  function formatTime(h: number, m: number) {
    return String(h).padStart(2, '0') + ':' + String(m).padStart(2, '0');
  }

  /**
   * START (Sign in) logic
   * Valid hours => [13, 14]
   * If hour=13 => minutes >=45..59
   * If hour=14 => minutes <=15..00
   */
  const handleStartHourChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newHour = parseInt(e.target.value, 10);
    setStartHour(newHour);

    let newMin = startMinute;
    // if hour=13 => must be minute >=45
    if (newHour === 13 && newMin < 45) {
      newMin = 45;
    }
    // if hour=14 => must be minute <=15
    if (newHour === 14 && newMin > 15) {
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
    if (h === 13) {
      // 45..59
      return Array.from({ length: 15 }, (_, i) => i + 45); // 45..59
    } else {
      // hour=14 => 0..15
      return Array.from({ length: 16 }, (_, i) => i);      // 0..15
    }
  }

  /**
   * END (Sign out) logic
   * Valid hours => [21, 22]
   * If hour=21 => minutes >=45..59
   * If hour=22 => minutes <=15..00
   */
  const handleEndHourChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newHour = parseInt(e.target.value, 10);
    setEndHour(newHour);

    let newMin = endMinute;
    // if hour=21 => minute >=45
    if (newHour === 21 && newMin < 45) {
      newMin = 45;
    }
    // if hour=22 => minute <=15
    if (newHour === 22 && newMin > 15) {
      newMin = 15;
    }
    setEndMinute(newMin);

    onChangeEndTime(formatTime(newHour, newMin));
  };

  const handleEndMinuteChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newMin = parseInt(e.target.value, 10);
    setEndMinute(newMin);
    onChangeEndTime(formatTime(endHour, newMin));
  };

  function getEndMinutes(h: number): number[] {
    if (h === 21) {
      // 45..59
      return Array.from({ length: 15 }, (_, i) => i + 45);
    } else {
      // hour=22 => 0..15
      return Array.from({ length: 16 }, (_, i) => i);
    }
  }

  return (
    <div className="p-2 border rounded">
      <p className="font-bold">Iltavuoro</p>

      {/* START TIME (Sign in) */}
      <div className="mt-2">
        <label className="block text-sm font-medium text-gray-700">Sisään</label>
        <div className="flex space-x-2">
          <select
            value={startHour}
            onChange={handleStartHourChange}
            className="border px-2 rounded"
          >
            <option value={13}>13</option>
            <option value={14}>14</option>
          </select>
          <span>:</span>
          <select
            value={startMinute}
            onChange={handleStartMinuteChange}
            className="border px-2 rounded"
          >
            {getStartMinutes(startHour).map((m) => (
              <option key={m} value={m}>
                {String(m).padStart(2, '0')}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* END TIME (Sign out) */}
      <div className="mt-4">
        <label className="block text-sm font-medium text-gray-700">Ulos</label>
        <div className="flex space-x-2">
          <select
            value={endHour}
            onChange={handleEndHourChange}
            className="border px-2 rounded"
          >
            <option value={21}>21</option>
            <option value={22}>22</option>
          </select>
          <span>:</span>
          <select
            value={endMinute}
            onChange={handleEndMinuteChange}
            className="border px-2 rounded"
          >
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

export default EveningShiftPicker;

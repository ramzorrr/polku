// PerformanceModal.tsx

import React, { useState } from 'react';
import NightShiftPicker from './NightShiftPicker';
import MorningShiftPicker from './MorningShiftPicker';
import EveningShiftPicker from './EveningShiftPicker';

interface PerformanceModalProps {
  // Basic performance form data
  formData: {
    performance: string;
    hours: string;
    overtime: boolean;
    freeDay: boolean;
    startTime?: string; // e.g. "21:45"
    endTime?: string;   // e.g. "06:15"
  };
  // The shift we want to select by default
  defaultShift: 'morning' | 'evening' | 'night';

  onFormChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
}

/**
 * Helper to compute hours across midnight if sign-in is ~21..22 and sign-out is ~05..06,
 * or any shift that might cross midnight.
 */
function computeHoursFromTimes(start: string, end: string): number {
  if (!start || !end) return 0;
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);

  const startDate = new Date(0, 0, 0, sh, sm);
  let endDate = new Date(0, 0, 0, eh, em);

  // If end < start, assume next day
  if (eh < sh) {
    endDate = new Date(0, 0, 1, eh, em); // plus 24h
  }

  let diff = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60);
  if (diff < 0) diff = 0;
  return diff;
}

const PerformanceModal: React.FC<PerformanceModalProps> = ({
  formData,
  defaultShift,
  onFormChange,
  onSubmit,
  onClose,
}) => {
  // Start with the shift from defaultShift
  const [shift, setShift] = useState(defaultShift);

  // Called whenever the user picks a new "start time" in any of the shift pickers
  const handleStartTime = (newVal: string) => {
    onFormChange({
      target: { name: 'startTime', value: newVal, type: 'text' } as React.ChangeEvent<HTMLInputElement>['target'],
    } as React.ChangeEvent<HTMLInputElement>);

    const endVal = formData.endTime || '';
    const hours = computeHoursFromTimes(newVal, endVal);
    onFormChange({
      target: { name: 'hours', value: hours.toFixed(2), type: 'text' } as React.ChangeEvent<HTMLInputElement>['target'],
    } as React.ChangeEvent<HTMLInputElement>);
  };

  // Called whenever the user picks a new "end time"
  const handleEndTime = (newVal: string) => {
    onFormChange({
      target: { name: 'endTime', value: newVal, type: 'text' } as React.ChangeEvent<HTMLInputElement>['target'],
    } as React.ChangeEvent<HTMLInputElement>);

    const startVal = formData.startTime || '';
    const hours = computeHoursFromTimes(startVal, newVal);
    onFormChange({
      target: { name: 'hours', value: hours.toFixed(2), type: 'text' } as React.ChangeEvent<HTMLInputElement>['target'],
    } as React.ChangeEvent<HTMLInputElement>);
  };

  // If the user manually changes shift via radio buttons
  const handleShiftChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newShift = e.target.value as 'morning' | 'evening' | 'night';
    setShift(newShift);

    // Optionally reset times/hours
    onFormChange({
      target: { name: 'startTime', value: '', type: 'text' } as React.ChangeEvent<HTMLInputElement>['target'],
    } as React.ChangeEvent<HTMLInputElement>);
    onFormChange({
      target: { name: 'endTime', value: '', type: 'text' } as React.ChangeEvent<HTMLInputElement>['target'],
    } as React.ChangeEvent<HTMLInputElement>);
    onFormChange({
      target: { name: 'hours', value: '0.00', type: 'text' } as React.ChangeEvent<HTMLInputElement>['target'],
    } as React.ChangeEvent<HTMLInputElement>);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded shadow-lg w-80">
        <h3 className="text-xl font-bold mb-4">Lisää suorite</h3>

        <form onSubmit={onSubmit}>
          {/* SHIFT SELECTION */}
          <div className="mb-4">
            <p className="font-semibold mb-2">Valitse vuoro:</p>
            <label className="mr-4">
              <input
                type="radio"
                name="shift"
                value="morning"
                checked={shift === 'morning'}
                onChange={handleShiftChange}
              />
              Aamuvuoro
            </label>
            <label className="mr-4">
              <input
                type="radio"
                name="shift"
                value="evening"
                checked={shift === 'evening'}
                onChange={handleShiftChange}
              />
              Iltavuoro
            </label>
            <label className="mr-4">
              <input
                type="radio"
                name="shift"
                value="night"
                checked={shift === 'night'}
                onChange={handleShiftChange}
              />
              Yövuoro
            </label>
          </div>

          {/* SHIFT-BASED PICKER */}
          <div className="mb-4">
            {shift === 'night' ? (
              <NightShiftPicker
                onChangeStartTime={handleStartTime}
                onChangeEndTime={handleEndTime}
              />
            ) : shift === 'morning' ? (
              <MorningShiftPicker
                onChangeStartTime={handleStartTime}
                onChangeEndTime={handleEndTime}
              />
            ) : shift === 'evening' ? (
              <EveningShiftPicker
                onChangeStartTime={handleStartTime}
                onChangeEndTime={handleEndTime}
              />
            ) : null}
          </div>

          {/* Performance */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Suorite:</label>
            <input
              type="number"
              name="performance"
              value={formData.performance}
              onChange={onFormChange}
              className="mt-1 block w-full border border-gray-300 rounded-md"
              step="1"
              required
            />
          </div>

          {/* Hours */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Työtunnit:</label>
            <input
              type="number"
              name="hours"
              value={formData.hours}
              onChange={onFormChange}
              className="mt-1 block w-full border border-gray-300 rounded-md"
              step="0.01"
              min="0"
              max="24"
              required
            />
          </div>

          {/* Overtime & FreedDay */}
          <div className="mb-4 flex items-center">
            <label className="block text-sm font-medium text-gray-700 mr-2">Ylityö:</label>
            <input
              type="checkbox"
              name="overtime"
              checked={formData.overtime}
              onChange={onFormChange}
              className="h-4 w-4"
            />
          </div>
          <div className="mb-4 flex items-center">
            <label className="block text-sm font-medium text-gray-700 mr-2">
              Ylityö vapaapäivänä:
            </label>
            <input
              type="checkbox"
              name="freeDay"
              checked={formData.freeDay}
              onChange={onFormChange}
              className="h-4 w-4"
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="mr-2 px-4 py-2 bg-gray-300 text-gray-700 rounded"
            >
              Peruuta
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-secondary text-white rounded"
            >
              Tallenna
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PerformanceModal;

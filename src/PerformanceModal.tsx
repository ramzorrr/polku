// PerformanceModal.tsx

import React, { useState, useEffect, useRef } from 'react';
import NightShiftPicker from './NightShiftPicker';
import MorningShiftPicker from './MorningShiftPicker';
import EveningShiftPicker from './EveningShiftPicker';
import TimePicker from 'react-time-picker';

interface PerformanceModalProps {
  formData: {
    performance: string;
    hours: string;
    overtime: boolean;
    freeDay: boolean;
    startTime?: string; // e.g. "21:45"
    endTime?: string;   // e.g. "06:15"
  };
  defaultShift: 'morning' | 'evening' | 'night';
  onFormChange: (e: any) => void; // using "any" for synthetic events
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
}

/**
 * Computes the difference (in hours) between two times in "HH:mm" format.
 * If the end time is earlier than the start time, assumes the end time is on the next day.
 */
function computeHoursFromTimes(start: string, end: string): number {
  if (!start || !end) return 0;
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);

  const startDate = new Date(0, 0, 0, sh, sm);
  let endDate = new Date(0, 0, 0, eh, em);
  if (eh < sh) {
    endDate = new Date(0, 0, 1, eh, em); // assume next day
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
  // Initialize the shift from the defaultShift prop.
  const [shift, setShift] = useState<'morning' | 'evening' | 'night'>(defaultShift);

  // A set of fallback default start times for each shift.
  const defaultStartTimes: Record<'morning' | 'evening' | 'night', string> = {
    morning: "05:45",
    evening: "13:45",
    night: "21:45",
  };

  // Create a ref for the performance input field.
  const performanceInputRef = useRef<HTMLInputElement>(null);

  // Automatically focus the performance input field when the modal mounts.
  useEffect(() => {
    performanceInputRef.current?.focus();
  }, []);

  // When sign-in time changes, update formData and recompute hours.
  const handleStartTime = (newVal: string) => {
    onFormChange({ target: { name: 'startTime', value: newVal } } as any);
    // We compute hours only if sign-out time is available.
    const endVal = formData.endTime || '';
    const hours = newVal && endVal ? computeHoursFromTimes(newVal, endVal) : 8;
    onFormChange({ target: { name: 'hours', value: hours.toFixed(2) } } as any);
  };

  // When sign-out time changes, update formData and recompute hours.
  const handleEndTime = (newVal: string) => {
    onFormChange({ target: { name: 'endTime', value: newVal } } as any);
    // Use formData.startTime if available; otherwise, use a fallback default based on the current shift.
    const sVal =
      formData.startTime && formData.startTime.trim() !== ''
        ? formData.startTime
        : defaultStartTimes[shift];
    const hours = sVal && newVal ? computeHoursFromTimes(sVal, newVal) : 8;
    onFormChange({ target: { name: 'hours', value: hours.toFixed(2) } } as any);
  };

  // When the user changes the shift manually.
  const handleShiftChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newShift = e.target.value as 'morning' | 'evening' | 'night';
    setShift(newShift);
    // Optionally reset times/hours when the shift changes.
    onFormChange({ target: { name: 'startTime', value: '' } } as any);
    onFormChange({ target: { name: 'endTime', value: '' } } as any);
    onFormChange({ target: { name: 'hours', value: '8' } } as any);
  };

  // Automatically refresh computed hours whenever startTime or endTime change.
  useEffect(() => {
    if (formData.startTime && formData.endTime) {
      const sVal = formData.startTime.trim() !== '' ? formData.startTime : defaultStartTimes[shift];
      const hours = computeHoursFromTimes(sVal, formData.endTime);
      onFormChange({ target: { name: 'hours', value: hours.toFixed(2) } } as any);
    }
  }, [formData.startTime, formData.endTime, shift, onFormChange]);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50" lang="fi-FI">
      <div className="bg-white p-6 rounded text-black shadow-lg w-80">
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

          {/* SHIFT-BASED SIGN-IN TIME PICKER */}
          <div className="mb-4">
            <p className="font-semibold mb-2">Kirjautumisaika:</p>
            {shift === 'night' ? (
              <NightShiftPicker
                onChangeStartTime={handleStartTime}
                onChangeEndTime={() => {}}
              />
            ) : shift === 'morning' ? (
              <MorningShiftPicker
                onChangeStartTime={handleStartTime}
                onChangeEndTime={() => {}}
              />
            ) : shift === 'evening' ? (
              <EveningShiftPicker
                onChangeStartTime={handleStartTime}
                onChangeEndTime={() => {}}
              />
            ) : null}
          </div>

          {/* FREE SIGN-OUT TIME using react-time-picker in 24h format */}
          <div className="mb-4">
            <p className="font-semibold mb-2">Kirjaudu ulos:</p>
            <TimePicker
              onChange={(val) => handleEndTime(val || '')}
              value={formData.endTime || ''}
              disableClock={true}
              format="HH:mm"
              clearIcon={null}
            />
            <p className="text-xs text-black">
              Lisää aika, jolloin oman vuoron yli menevä työaika päättyy.
            </p>
          </div>

          {/* PERFORMANCE */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-black">Suorite:</label>
            <input
              ref={performanceInputRef}
              type="number"
              name="performance"
              value={formData.performance}
              onChange={onFormChange}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  onSubmit(e);
                }
              }}
              className="mt-1 block w-full border border-black rounded-md"
              step="1"
              required
            />
          </div>

          {/* HOURS */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-black">Työtunnit:</label>
            <input
              type="number"
              name="hours"
              value={formData.hours}
              onChange={onFormChange}
              className="mt-1 block w-full border border-black rounded-md"
              step="any"
              min="0"
              max="24"
              required
            />
          </div>

          {/* OVERTIME & FREE DAY */}
          <div className="mb-4 flex items-center">
            <label className="block text-sm font-medium text-black mr-2">Ylityö:</label>
            <input
              type="checkbox"
              name="overtime"
              checked={formData.overtime}
              onChange={onFormChange}
              className="h-4 w-4"
            />
          </div>
          <div className="mb-4 flex items-center">
            <label className="block text-sm font-medium text-black mr-2">Ylityö vapaapäivänä:</label>
            <input
              type="checkbox"
              name="freeDay"
              checked={formData.freeDay}
              onChange={onFormChange}
              className="h-4 w-4"
            />
          </div>

          {/* BUTTONS */}
          <div className="flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="mr-2 px-4 py-2 bg-gray text-black rounded"
            >
              Peruuta
            </button>
            <button type="submit" className="px-4 py-2 bg-secondary text-white rounded">
              Tallenna
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PerformanceModal;

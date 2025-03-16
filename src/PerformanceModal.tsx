// PerformanceModal.tsx
import React, { useEffect, useRef } from 'react';
import TimePicker from 'react-time-picker';
import 'react-clock/dist/Clock.css';

// Helper function to compute the difference in hours between two times.
function computeHoursFromTimes(start: string, end: string): number {
  if (!start || !end) return 0;
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  const startDate = new Date(0, 0, 0, sh, sm);
  let endDate = new Date(0, 0, 0, eh, em);
  if (eh < sh) {
    endDate = new Date(0, 0, 1, eh, em);
  }
  const diff = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60);
  return diff < 0 ? 0 : diff;
}

// Helper function to add hours to a time string ("HH:mm").
function addHours(time: string, hoursToAdd: number): string {
  const [hourStr, minuteStr] = time.split(':');
  const hour = parseInt(hourStr, 10);
  const minute = parseInt(minuteStr, 10);
  const date = new Date(0, 0, 0, hour, minute);
  date.setHours(date.getHours() + hoursToAdd);
  const newHour = date.getHours().toString().padStart(2, '0');
  const newMinute = date.getMinutes().toString().padStart(2, '0');
  return `${newHour}:${newMinute}`;
}

// Helper function to determine default sign‑in time.
function getDefaultStartTime(): string {
  const now = new Date();
  const totalMins = now.getHours() * 60 + now.getMinutes();
  const morningStart = 5 * 60 + 45;
  const morningEnd = 14 * 60 + 15;
  const eveningStart = 13 * 60 + 45;
  const eveningEnd = 22 * 60 + 15;
  if (totalMins >= morningStart && totalMins < morningEnd) {
    return "05:45";
  } else if (totalMins >= eveningStart && totalMins < eveningEnd) {
    return "13:45";
  } else {
    return "21:45";
  }
}

import { effectiveHours } from './utils';

interface PerformanceModalProps {
  formData: {
    performance: string;
    hours: string;
    overtime: boolean;
    freeDay: boolean;
    startTime?: string;
    endTime?: string;
    trukki: boolean;
  };
  defaultShift: 'morning' | 'evening' | 'night';
  onFormChange: (e: any) => void;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
  editing?: boolean; // When true, we're editing an existing entry.
}

const PerformanceModal: React.FC<PerformanceModalProps> = ({
  formData,
  defaultShift,
  onFormChange,
  onSubmit,
  onClose,
  editing = false,
}) => {
  const performanceInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    performanceInputRef.current?.focus();
  }, []);

  // Only set a default startTime when NOT editing.
  useEffect(() => {
    if (!editing && (!formData.startTime || formData.startTime.trim() === "")) {
      const defaultStart = getDefaultStartTime();
      onFormChange({ target: { name: 'startTime', value: defaultStart } } as any);
    }
  }, [formData.startTime, onFormChange, editing]);

  // Only auto-calculate endTime and hours when NOT editing.
  useEffect(() => {
    if (!editing && formData.startTime && (!formData.endTime || formData.endTime.trim() === "")) {
      const autoEnd = addHours(formData.startTime, 8);
      onFormChange({ target: { name: 'endTime', value: autoEnd } } as any);
      const hours = computeHoursFromTimes(formData.startTime, autoEnd);
      onFormChange({ target: { name: 'hours', value: hours.toFixed(2) } } as any);
    }
  }, [formData.startTime, formData.endTime, onFormChange, editing]);

  const handleStartTime = (newVal: string) => {
    onFormChange({ target: { name: 'startTime', value: newVal } } as any);
    if (formData.endTime && formData.endTime.trim() !== "") {
      const hours = computeHoursFromTimes(newVal, formData.endTime);
      onFormChange({ target: { name: 'hours', value: hours.toFixed(2) } } as any);
    }
  };

  const handleEndTime = (newVal: string) => {
    onFormChange({ target: { name: 'endTime', value: newVal } } as any);
    if (formData.startTime && formData.startTime.trim() !== "") {
      const hours = computeHoursFromTimes(formData.startTime, newVal);
      onFormChange({ target: { name: 'hours', value: hours.toFixed(2) } } as any);
    }
  };

  const hoursNumber = parseFloat(formData.hours) || 0;
  const perfValue = parseFloat(formData.performance) || 0;
  const effective = effectiveHours(hoursNumber, formData.overtime, formData.freeDay);
  const currentPercentage = effective > 0 ? (perfValue / effective) * 100 : 0;
  const additionalRequired = effective - perfValue;

  const handleLocalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedPerformance = parseFloat(formData.performance);
    if (Math.abs(parsedPerformance - 12.317) < 0.001) {
      alert("Miro on botti joka syö vehnäpullaa!");
    }
    onSubmit(e);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 backdrop-blur-sm transition-opacity duration-300" lang="fi-FI">
      <div className="bg-white p-6 rounded text-black shadow-lg w-80 transform transition-all duration-300">
        <h3 className="text-xl font-bold mb-4">Lisää suorite</h3>
        <form onSubmit={handleLocalSubmit}>
          <div className="mb-4">
            <p className="font-semibold mb-2">Kirjautumisaika:</p>
            <input
              type="time"
              value={formData.startTime || ''}
              onChange={(e) => handleStartTime(e.target.value)}
              className="w-full border border-gray-300 rounded-md p-2 text-lg focus:ring-2 focus:ring-secondary focus:outline-none"
              aria-label="Kirjautumisaika"
              step="60"
            />
          </div>
          <div className="mb-4">
            <p className="font-semibold mb-2">Kirjaudu ulos:</p>
            <input
              type="time"
              value={formData.endTime || ''}
              onChange={(e) => handleEndTime(e.target.value)}
              className="w-full border border-gray-300 rounded-md p-2 text-lg focus:ring-2 focus:ring-secondary focus:outline-none"
              aria-label="Kirjaudu ulos"
              step="60"
            />
          </div>
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
                  handleLocalSubmit(e);
                }
              }}
              className="mt-1 block w-full border border-black rounded-md"
              step="1"
              required
            />
            <p className="text-sm text-gray-600 mt-1">
              {currentPercentage.toFixed(1)}%. Tarvitset {additionalRequired.toFixed(2)} saavuttaaksesi 100%.
            </p>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-black">Työtunnit:</label>
            <input
              type="number"
              name="hours"
              value={formData.hours || ''}
              onChange={onFormChange}
              className="mt-1 block w-full border border-black rounded-md"
              step="any"
              min="0"
              max="24"
              required
            />
          </div>
          <div className="mb-4 flex items-center">
            <label className="block text-sm font-medium text-black mr-2">
              Oma vuoro + ylityö (yli 8h pv):
            </label>
            <input
              type="checkbox"
              name="overtime"
              checked={formData.overtime}
              onChange={onFormChange}
              className="h-4 w-4"
            />
          </div>
          <div className="mb-4 flex items-center">
            <label className="block text-sm font-medium text-black mr-2">
              Ylityö:
            </label>
            <input
              type="checkbox"
              name="freeDay"
              checked={formData.freeDay}
              onChange={onFormChange}
              className="h-4 w-4"
            />
          </div>
          <div className="mb-4 flex items-center">
            <label className="block text-sm font-medium text-black mr-2">
              Trukki:
            </label>
            <input
              type="checkbox"
              name="trukki"
              checked={formData.trukki}
              onChange={onFormChange}
              className="h-4 w-4"
            />
          </div>
          <div className="flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="mr-2 px-4 py-2 bg-gray-300 text-black rounded"
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

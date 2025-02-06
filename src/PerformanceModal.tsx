// PerformanceModal.tsx
import React from 'react';

interface PerformanceModalProps {
  formData: {
    performance: string;
    hours: string;
    overtime: boolean;
    freeDay: boolean;
  };
  onFormChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
}

const PerformanceModal: React.FC<PerformanceModalProps> = ({
  formData,
  onFormChange,
  onSubmit,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded shadow-lg w-80">
        <h3 className="text-xl font-bold mb-4">Lisää suorite</h3>
        <form onSubmit={onSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Suorite:</label>
            <input
              type="number"
              name="performance"
              value={formData.performance}
              onChange={onFormChange}
              className="mt-1 block w-full border-gray-300 rounded-md"
              step="1"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Työtunnit:</label>
            <input
              type="number"
              name="hours"
              value={formData.hours}
              onChange={onFormChange}
              className="mt-1 block w-full border-gray-300 rounded-md"
              step="1"
              min="4"
              max="16"
              required
            />
          </div>
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
            <label className="block text-sm font-medium text-gray-700 mr-2">Ylityö vapaapäivänä:</label>
            <input
              type="checkbox"
              name="freeDay"
              checked={formData.freeDay}
              onChange={onFormChange}
              className="h-4 w-4"
            />
          </div>
          <div className="flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="mr-2 px-4 py-2 bg-gray-300 text-gray-700 rounded"
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

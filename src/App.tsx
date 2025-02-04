import React, { useState, useEffect } from 'react';
import Calendar, { CalendarProps } from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './tailwind.css';
import './customCalendar.css';
import Tavoite from './Tavoite';
import Multiplier from './Multiplier';

interface DateData {
  performance: number;
  hours: number;
  overtime: boolean;
}

const App = () => {
  // Data now maps date strings to DateData objects.
  const [date, setDate] = useState(new Date());
  const [data, setData] = useState<{ [key: string]: DateData }>({});
  const [period, setPeriod] = useState('');
  const [showModal, setShowModal] = useState(false);
  
  // Form state for our modal.
  const [formData, setFormData] = useState({
    performance: '',
    hours: '8',
    overtime: false,
  });

  useEffect(() => {
    // Determine the period based on the current day on initial load.
    const currentDay = new Date().getDate();
    if (currentDay >= 1 && currentDay <= 15) {
      setPeriod('Jakso 1');
    } else {
      setPeriod('Jakso 2');
    }

    // Load any previously saved calendar data from localStorage.
    const storedData = localStorage.getItem('calendarData');
    if (storedData) {
      setData(JSON.parse(storedData));
    }
  }, []);

  useEffect(() => {
    // Save data to localStorage whenever it changes.
    localStorage.setItem('calendarData', JSON.stringify(data));
  }, [data]);

  const onChange: CalendarProps['onChange'] = (value) => {
    if (value instanceof Date) {
      setDate(value);
    } else if (Array.isArray(value) && value.length > 0 && value[0] instanceof Date) {
      setDate(value[0]);
    } else {
      console.log('Invalid or no date selected');
    }
  };

  // Helper function to compute effective hours based on hours and overtime.
  const effectiveHoursForDate = (entry: DateData): number => {
    if (entry.hours <= 8) {
      return entry.hours - 0.75;
    } else {
      if (entry.overtime) {
        // With overtime on, only one break is deducted.
        return entry.hours - 0.75;
      } else {
        // With overtime off, deduct one break per (full or partial) 8-hour block.
        const breaks = Math.ceil(entry.hours / 8);
        return entry.hours - 0.75 * breaks;
      }
    }
  };

  // Compute the performance percentage for a given date's data.
  const computePerformancePercentage = (entry: DateData): number => {
    const effective = effectiveHoursForDate(entry);
    // To avoid division by zero.
    if (effective <= 0) return 0;
    return Math.round((entry.performance / effective) * 100);
  };

  // Modal form handlers.
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const { performance, hours, overtime } = formData;
    const parsedPerformance = parseFloat(performance);
    const parsedHours = parseFloat(hours);

    if (isNaN(parsedPerformance)) {
      alert("Please enter a valid number for performance.");
      return;
    }
    if (isNaN(parsedHours) || parsedHours < 4 || parsedHours > 16) {
      alert("Please enter a valid number for hours (4-16).");
      return;
    }

    const dateString = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
      date.getDate()
    ).padStart(2, '0')}`;
    setData(prevData => ({
      ...prevData,
      [dateString]: { performance: parsedPerformance, hours: parsedHours, overtime }
    }));
    setShowModal(false);
    // Reset the form.
    setFormData({
      performance: '',
      hours: '8',
      overtime: false,
    });
  };

  const handleDeleteData = () => {
    const dateString = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
      date.getDate()
    ).padStart(2, '0')}`;
    setData(prevData => {
      const newData = { ...prevData };
      delete newData[dateString];
      return newData;
    });
  };

  const formatDate = (dateString: string) => {
    const [year, month, day] = dateString.split('-');
    return `${day}.${month}.${year}`;
  };

  // Restrict the calendar to show dates in the current period.
  const filterDates = (date: Date) => {
    const day = date.getDate();
    if (period === 'Jakso 1') {
      return day >= 1 && day <= 15;
    } else {
      return day >= 16;
    }
  };

  // A simple average calculation for logged performance values.
  const calculateAverage = () => {
    const filteredDates = Object.keys(data).filter((dateString) => {
      const dateObj = new Date(dateString + 'T00:00:00');
      return filterDates(dateObj);
    });

    const total = filteredDates.reduce((sum, dateString) => sum + data[dateString].performance, 0);
    const average = filteredDates.length > 0 ? total / filteredDates.length : 0;
    return average.toFixed(2);
  };

  // Retain the existing percentage function for display elsewhere.
  const calculatePercentage = (value: number) => {
    const percentage = ((value - 7.25) / (10.88 - 7.25)) * 50 + 100;
    return Math.round(percentage);
  };

  const average = parseFloat(calculateAverage());
  const averagePercentage = calculatePercentage(average);

  const selectedDateString = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
    date.getDate()
  ).padStart(2, '0')}`;
  const selectedDateData = data[selectedDateString];
  const selectedDatePercentage =
    selectedDateData !== undefined ? computePerformancePercentage(selectedDateData) : null;

  return (
    <div className="bg-primary min-h-screen text-gray-100 flex flex-col items-center p-4">
      <h2 className="text-2xl font-pmedium text-secondary mb-4">Paljoläjäs</h2>
      <div className="mb-4">
        <label className="mr-4">
          <input
            type="radio"
            name="period"
            value="Jakso 1"
            checked={period === 'Jakso 1'}
            onChange={() => setPeriod('Jakso 1')}
          />
          Jakso 1
        </label>
        <label>
          <input
            type="radio"
            name="period"
            value="Jakso 2"
            checked={period === 'Jakso 2'}
            onChange={() => setPeriod('Jakso 2')}
          />
          Jakso 2
          <Multiplier/>
        </label>
      </div>
      <div className="bg-primary p-4 rounded-lg shadow-lg calendar-container">
        <Calendar
          onChange={onChange}
          value={date}
          locale="fi-FI"
          tileDisabled={({ date, view }) => view === 'month' && !filterDates(date)}
          tileContent={({ date, view }) => {
            const dateString = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
              date.getDate()
            ).padStart(2, '0')}`;
            if (view === 'month' && data[dateString]) {
              // Only display the performance percentage on the tile.
              const entry = data[dateString];
              const percentage = computePerformancePercentage(entry);
              return (
                <div style={{ color: 'red', fontSize: '12px' }}>
                  {percentage}%
                </div>
              );
            }
            return null;
          }}
          tileClassName={({ date, view }) => {
            const dateString = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
              date.getDate()
            ).padStart(2, '0')}`;
            return data[dateString] ? 'highlight' : '';
          }}
        />
      </div>
      <div className="flex space-x-4 mt-4">
        <button onClick={() => setShowModal(true)} className="bg-secondary text-white px-4 py-2 rounded">
          Lisää suorite
        </button>
        <button onClick={handleDeleteData} className="bg-red-600 text-white px-4 py-2 rounded">
          Poista suorite
        </button>
      </div>
      {selectedDateData !== undefined && (
        <div className="mt-4 p-4 bg-gray-800 text-white rounded shadow-lg">
          <h3 className="text-lg font-bold">{formatDate(selectedDateString)}</h3>
          <p>
            Suorite: {selectedDateData.performance} ({selectedDatePercentage}%)
          </p>
          <p>
            Työtunnit: {selectedDateData.hours} ({selectedDateData.overtime ? 'ylityö' : 'normaali'})
          </p>
        </div>
      )}
      
      <Tavoite data={data} period={period} />

      {/* Modal for entering performance data */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded shadow-lg w-80">
            <h3 className="text-xl font-bold mb-4">Lisää suorite</h3>
            <form onSubmit={handleFormSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Suorite:</label>
                <input
                  type="number"
                  name="performance"
                  value={formData.performance}
                  onChange={handleFormChange}
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
                  onChange={handleFormChange}
                  className="mt-1 block w-full border-gray-300 rounded-md"
                  step="1"
                  min="4"
                  max="16"
                  required
                />
              </div>
              <div className="mb-4 flex items-center">
                <label className="block text-sm font-medium text-gray-700 mr-2">Ylitöitä:</label>
                <input
                  type="checkbox"
                  name="overtime"
                  checked={formData.overtime}
                  onChange={handleFormChange}
                  className="h-4 w-4"
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
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
      )}

    </div>
  );
};

export default App;

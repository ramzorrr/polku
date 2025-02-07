
import DailyPerformance from './DailyPerformance';
import DirectToGoal from './DirectToGoal';
import RemainingWorkdays from './RemainingWorkdays';
import { DateData, effectiveHours, computePerformancePercentage, calculateAverage, calculatePercentage } from './utils';

import React, { useState, useEffect } from 'react';
import Calendar, { CalendarProps } from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './tailwind.css';
import './customCalendar.css';
import Tavoite from './Tavoite';
import Multiplier from './Multiplier';
import PerformanceModal from './PerformanceModal';
import 'react-time-picker/dist/TimePicker.css';
import 'react-clock/dist/Clock.css';

const App = () => {
  // Data maps date strings to DateData objects.
  const [date, setDate] = useState(new Date());
  const [data, setData] = useState<{ [key: string]: DateData }>({});
  const [period, setPeriod] = useState('');
  const [showModal, setShowModal] = useState(false);

  // Auto-detected shift stored here:
  const [autoShift, setAutoShift] = useState<'morning' | 'evening' | 'night'>('morning');

  // Form state for the modal.
  const [formData, setFormData] = useState({
    performance: '',
    hours: '8.00',
    overtime: false,
    freeDay: false,
    startTime: '',
    endTime: '',
  });

  // Helper function to detect ongoing shift based on current local time.
  function getOngoingShift(): 'morning' | 'evening' | 'night' {
    const now = new Date();
    const hr = now.getHours();
    const min = now.getMinutes();
    const totalMins = hr * 60 + min;
    const timeToMins = (h: number, m: number) => h * 60 + m;
    const morningStart = timeToMins(5, 45);
    const morningEnd   = timeToMins(14, 15);
    const eveningStart = timeToMins(13, 45);
    const eveningEnd   = timeToMins(22, 15);
    const inRange = (t: number, start: number, end: number) => t >= start && t < end;
    if (inRange(totalMins, morningStart, morningEnd)) return 'morning';
    if (inRange(totalMins, eveningStart, eveningEnd)) return 'evening';
    return 'night';
  }

  // When "Lisää suorite" is clicked, auto-detect the shift and show the modal.
  const handleAddSuorite = () => {
    const shiftNow = getOngoingShift();
    setAutoShift(shiftNow);
    setShowModal(true);
  };

  useEffect(() => {
    // Set period based on current day.
    const currentDay = new Date().getDate();
    setPeriod(currentDay >= 1 && currentDay <= 15 ? 'Jakso 1' : 'Jakso 2');

    // Load stored calendar data.
    const storedData = localStorage.getItem('calendarData');
    if (storedData) {
      setData(JSON.parse(storedData));
    }
  }, []);

  useEffect(() => {
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

  // Modal form handlers.
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const { performance, hours, overtime, freeDay } = formData;
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
    const dateString = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    setData((prevData) => ({
      ...prevData,
      [dateString]: { 
        performance: parsedPerformance, 
        hours: parsedHours, 
        overtime, 
        freeDay
      }
    }));
    setShowModal(false);
    setFormData({
      performance: '',
      hours: '8.00',
      overtime: false,
      freeDay: false,
      startTime: '',
      endTime: '',
    });
  };

  const handleDeleteData = () => {
    const dateString = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    setData((prevData) => {
      const newData = { ...prevData };
      delete newData[dateString];
      return newData;
    });
  };

  const formatDate = (dateString: string): string => {
    const [year, month, day] = dateString.split('-');
    return `${day}.${month}.${year}`;
  };

  const filterDates = (d: Date): boolean => {
    const day = d.getDate();
    return period === 'Jakso 1' ? day >= 1 && day <= 15 : day >= 16;
  };

  // Use the imported calculateAverage and calculatePercentage functions.
  const average = parseFloat(calculateAverage(data, filterDates));
  const averagePercentage = calculatePercentage(average);

  const selectedDateString = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  const selectedDateData = data[selectedDateString];
  const selectedDatePercentage = selectedDateData ? computePerformancePercentage(selectedDateData) : null;

  return (
    <div className="bg-primary min-h-screen text-gray-100 flex flex-col items-center p-4">
      <h2 className="text-2xl font-pmedium text-secondary mb-4">"Paljoläjäs?!"</h2>
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
          <Multiplier />
        </label>
      </div>
      <div className="bg-primary p-4 rounded-lg shadow-lg calendar-container">
        <Calendar
          onChange={onChange}
          value={date}
          locale="fi-FI"
          tileDisabled={({ date, view }) => view === 'month' && !filterDates(date)}
          tileContent={({ date, view }) => {
            const dateString = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
            if (view === 'month' && data[dateString]) {
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
            const dateString = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
            return data[dateString] ? 'highlight' : '';
          }}
        />
      </div>
      <div className="flex space-x-4 mt-4">
        <button onClick={() => handleAddSuorite()} className="bg-secondary text-white px-4 py-2 rounded">
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
            Työtunnit: {selectedDateData.hours} (
            {selectedDateData.freeDay
              ? 'ylityö vapaapäivänä'
              : selectedDateData.overtime
              ? 'ylityö'
              : 'normaali'}
            )
          </p>
        </div>
      )}

      <div className="mt-4 p-4 bg-gray-800 text-white rounded shadow-lg">
        <h3 className="text-lg font-bold">Jakson keskisuorite</h3>
        <p>
          {average} ({averagePercentage}%)
        </p>
      </div>

      <Tavoite data={data} period={period} />

      {showModal && (
        <PerformanceModal
          formData={formData}
          onFormChange={handleFormChange}
          onSubmit={handleFormSubmit}
          onClose={() => setShowModal(false)}
          defaultShift={autoShift}
        />
      )}
    </div>
  );
};

export default App;

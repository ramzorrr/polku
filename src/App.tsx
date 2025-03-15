import { DateData, computePerformancePercentage, calculateAverage, calculatePercentage } from './utils';
import React, { useState, useEffect } from 'react';
import Calendar, { CalendarProps } from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './tailwind.css';
import './customCalendar.css';
import Tavoite from './Tavoite';
import Multiplier from './Multiplier';
import MeatCalculator from './MeatCalculator';
import PerformanceModal from './PerformanceModal';
import localforage from 'localforage';

const App = () => {
  // Data maps date strings to DateData objects.
  const [date, setDate] = useState(new Date());
  const [data, setData] = useState<{ [key: string]: DateData }>({});
  const [period, setPeriod] = useState('');
  const [showModal, setShowModal] = useState(false);

  // Auto-detected shift stored here.
  const [autoShift, setAutoShift] = useState<'morning' | 'evening' | 'night'>('morning');

  // Form state for the modal.
  const [formData, setFormData] = useState({
    performance: '',
    hours: '8',
    overtime: false,
    freeDay: false,
    startTime: '',
    endTime: '',
  });

  // Helper to detect ongoing shift based on current local time.
  function getOngoingShift(): 'morning' | 'evening' | 'night' {
    const now = new Date();
    const hr = now.getHours();
    const min = now.getMinutes();
    const totalMins = hr * 60 + min;
    const timeToMins = (h: number, m: number) => h * 60 + m;
    const morningStart = timeToMins(5, 45);
    const morningEnd = timeToMins(14, 15);
    const eveningStart = timeToMins(13, 45);
    const eveningEnd = timeToMins(22, 15);
    const inRange = (t: number, start: number, end: number) => t >= start && t < end;
    if (inRange(totalMins, morningStart, morningEnd)) return 'morning';
    if (inRange(totalMins, eveningStart, eveningEnd)) return 'evening';
    return 'night';
  }

  function getPeriodForDate(d: Date) {
    const day = d.getDate();
    return day >= 1 && day <= 15 ? 'Jakso 1' : 'Jakso 2';
  }

  // When "Lisää suorite" is clicked, auto-detect the shift and show the modal.
  const handleAddSuorite = () => {
    const shiftNow = getOngoingShift();
    setAutoShift(shiftNow);
    setShowModal(true);
  };

  useEffect(() => {
    // Load stored calendar data asynchronously.
    localforage
      .getItem('calendarData')
      .then((storedData) => {
        if (storedData) {
          setData(storedData as { [key: string]: DateData });
        }
      })
      .catch((err) => console.error('Error retrieving calendarData:', err));
  }, [date]);

  useEffect(() => {
    // Save calendar data asynchronously whenever 'data' changes.
    localforage.setItem('calendarData', data).catch((err) =>
      console.error('Error saving calendarData:', err)
    );
  }, [data]);

  useEffect(() => {
    setPeriod(getPeriodForDate(date));
  }, [date]);

  const onChange: CalendarProps['onChange'] = (value) => {
    let newDate: Date | null = null;
    if (value instanceof Date) {
      newDate = value;
    } else if (Array.isArray(value) && value.length > 0 && value[0] instanceof Date) {
      newDate = value[0];
    }
    if (newDate) {
      setDate(newDate);
      const day = newDate.getDate();
      setPeriod(day >= 1 && day <= 15 ? 'Jakso 1' : 'Jakso 2');
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
      alert("Lisää suorite esim. 7.25");
      return;
    }
    if (isNaN(parsedHours) || parsedHours < 0 || parsedHours > 16) {
      alert("Lisää aika väliltä 0-16");
      return;
    }
    const dateString = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
      date.getDate()
    ).padStart(2, '0')}`;
    setData((prevData) => ({
      ...prevData,
      [dateString]: {
        performance: parsedPerformance,
        hours: parsedHours,
        overtime,
        freeDay,
      },
    }));
    setShowModal(false);
    setFormData({
      performance: '',
      hours: '8',
      overtime: false,
      freeDay: false,
      startTime: '',
      endTime: '',
    });
  };

  const handleDeleteData = () => {
    const dateString = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
      date.getDate()
    ).padStart(2, '0')}`;
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

  // In this version, we do not disable any dates.
  const filterDates = (d: Date): boolean => {
    // This function is still used for calculating averages.
    const day = d.getDate();
    return period === 'Jakso 1' ? day >= 1 && day <= 15 : day >= 16;
  };

  // Use the imported calculateAverage and calculatePercentage functions.
  const overallAverage = parseFloat(calculateAverage(data, filterDates));
  const overallAveragePercentage = calculatePercentage(overallAverage);

  const selectedDateString = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
    date.getDate()
  ).padStart(2, '0')}`;
  const selectedDateData = data[selectedDateString];
  const selectedDatePercentage = selectedDateData ? computePerformancePercentage(selectedDateData) : null;

  return (
    <div className="bg-primary min-h-screen text-gray-100 flex flex-col items-center p-4">
      <h2 className="text-secondary text-2xl font-bold mb-2">Suoritelaskuri</h2>
      
      {/* Calendar – All dates are now clickable */}
      <div className="bg-primary p-4 rounded-lg shadow-lg calendar-container">
        <Calendar
          onChange={onChange}
          value={date}
          locale="fi-FI"
          tileContent={({ date: tileDate, view }) => {
            const dateString = `${tileDate.getFullYear()}-${String(tileDate.getMonth() + 1).padStart(2, '0')}-${String(
              tileDate.getDate()
            ).padStart(2, '0')}`;
            if (view === 'month' && data[dateString]) {
              const entry = data[dateString];
              const percentage = computePerformancePercentage(entry);
              return (
                <div style={{ color: 'black', fontSize: '12px' }}>
                  {percentage}%
                </div>
              );
            }
            return null;
          }}
          tileClassName={({ date: tileDate, view }) => {
            if (view !== 'month') return '';
            const classes: string[] = [];
            // If the tile date matches the selected date, mark it as selected.
            if (tileDate.toDateString() === date.toDateString()) {
              classes.push('selected-tile');
            } else if (filterDates(tileDate)) {
              // Otherwise, if it's in the current period, add the current period class.
              classes.push('currentPeriod');
            }
            // Also add a highlight if there is data for this tile.
            const dateString = `${tileDate.getFullYear()}-${String(tileDate.getMonth() + 1).padStart(2, '0')}-${String(
              tileDate.getDate()
            ).padStart(2, '0')}`;
            if (data[dateString]) {
              classes.push('highlight');
            }
            return classes.join(' ');
          }}
        />
      </div>
      <div className="flex space-x-4 mt-4">
        <button onClick={handleAddSuorite} className="bg-secondary text-white px-4 py-2 rounded">
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
            Työpäivän pituus: {selectedDateData.hours} (
            {selectedDateData.freeDay
              ? 'ylityö'
              : selectedDateData.overtime 
              ? 'ylityö'
              : 'normaali'}
            )
          </p>
        </div>
      )}

      <Tavoite data={data} period={period} selectedDate={date} />

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

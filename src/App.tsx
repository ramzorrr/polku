import React, { useState, useEffect } from 'react';
import Calendar, { CalendarProps } from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './tailwind.css';
import './customCalendar.css';
import Tavoite from './Tavoite';

const App = () => {
  const [date, setDate] = useState(new Date());
  const [data, setData] = useState<{ [key: string]: number }>({});
  const [period, setPeriod] = useState('');

  useEffect(() => {
    const currentDay = new Date().getDate();
    if (currentDay >= 1 && currentDay <= 15) {
      setPeriod('Jakso 1');
    } else {
      setPeriod('Jakso 2');
    }

    const storedData = localStorage.getItem('calendarData');
    if (storedData) {
      setData(JSON.parse(storedData));
    }
  }, []);

  useEffect(() => {
    if (Object.keys(data).length > 0) {
      localStorage.setItem('calendarData', JSON.stringify(data));
    }
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

  const handleAddData = () => {
    const dateString = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    const formattedDate = formatDate(dateString);

    const newData = prompt(`Lisää suorite ${formattedDate}`);
    if (newData) {
      const parsedData = parseFloat(newData);
      if (!isNaN(parsedData)) {
        setData((prevData) => {
          const updatedData = { ...prevData, [dateString]: parsedData };
          localStorage.setItem('calendarData', JSON.stringify(updatedData));
          return updatedData;
        });
      } else {
        alert('Please enter a valid number.');
      }
    }
  };

  const handleDeleteData = () => {
    const dateString = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    setData((prevData) => {
      const newData = { ...prevData };
      delete newData[dateString];
      localStorage.setItem('calendarData', JSON.stringify(newData));
      return newData;
    });
  };

  const formatDate = (dateString: string) => {
    const [year, month, day] = dateString.split('-');
    return `${day}.${month}.${year}`;
  };

  const filterDates = (date: Date) => {
    const day = date.getDate();
    if (period === 'Jakso 1') {
      return day >= 1 && day <= 15;
    } else {
      return day >= 16;
    }
  };

  const calculateAverage = () => {
    const filteredDates = Object.keys(data).filter((dateString) => {
      const date = new Date(dateString + "T00:00:00");
      return filterDates(date);
    });

    const total = filteredDates.reduce((sum, dateString) => sum + data[dateString], 0);
    const average = filteredDates.length > 0 ? total / filteredDates.length : 0;

    return average.toFixed(2);
  };

  const calculatePercentage = (value: number) => {
    const percentage = ((value - 7.25) / (10.88 - 7.25)) * 50 + 100;
    return Math.round(percentage);
  };

  const average = parseFloat(calculateAverage());
  const averagePercentage = calculatePercentage(average);

  const selectedDateString = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  const selectedDateData = data[selectedDateString];
  const selectedDatePercentage = selectedDateData !== undefined ? calculatePercentage(selectedDateData) : null;

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
            return view === 'month' && data[dateString] ? (
              <div style={{ color: 'red', fontSize: '12px' }}>{data[dateString]}</div>
            ) : null;
          }}
          tileClassName={({ date, view }) => {
            const dateString = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
            if (data[dateString]) {
              return 'highlight';
            }
            return '';
          }}
        />
      </div>
      <div className="flex space-x-4 mt-4">
        <button
          onClick={handleAddData}
          className="bg-secondary text-white px-4 py-2 rounded"
        >
          Lisää suorite
        </button>
        <button
          onClick={handleDeleteData}
          className="bg-red-600 text-white px-4 py-2 rounded"
        >
          Poista suorite
        </button>
      </div>
      {selectedDateData !== undefined && (
        <div className="mt-4 p-4 bg-gray-800 text-white rounded shadow-lg">
          <h3 className="text-lg font-bold">{formatDate(selectedDateString)}</h3>
          <p>Suorite: {selectedDateData} ({selectedDatePercentage}%)</p>
        </div>
      )}
      <div className="mt-4 p-4 bg-gray-800 text-white rounded shadow-lg">
        <h3 className="text-lg font-bold">Jakson keskisuorite</h3>
        <p>{average} ({averagePercentage}%)</p>
      </div>
      <Tavoite data={data} period={period} />
    </div>
  );
};

export default App;

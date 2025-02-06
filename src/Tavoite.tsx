import React, { useState, useEffect } from 'react';
import DailyPerformance from './DailyPerformance';
import DirectToGoal from './DirectToGoal';
import RemainingWorkdays from './RemainingWorkdays';
import { DateData, effectiveHours, computePerformancePercentage } from './utils';

const Tavoite = ({
  data,
  period,
}: {
  data: { [key: string]: DateData };
  period: string;
}) => {
  // Goal is a percentage.
  const [goal, setGoal] = useState(100); // default value
  const [savedGoal, setSavedGoal] = useState<number | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  // For days with no data, assume a default 8‑hour day:
  // Normal: effective = 8 − 0.75 = 7.25  
  // Free day: effective = 8 − 0.25 = 7.75
  const defaultHours = 8;
  const defaultEffectiveNormal = 7.25;
  const defaultEffectiveFreeDay = 7.75;
  const defaultEffective = defaultEffectiveNormal;

  // On mount, load saved goal from localStorage and update slider.
  useEffect(() => {
    const storedGoal = localStorage.getItem('savedGoal');
    if (storedGoal) {
      const parsedGoal = parseFloat(storedGoal);
      setSavedGoal(parsedGoal);
      setGoal(parsedGoal);
    }
  }, []);

  const handleSliderChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setGoal(parseFloat(event.target.value));
  };

  const handleSaveGoal = () => {
    localStorage.setItem('savedGoal', goal.toString());
    setSavedGoal(goal);
    setMessage('Tavoite tallennettu');
    setTimeout(() => setMessage(null), 3000);
  };

  // (The effectiveHours and computePerformancePercentage functions are now imported from utils.)

  // Modal form state now includes the new "freeDay" toggle.
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    performance: '',
    hours: '8',
    overtime: false,
    freeDay: false,
  });

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
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

    const dateString = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}`;
    // Here, we assume that the parent component is responsible for updating the data.
    // For demonstration, this update is commented out.
    // setData(prevData => ({
    //   ...prevData,
    //   [dateString]: { performance: parsedPerformance, hours: parsedHours, overtime, freeDay },
    // }));
    setShowModal(false);
    setFormData({
      performance: '',
      hours: '8',
      overtime: false,
      freeDay: false,
    });
  };

  // (handleDeleteData, formatDate, filterDates, calculateAverage, and calculatePercentage remain unchanged.)

  const handleDeleteData = () => {
    const dateString = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}`;
    // setData update here...
  };

  const formatDate = (dateString: string): string => {
    const [year, month, day] = dateString.split('-');
    return `${day}.${month}.${year}`;
  };

  const filterDates = (date: Date): boolean => {
    const day = date.getDate();
    return period === 'Jakso 1' ? day >= 1 && day <= 15 : day >= 16;
  };

  const calculateAverage = (): string => {
    const filteredDates = Object.keys(data).filter((dateString) => {
      const dateObj = new Date(dateString + 'T00:00:00');
      return filterDates(dateObj);
    });
    const total = filteredDates.reduce((sum, dateString) => sum + data[dateString].performance, 0);
    const average = filteredDates.length > 0 ? total / filteredDates.length : 0;
    return average.toFixed(2);
  };

  const calculatePercentage = (value: number): number => {
    const percentage = ((value - 7.25) / (10.88 - 7.25)) * 50 + 100;
    return Math.round(percentage);
  };

  const average = parseFloat(calculateAverage());
  const averagePercentage = calculatePercentage(average);

  const selectedDateString = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}`;
  const selectedDateData = data[selectedDateString];
  const selectedDatePercentage = selectedDateData ? computePerformancePercentage(selectedDateData) : null;

  // Remaining data calculations...
  const calculateRemainingData = () => {
    if (savedGoal === null) return null;
    const today = new Date();
    const fullYear = today.getFullYear();
    const month = today.getMonth();
    const dayToday = today.getDate();
    const periodStartDay = period === 'Jakso 1' ? 1 : 16;
    const periodEndDay = period === 'Jakso 1' ? 15 : new Date(fullYear, month + 1, 0).getDate();
    let totalEffectiveLogged = 0;
    let totalPerformanceLogged = 0;
    let loggedDays = 0;
    Object.keys(data).forEach((dateString) => {
      const dObj = new Date(dateString);
      if (dObj.getFullYear() === fullYear && dObj.getMonth() === month) {
        const d = dObj.getDate();
        if (d >= periodStartDay && d <= periodEndDay) {
          const entry = data[dateString];
          const eff = effectiveHours(entry.hours, entry.overtime, entry.freeDay);
          totalEffectiveLogged += eff;
          totalPerformanceLogged += entry.performance;
          loggedDays++;
        }
      }
    });
    let missingDays = 0;
    for (let d = dayToday; d <= periodEndDay; d++) {
      const currDate = new Date(fullYear, month, d);
      if (currDate.getDay() !== 0 && currDate.getDay() !== 6) {
        const dateStr = `${fullYear}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        if (!(dateStr in data)) {
          missingDays++;
        }
      }
    }
    const totalEffectivePeriod = totalEffectiveLogged + missingDays * defaultEffective;
    const targetTotalPerformance = totalEffectivePeriod * (savedGoal / 100);
    const remainingRequired = targetTotalPerformance - totalPerformanceLogged;
    const dailyRequiredAbsolute = missingDays > 0 ? remainingRequired / missingDays : 0;
    const dailyRequiredPercentage = defaultEffective > 0 ? (dailyRequiredAbsolute / defaultEffective) * 100 : 0;
    const currentAveragePercentage = totalEffectiveLogged > 0 ? (totalPerformanceLogged / totalEffectiveLogged) * 100 : 0;
    const instantlyToGoalAbsolute =
      totalEffectiveLogged + defaultEffective > 0
        ? (savedGoal / 100) * (totalEffectiveLogged + defaultEffective) - totalPerformanceLogged
        : 0;
    const instantlyToGoalPercentage = defaultEffective > 0 ? (instantlyToGoalAbsolute / defaultEffective) * 100 : 0;
    return {
      dailyRequiredAbsolute: dailyRequiredAbsolute.toFixed(2),
      dailyRequiredPercentage: dailyRequiredPercentage.toFixed(0),
      currentAveragePercentage: currentAveragePercentage.toFixed(0),
      missingDays,
      instantlyToGoalAbsolute: instantlyToGoalAbsolute.toFixed(2),
      instantlyToGoalPercentage: instantlyToGoalPercentage.toFixed(0),
    };
  };

  const remainingData = calculateRemainingData();

  return (
    <div className="flex flex-col items-center p-4">
      <div className="mt-4">
        <p className="text-lg font-bold">Tavoite: {goal}%</p>
      </div>
      <input
        type="range"
        min="100"
        max="150"
        step="1"
        value={goal}
        onChange={handleSliderChange}
        className="w-full"
      />
      <button onClick={handleSaveGoal} className="bg-secondary text-white px-4 py-2 mt-4 rounded">
        Aseta Tavoite
      </button>
      {message && (
        <div className="mt-4 p-2 bg-green-500 text-white rounded">
          {message}
        </div>
      )}
      {savedGoal !== null && remainingData && (
        <div className="mt-4 grid grid-cols-1 gap-4">
          <div className="p-4 bg-pink-500 text-white rounded shadow-lg">
            <h3 className="text-lg font-bold">Jakson keskisuorite</h3>
            <p>{remainingData.currentAveragePercentage}%</p>
          </div>
          <DailyPerformance
            value={remainingData.dailyRequiredAbsolute}
            percentage={parseInt(remainingData.dailyRequiredPercentage)}
            label="Päivittäinen suorite"
          />
          <DirectToGoal
            value={remainingData.instantlyToGoalAbsolute}
            percentage={parseInt(remainingData.instantlyToGoalPercentage)}
            label="Suoraan tavoitteeseen"
          />
          <RemainingWorkdays days={remainingData.missingDays} />
        </div>
      )}
      
    </div>
  );
};

export default Tavoite;

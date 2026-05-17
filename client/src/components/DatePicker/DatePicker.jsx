import React, { useState, useRef, useEffect } from 'react';
import { HiOutlineCalendar } from 'react-icons/hi';
import styles from './DatePicker.module.css';

const DAYS_OF_WEEK = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
const MONTHS = [
  'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
  'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь',
];

const DatePicker = ({ selectedDate, onDateChange }) => {
  const [showCalendar, setShowCalendar] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const calendarRef = useRef(null);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Нормализуем selectedDate к объекту Date (может быть строка)
  const safeDate = selectedDate ? new Date(selectedDate) : null;

  // 5 ближайших дней
  const getNearbyDays = () => {
    const days = [];
    for (let i = 0; i < 5; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      days.push(date);
    }
    return days;
  };

  const getDaysInMonth = (month, year) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const handleDateClick = (day) => {
    const date = new Date(currentYear, currentMonth, day);
    onDateChange(date);
    setShowCalendar(false);
  };

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
  };

  const renderDaysGrid = () => {
    const daysInMonth = getDaysInMonth(currentMonth, currentYear);
    const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay() || 7;
    const cells = [];

    for (let i = 1; i < firstDayOfWeek; i++) {
      cells.push(<div key={`empty-${i}`} className={styles.calendarCell} />);
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(currentYear, currentMonth, d);
      const isPast = date < today;
      const isSelected = safeDate && date.toDateString() === safeDate.toDateString();

      cells.push(
        <div
          key={d}
          className={`${styles.calendarCell} ${isPast ? styles.past : ''} ${isSelected ? styles.selected : ''}`}
          onClick={() => !isPast && handleDateClick(d)}
        >
          {d}
        </div>
      );
    }

    return cells;
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (calendarRef.current && !calendarRef.current.contains(e.target)) {
        setShowCalendar(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={styles.wrapper}>
      <div className={styles.daysRow}>
        {getNearbyDays().map((date, index) => {
          const isActive = safeDate && date.toDateString() === safeDate.toDateString();
          return (
            <div
              key={index}
              className={`${styles.dayBlock} ${isActive ? styles.active : ''}`}
              onClick={() => onDateChange(date)}
            >
              <span className={styles.weekday}>
                {DAYS_OF_WEEK[date.getDay() === 0 ? 6 : date.getDay() - 1]}
              </span>
              <span className={styles.dayNumber}>{date.getDate()}</span>
            </div>
          );
        })}

        <div
          className={styles.calendarBlock}
          onClick={() => setShowCalendar(!showCalendar)}
        >
          <HiOutlineCalendar size={80} color="var(--accent)" />
        </div>
      </div>

      {showCalendar && (
        <div className={styles.calendarDropdown} ref={calendarRef}>
          <div className={styles.calendarHeader}>
            <button className={styles.navBtn} onClick={handlePrevMonth}>‹</button>
            <span className={styles.monthTitle}>
              {MONTHS[currentMonth]} {currentYear}
            </span>
            <button className={styles.navBtn} onClick={handleNextMonth}>›</button>
          </div>
          <div className={styles.calendarWeekdays}>
            {DAYS_OF_WEEK.map(day => (
              <div key={day} className={styles.weekdayLabel}>{day}</div>
            ))}
          </div>
          <div className={styles.calendarGrid}>
            {renderDaysGrid()}
          </div>
        </div>
      )}
    </div>
  );
};

export default DatePicker;
import React, { useRef, useEffect, useState } from 'react';
import styles from './TimeWheel.module.css';

const ITEM_HEIGHT = 48;

const TimeWheel = ({ label, value, onChange }) => {
  const hoursListRef = useRef(null);
  const minutesListRef = useRef(null);
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);

  const HOURS = Array.from({ length: 24 }, (_, i) => i);
  const MINUTES = Array.from({ length: 60 }, (_, i) => i);

  // Синхронизация с внешним значением
  useEffect(() => {
    if (typeof value === 'string' && value.includes(':')) {
      const [h, m] = value.split(':').map(Number);
      if (!isNaN(h)) setHours(h);
      if (!isNaN(m)) setMinutes(m);
    }
  }, [value]);

  // Плавный скролл к выбранному элементу
  useEffect(() => {
    if (hoursListRef.current) {
      hoursListRef.current.scrollTo({
        top: hours * ITEM_HEIGHT,
        behavior: 'smooth',
      });
    }
  }, [hours]);

  useEffect(() => {
    if (minutesListRef.current) {
      minutesListRef.current.scrollTo({
        top: minutes * ITEM_HEIGHT,
        behavior: 'smooth',
      });
    }
  }, [minutes]);

  // Обработчик клика
  const handleClick = (type, val) => {
    if (type === 'hours') {
      setHours(val);
      onChange(`${String(val).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`);
    } else {
      setMinutes(val);
      onChange(`${String(hours).padStart(2, '0')}:${String(val).padStart(2, '0')}`);
    }
  };

  return (
    <div className={styles.wrapper}>
      {label && <div className={styles.label}>{label}</div>}
      <div className={styles.wheels}>
        {/* Часы */}
        <div className={styles.column} ref={hoursListRef}>
          <div className={styles.spacer} />
          {HOURS.map(h => (
            <div
              key={h}
              className={`${styles.item} ${h === hours ? styles.active : ''}`}
              onClick={() => handleClick('hours', h)}
            >
              {String(h).padStart(2, '0')}
            </div>
          ))}
          <div className={styles.spacer} />
        </div>

        <div className={styles.separator}>:</div>

        {/* Минуты */}
        <div className={styles.column} ref={minutesListRef}>
          <div className={styles.spacer} />
          {MINUTES.map(m => (
            <div
              key={m}
              className={`${styles.item} ${m === minutes ? styles.active : ''}`}
              onClick={() => handleClick('minutes', m)}
            >
              {String(m).padStart(2, '0')}
            </div>
          ))}
          <div className={styles.spacer} />
        </div>
      </div>
    </div>
  );
};

export default TimeWheel;
import React, { useState, useEffect } from 'react';

const CountdownTimer = ({ startTime }) => {
  const [timeLeft, setTimeLeft] = useState(null);

  useEffect(() => {
    if (!startTime) {
      setTimeLeft(null);
      return;
    }

    const startDate = new Date(startTime);
    if (isNaN(startDate.getTime())) {
      setTimeLeft(null);
      return;
    }

    const endTime = new Date(startDate.getTime() + 15 * 60 * 1000);

    const update = () => {
      const diff = endTime - Date.now();
      if (diff <= 0) {
        setTimeLeft({ expired: true });
        return;
      }
      const hours = Math.floor(diff / 3600000);
      const minutes = Math.floor((diff % 3600000) / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      setTimeLeft({ hours, minutes, seconds, expired: false });
    };

    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, [startTime]);

  if (!startTime) {
    return <p style={{ color: '#ff6b6b' }}>Неверная дата брони</p>;
  }
  if (!timeLeft) {
    return <p style={{ color: 'var(--text)' }}>Загрузка...</p>;
  }
  if (timeLeft.expired) {
    return <p style={{ color: '#ff6b6b' }}>Время истекло</p>;
  }

  return (
    <p style={{ color: 'var(--accent)', fontWeight: 600, fontSize: '14px' }}>
      Осталось: {String(timeLeft.hours).padStart(2, '0')}:
      {String(timeLeft.minutes).padStart(2, '0')}:
      {String(timeLeft.seconds).padStart(2, '0')}
    </p>
  );
};

export default CountdownTimer;
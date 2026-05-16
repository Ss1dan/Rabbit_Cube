import React, { useState, useEffect } from 'react';

const CountdownTimer = ({ expiresAt }) => {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  function calculateTimeLeft() {
    const diff = new Date(expiresAt) - new Date();
    if (diff <= 0) return null;
    return {
      minutes: Math.floor(diff / 60000),
      seconds: Math.floor((diff % 60000) / 1000),
    };
  }

  useEffect(() => {
    const timer = setInterval(() => {
      const left = calculateTimeLeft();
      setTimeLeft(left);
      if (!left) clearInterval(timer);
    }, 1000);
    return () => clearInterval(timer);
  }, [expiresAt]);

  if (!timeLeft) return <p>Время активации истекло</p>;
  return (
    <p>
      Осталось: {timeLeft.minutes} мин {timeLeft.seconds} сек
    </p>
  );
};

export default CountdownTimer;
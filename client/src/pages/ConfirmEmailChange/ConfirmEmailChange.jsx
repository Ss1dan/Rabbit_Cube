import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import API from '../../api';

const ConfirmEmailChange = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Токен не найден');
      return;
    }
    API.post('/user/confirm-email-change', { token })
      .then(() => {
        setStatus('success');
        setMessage('Email изменён. Сейчас вы будете перенаправлены в профиль.');
        setTimeout(() => navigate('/profile'), 3000);
      })
      .catch(err => {
        setStatus('error');
        setMessage(err.response?.data?.message || 'Ошибка подтверждения');
      });
  }, [token, navigate]);

  return (
    <div style={{ textAlign: 'center', padding: '50px' }}>
      {status === 'loading' && <h2>Подтверждение...</h2>}
      {status === 'success' && <h2>{message}</h2>}
      {status === 'error' && <h2>Ошибка: {message}</h2>}
    </div>
  );
};

export default ConfirmEmailChange;
import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import API from '../../api';
import styles from '../Auth/Login/Login.module.css';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [repeatPassword, setRepeatPassword] = useState('');
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (password !== repeatPassword) {
      setError('Пароли не совпадают');
      return;
    }
    if (password.length < 4) {
      setError('Пароль должен быть не менее 4 символов');
      return;
    }
    try {
      await API.post('/auth/reset', { token, password });
      setDone(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Ошибка сброса пароля');
    }
  };

  if (!token) {
    return (
      <div className={styles.page}>
        <div className={styles.formBlock}>
          <h1 className={styles.title}>Ошибка</h1>
          <p>Неверная ссылка для сброса пароля.</p>
        </div>
      </div>
    );
  }

  if (done) {
    return (
      <div className={styles.page}>
        <div className={styles.formBlock}>
          <h1 className={styles.title}>Пароль изменён</h1>
          <p className={styles.subtitle}>Сейчас вы будете перенаправлены на страницу входа.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.formBlock}>
        <h1 className={styles.title}>Новый пароль</h1>
        <form onSubmit={handleSubmit}>
          <label className={styles.label}>Новый пароль</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className={styles.input}
            placeholder="Минимум 4 символа"
          />

          <label className={styles.label}>Повторите пароль</label>
          <input
            type="password"
            value={repeatPassword}
            onChange={(e) => setRepeatPassword(e.target.value)}
            required
            className={styles.input}
            placeholder="Повторите пароль"
          />

          <button type="submit" className={styles.submitBtn}>Сохранить</button>
          {error && <p className={styles.error}>{error}</p>}
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
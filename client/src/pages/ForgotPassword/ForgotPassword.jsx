import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../../api';
import styles from '../Auth/Login/Login.module.css'; // используем готовые стили

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await API.post('/auth/forgot', { email });
      setSent(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Ошибка отправки');
    }
  };

  if (sent) {
    return (
      <div className={styles.page}>
        <div className={styles.formBlock}>
          <h1 className={styles.title}>Проверьте почту</h1>
          <p className={styles.subtitle}>Если аккаунт с таким email существует, вы получите инструкцию по сбросу пароля.</p>
          <Link to="/login" className={styles.link}>Вернуться ко входу</Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.formBlock}>
        <h1 className={styles.title}>Восстановление пароля</h1>
        <form onSubmit={handleSubmit}>
          <label className={styles.label}>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className={styles.input}
            placeholder="Введите email, указанный при регистрации"
          />

          <button type="submit" className={styles.submitBtn}>Отправить</button>
          {error && <p className={styles.error}>{error}</p>}
        </form>
        <p className={styles.linkText}>
          <Link to="/login" className={styles.link}>Вернуться ко входу</Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;
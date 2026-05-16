import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { signin, clearError, googleAuth } from '../../../store/authSlice';
import { HiSun, HiMoon } from 'react-icons/hi';
import { GoogleLogin } from '@react-oauth/google';
import styles from './Login.module.css';
import { useTheme } from '../../../hooks/useTheme';

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuth, loading, error } = useSelector(state => state.auth);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    document.title = 'Rabbit Cube — Вход';
    if (isAuth) navigate('/profile');
  }, [isAuth, navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(signin({ email, password }));
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <img src="/media/logo.svg" alt="Rabbit Cube" className={styles.logoImg} />
        <span className={styles.logoText}>Rabbit Cube</span>
      </div>

      <div className={styles.formBlock}>
        <h1 className={styles.title}>Войти в аккаунт</h1>

        <form onSubmit={handleSubmit}>
          <label className={styles.label}>Почта</label>
          <input
            type="email"
            name="email"
            placeholder="Введите почту"
            value={email}
            onChange={(e) => { setEmail(e.target.value); if(error) dispatch(clearError()); }}
            required
            className={styles.input}
          />

          <label className={styles.label}>Пароль</label>
          <input
            type="password"
            name="password"
            placeholder="Введите пароль"
            value={password}
            onChange={(e) => { setPassword(e.target.value); if(error) dispatch(clearError()); }}
            required
            className={styles.input}
          />

          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? 'Загрузка...' : 'Авторизация'}
          </button>

          {error && <p className={styles.error} role="alert">{error}</p>}

          <p className={styles.forgot}>
            <Link to="/forgot" className={styles.forgotLink}>Забыли пароль?</Link>
          </p>
        </form>

        <div className={styles.themeToggle} onClick={toggleTheme}>
          {theme === 'dark' ? <HiMoon size={24} /> : <HiSun size={24} />}
        </div>
      </div>

      <div className={styles.or}>ИЛИ</div>

      <div className={styles.googleBtnWrapper}>
        <GoogleLogin
          onSuccess={credentialResponse => dispatch(googleAuth(credentialResponse.credential))}
          onError={() => alert('Ошибка входа через Google')}
        />
      </div>

      <p className={styles.linkText}>
        Нет аккаунта? <Link to="/register" className={styles.link}>Создать</Link>
      </p>
    </div>
  );
  
};

export default Login;
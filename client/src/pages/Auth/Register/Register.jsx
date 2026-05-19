import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { signup, clearError, googleAuth } from '../../../store/authSlice';
import { HiSun, HiMoon } from 'react-icons/hi';
import { GoogleLogin } from '@react-oauth/google';
import styles from './Register.module.css';
import { useTheme } from '../../../hooks/useTheme';

// Функция форматирования номера телефона
const formatPhone = (value) => {
  let digits = value.replace(/\D/g, ''); // оставляем только цифры
  if (digits.length > 11) digits = digits.slice(0, 11); // не больше 11 цифр
  
  let formatted = '+7';
  if (digits.length > 1) formatted += ' ' + digits.slice(1, 4);
  if (digits.length >= 5) formatted += ' ' + digits.slice(4, 7);
  if (digits.length >= 8) formatted += ' ' + digits.slice(7, 9);
  if (digits.length >= 10) formatted += ' ' + digits.slice(9, 11);
  
  return formatted;
};

const Register = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuth, loading, error } = useSelector(state => state.auth);

  // Редирект, если пользователь авторизован (например, после входа через Google)
  useEffect(() => {
    if (isAuth) {
      navigate('/profile');
    }
  }, [isAuth, navigate]);

  const [form, setForm] = useState({
    login: '',
    phone: '',
    email: '',
    password: '',
    repeatPassword: ''
  });
  const [theme, setTheme] = useState('dark'); // dark / light
  const [policyAccepted, setPolicyAccepted] = useState(false);
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) dispatch(clearError());
  };

  // Отдельный обработчик для телефона с форматированием
  const handlePhoneChange = (e) => {
    const formatted = formatPhone(e.target.value);
    setForm({ ...form, phone: formatted });
    if (error) dispatch(clearError());
  };

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
    document.documentElement.classList.toggle('light-theme');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.repeatPassword) {
      alert('Пароли не совпадают');
      return;
    }
    if (!policyAccepted) {
      alert('Примите условия политики конфиденциальности');
      return;
    }
    if (!emailRegex.test(form.email)) {
      alert('Введите корректный email');
      return;
    }
    const phoneRegex = /^\+7 \d{3} \d{3} \d{2} \d{2}$/;
    if (!phoneRegex.test(form.phone)) {
      alert('Введите корректный номер телефона (+7 XXX XXX XX XX)');
      return;
    }
  
    try {
      const result = await dispatch(signup({
        login: form.login,
        email: form.email,
        phone: form.phone,
        password: form.password,
        roles: ['User'],
      }));
      if (result.meta.requestStatus === 'fulfilled') {
        const link = result.payload.confirmationLink;
        window.prompt('Скопируйте ссылку для подтверждения аккаунта:', link);
        navigate('/login');
      } else {
        alert(result.payload?.message || 'Ошибка регистрации');
      }
    } catch (err) {
      alert('Ошибка сети или сервера');
    }
  };
  useEffect(() => { document.title = 'Rabbit Cube — Регистрация'; }, []);
  return (
    <div className={styles.page}>
      {/* Шапка  */}
      <div className={styles.header}>
        <img src="/media/logo.svg" alt="Rabbit Cube" className={styles.logoImg} />
        <span className={styles.logoText}>Rabbit Cube</span>
      </div>

      {/* Блок формы */}
      <div className={styles.formBlock}>
        <h1 className={styles.title}>Создать аккаунт</h1>
        <p className={styles.subtitle}>После регистрации подтверди аккаунт в почте</p>

        <form onSubmit={handleSubmit}>
          <label className={styles.label}>Логин</label>
          <input
            type="text"
            name="login"
            placeholder="Введите логин"
            value={form.login}
            onChange={handleChange}
            required
            className={styles.input}
          />

          <div className={styles.row}>
            <div className={styles.col}>
              <label className={styles.label}>Номер</label>
              <input
                type="tel"
                name="phone"
                placeholder="+7 ___ ___ __ __"
                value={form.phone}
                onChange={handlePhoneChange}
                required
                className={styles.input}
              />
            </div>
            <div className={styles.col}>
              <label className={styles.label}>Почта</label>
              <input
                type="text"
                inputMode="email"
                name="email"
                placeholder="example@mail.ru"
                value={form.email}
                onChange={handleChange}
                required
                className={styles.input}
              />
            </div>
          </div>

          <label className={styles.label}>Пароль</label>
          <input
            type="password"
            name="password"
            placeholder="Введите пароль"
            value={form.password}
            onChange={handleChange}
            required
            className={styles.input}
          />

          <label className={styles.label}>Повтор пароля</label>
          <input
            type="password"
            name="repeatPassword"
            placeholder="Повторите пароль"
            value={form.repeatPassword}
            onChange={handleChange}
            required
            className={styles.input}
          />

          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? 'Загрузка...' : 'Регистрация'}
          </button>

          {error && <p className={styles.error}>{error}</p>}

          <div className={styles.policy}>
            <input
              type="checkbox"
              id="policy"
              checked={policyAccepted}
              onChange={(e) => setPolicyAccepted(e.target.checked)}
              className={styles.checkbox}
            />
            <label htmlFor="policy" className={styles.policyText}>
              При нажатии на кнопку "Регистрация", Вы принимаете{' '}
              <Link to="#" className={styles.policyLink}>условия политики конфиденциальности</Link>
            </label>
          </div>
        </form>

        {/* Переключатель темы (иконка солнца/луны) */}
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
        Уже есть аккаунт? <Link to="/login" className={styles.link}>Войти</Link>
      </p>
    </div>
  );
};

export default Register;
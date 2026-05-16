import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProfile, updateProfile } from '../../store/profileSlice';
import { useNavigate } from 'react-router-dom';
import styles from './EditProfile.module.css';

// Функция форматирования телефона (как в регистрации)
const formatPhone = (value) => {
  let digits = value.replace(/\D/g, '');
  if (digits.length > 11) digits = digits.slice(0, 11);
  let formatted = '+7';
  if (digits.length > 1) formatted += ' ' + digits.slice(1, 4);
  if (digits.length >= 5) formatted += ' ' + digits.slice(4, 7);
  if (digits.length >= 8) formatted += ' ' + digits.slice(7, 9);
  if (digits.length >= 10) formatted += ' ' + digits.slice(9, 11);
  return formatted;
};

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^\+7 \d{3} \d{3} \d{2} \d{2}$/;

const EditProfile = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { data: profile, loading, error } = useSelector(state => state.profile);
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
    login: '',
    mood: '',
    phone: '',
    email: '',
    about: '',
    password: ''
  });
  const [avatar, setAvatar] = useState(null);
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    document.title = 'Rabbit Cube — Редактирование профиля';
    if (!profile) {
      dispatch(fetchProfile());
    } else {
      setForm({
        login: profile.login || '',
        mood: profile.mood || '',
        phone: profile.phone || '',
        email: profile.email || '',
        about: profile.about || '',
        password: ''
      });
    }
  }, [dispatch, profile]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Отдельный обработчик для телефона с форматированием
  const handlePhoneChange = (e) => {
    const formatted = formatPhone(e.target.value);
    setForm({ ...form, phone: formatted });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatar(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    // Проверка email
    if (!emailRegex.test(form.email)) {
      alert('Введите корректный email (например, user@example.com)');
      return;
    }
  
    // Проверка телефона
    if (!phoneRegex.test(form.phone)) {
      alert('Введите корректный номер телефона (+7 XXX XXX XX XX)');
      return;
    }
  
    const formData = new FormData();
    formData.append('login', form.login);
    formData.append('mood', form.mood);
    formData.append('phone', form.phone);
    formData.append('email', form.email);
    formData.append('about', form.about);
    if (form.password) {
      if (form.password.length < 4) {
        alert('Пароль должен быть не менее 4 символов');
        return;
      }
      formData.append('password', form.password);
    }
    if (avatar) {
      formData.append('avatar', avatar);
    }
  
    const result = await dispatch(updateProfile(formData));
    if (result.meta.requestStatus === 'fulfilled') {
      let alertMsg = '';
      if (result.payload.emailPending) {
        alertMsg += 'На новый email отправлено письмо для подтверждения. ';
      }
      if (result.payload.passwordPending) {
        alertMsg += 'На ваш email отправлено письмо для подтверждения смены пароля. ';
      }
      if (!result.payload.emailPending && !result.payload.passwordPending) {
        alertMsg = 'Изменения сохранены';
      }
      alert(alertMsg);
      navigate('/profile');
    } else {
      alert(result.payload?.message || 'Ошибка сохранения');
    }
  };

  if (!profile) return <div className={styles.loading}>Загрузка...</div>;

  return (
    <div className={styles.container}>
      <div className={styles.profileBlock}>
        <div className={styles.columnLeft}>
          <div className={styles.avatarWrapper} onClick={() => fileInputRef.current.click()}>
            <img 
              src={preview || (profile.avatar ? `http://localhost:8080/uploads/avatars/${profile.avatar}` : '/media/default-avatar.png')} 
              alt="Avatar" 
              className={styles.avatar}
            />
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              accept="image/*" 
              style={{ display: 'none' }}
            />
          </div>
          <button type="submit" form="editForm" className={styles.saveBtn}>Сохранить</button>
          <button onClick={() => navigate('/profile')} className={styles.outBtn}>Выход</button>
        </div>

        <div className={styles.columnRight}>
          <form id="editForm" onSubmit={handleSubmit}>
            <label className={styles.label}>Логин</label>
            <input 
              type="text" name="login" value={form.login} onChange={handleChange} 
              className={styles.input} required 
            />

            <label className={styles.label}>Настроение</label>
            <input 
              type="text" name="mood" value={form.mood} onChange={handleChange} 
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
                  type="email" 
                  name="email" 
                  value={form.email} 
                  onChange={handleChange} 
                  required 
                  className={styles.input}
                />
              </div>
            </div>

            <label className={styles.label}>О себе</label>
            <input 
              type="text" name="about" value={form.about} onChange={handleChange} 
              className={styles.input} maxLength={85}
            />

            <label className={styles.label}>Пароль</label>
            <input 
              type="password" name="password" value={form.password} onChange={handleChange} 
              className={styles.input} placeholder="Новый пароль (оставьте пустым, чтобы не менять)"
              autoComplete="new-password"
            />
          </form>
          {error && <p className={styles.error}>{error}</p>}
        </div>
      </div>
    </div>
  );
};

export default EditProfile;
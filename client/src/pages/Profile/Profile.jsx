import React, { useEffect, useState } from 'react';
import API from '../../api';
import { useSelector, useDispatch } from 'react-redux';
import { fetchProfile, clearProfile } from '../../store/profileSlice';
import { fetchActiveBooking, clearActiveBooking } from '../../store/bookingSlice';
import { fetchHistory, cancelBooking } from '../../store/historySlice';
import { Link, useNavigate } from 'react-router-dom';
import { logout } from '../../store/authSlice';
import { HiOutlineLogout, HiOutlineCog } from 'react-icons/hi';
import HistoryList from './HistoryList';
import styles from './Profile.module.css';
import CountdownTimer from '../../components/CountdownTimer/CountdownTimer';

const Profile = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { data: profile, loading: profileLoading } = useSelector(state => state.profile);
  const { activeBooking, loading: bookingLoading } = useSelector(state => state.booking);
  const { isAuth } = useSelector(state => state.auth);
  const [allKitchen, setAllKitchen] = useState([]);

  useEffect(() => {
    document.title = 'Rabbit Cube — Профиль';
    if (!isAuth) {
      navigate('/login');
      return;
    }

    const loadKitchen = async () => {
      try {
        const res = await API.get('/kitchen');
        setAllKitchen(res.data);
      } catch (e) { console.error(e); }
    };
    loadKitchen();

    dispatch(fetchProfile());
    dispatch(fetchActiveBooking());
    dispatch(fetchHistory(1));

    return () => {
      dispatch(clearProfile());
    };
  }, [dispatch, isAuth, navigate]);

  useEffect(() => {
    const interval = setInterval(() => {
      dispatch(fetchActiveBooking());
    }, 5000);
    return () => clearInterval(interval);
  }, [dispatch]);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  if (profileLoading) return <div className={styles.loading}>Загрузка...</div>;
  if (!profile) return <div className={styles.loading}>Пользователь не найден</div>;

  const handleCancel = async () => {
    const result = await dispatch(cancelBooking(activeBooking.id));
    if (result.meta.requestStatus === 'fulfilled') {
      dispatch(clearActiveBooking());
      dispatch(fetchHistory(1));
    } else {
      alert('Ошибка при отмене бронирования');
    }
  };

  const getKitchenNames = (kitchenItems, allKitchen) => {
    if (!kitchenItems || !allKitchen.length) return '';
    let ids = [];
    if (typeof kitchenItems === 'string') {
      try { ids = JSON.parse(kitchenItems); } catch { return ''; }
    } else if (Array.isArray(kitchenItems)) {
      ids = kitchenItems;
    } else {
      return '';
    }
    return ids
      .map(item => {
        const id = typeof item === 'object' ? item.id : item;
        const found = allKitchen.find(k => k.id == id);
        return found ? found.name : '';
      })
      .filter(name => name !== '')
      .join(', ');
  };

  // Корректное формирование ISO-строки в локальном времени (без UTC)
  const timerStartTime = activeBooking?.booking_date && activeBooking?.start_time
    ? (() => {
        // booking_date: "2026-05-17"
        // start_time: "14:30" или "14:30:00"
        const [hours, minutes, seconds = 0] = activeBooking.start_time.split(':').map(Number);
        const date = new Date(activeBooking.booking_date);
        date.setHours(hours, minutes, seconds);
        return date.toISOString();
      })()
    : null;

  return (
    <div className={styles.container}>
      <div className={styles.profileBlock}>
        <div className={styles.columnAvatar}>
          <img 
            src={profile.avatar ? `http://localhost:8080/uploads/avatars/${profile.avatar}` : '/media/default-avatar.png'} 
            alt="Avatar" 
            className={styles.avatar}
          />
        </div>

        <div className={styles.columnInfo}>
          <h2 className={styles.login}>{profile.login}</h2>
          <p className={styles.mood}>{profile.mood}</p>
          <h3 className={styles.sectionTitle}>Контакты</h3>
          <p className={styles.contact}>Номер: {profile.phone || 'Не указан'}</p>
          <p className={styles.contact}>Почта: {profile.email}</p>
          <h3 className={styles.sectionTitle}>О себе</h3>
          <p className={styles.about}>{profile.about || 'Не указано'}</p>
          {!activeBooking && (
            <Link to="/booking" className={styles.bookBtn}>
              <span className={styles.btnText}>Забронировать ПК</span>
            </Link>
          )}
        </div>
          
        <div className={styles.columnActions}>
          <Link to="/profile/edit" className={styles.actionBtn}><HiOutlineCog size={32} /></Link>
          <button onClick={handleLogout} className={styles.actionBtn}><HiOutlineLogout size={32} /></button>

          <div className={styles.bookingBox}>
            {bookingLoading ? (
              <p>Загрузка...</p>
            ) : activeBooking ? (
              <>
                {activeBooking.status === 'pending' && (
                  <div className={styles.bookingHeader}>
                    <p>Код активации: <strong>{activeBooking.activation_code}</strong></p>
                    <p>Бронь ожидает активации. Обратитесь к администратору.</p>
                    {timerStartTime && <CountdownTimer startTime={timerStartTime} />}
                    <button className={styles.cancelBtn} onClick={handleCancel}>Отменить</button>
                  </div>
                )}
                {activeBooking.status === 'active' && (
                  <div className={styles.activeBooking}>
                    <div className={styles.bookingHeader}>
                      <p>Забронированное место: <br />{activeBooking.computer_name}</p>
                      <p>Время: {activeBooking.start_time?.slice(0,5)} - {activeBooking.end_time?.slice(0,5)}</p>
                      <p>Дата: {new Date(activeBooking.booking_date).toLocaleDateString('ru-RU')}</p>
                      <p>Кухня: {getKitchenNames(activeBooking.kitchen_items, allKitchen) || 'не выбрана'}</p>
                    </div>
                    <button className={styles.cancelBtn} onClick={handleCancel}>Отменить</button>
                  </div>
                )}
              </>
            ) : (
              <p className={styles.noBooking}>Брони нет</p>
            )}
          </div>
        </div>
      </div>

      <div className={styles.historySection}>
        <h2 className={styles.historyTitle}>История Бронирования</h2>
        <HistoryList />
      </div>
    </div>
  );
};

export default Profile;
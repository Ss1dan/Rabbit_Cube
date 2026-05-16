import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchProfile, clearProfile } from '../../store/profileSlice';
import { fetchActiveBooking, clearActiveBooking } from '../../store/bookingSlice';
import { fetchHistory, cancelBooking } from '../../store/historySlice';
import { Link, useNavigate } from 'react-router-dom';
import { logout } from '../../store/authSlice';
import { HiOutlineLogout, HiOutlineCog } from 'react-icons/hi';
import HistoryList from './HistoryList';
import styles from './Profile.module.css';


const Profile = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { data: profile, loading: profileLoading } = useSelector(state => state.profile);
  const { activeBooking, loading: bookingLoading } = useSelector(state => state.booking);
  const { isAuth } = useSelector(state => state.auth);

  useEffect(() => {
    document.title = 'Rabbit Cube — Профиль';
    if (!isAuth) {
      navigate('/login');
      return;
    }
    dispatch(fetchProfile());
    dispatch(fetchActiveBooking());
    dispatch(fetchHistory(1));

    return () => {
      dispatch(clearProfile());
    };
  }, [dispatch, isAuth, navigate]);

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

  return (
    <div className={styles.container}>
      {/* Блок профиля */}
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
          <Link to="/profile/edit" className={styles.actionBtn}>
            <HiOutlineCog size={32} />
          </Link>
          <button onClick={handleLogout} className={styles.actionBtn}>
            <HiOutlineLogout size={32} />
          </button>

          {/* Блок активной брони */}
          <div className={styles.bookingBox}>
            {bookingLoading ? (
              <p>Загрузка...</p>
            ) : activeBooking ? (
              <div className={styles.activeBooking}>
                <div className={styles.bookingHeader}>
                  <p>Забронированное место: <br></br>{activeBooking.computer_name}</p>
                  <p>Время: {activeBooking.start_time} - {activeBooking.end_time}</p>
                  <p>Дата: {new Date(activeBooking.booking_date).toLocaleDateString('ru-RU')}</p>
                  {activeBooking.kitchen_items && (
                  <p>
                    Кухня:{' '}
                      {(() => {
                        const items =
                          typeof activeBooking.kitchen_items === 'string'
                          ? JSON.parse(activeBooking.kitchen_items)
                          : activeBooking.kitchen_items;
                      return Array.isArray(items) ? items.join(', ') : '';
                      })()}
                  </p>
                )}
                </div>
                <button className={styles.cancelBtn} onClick={handleCancel}>
                  Отменить
                </button>
              </div>
            ) : (
              <p className={styles.noBooking}>Брони нет</p>
            )}
          </div>
        </div>
      </div>

      {/* История бронирования */}
      <div className={styles.historySection}>
        <h2 className={styles.historyTitle}>История Бронирования</h2>
        <HistoryList />
      </div>
    </div>
  );
};

export default Profile;
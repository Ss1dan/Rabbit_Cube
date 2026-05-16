import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchHistory, cancelBooking } from '../../store/historySlice';
import styles from './Profile.module.css';

const HistoryList = () => {
  const dispatch = useDispatch();
  const { bookings, currentPage, totalPages, loading } = useSelector(state => state.history);

  useEffect(() => {
    dispatch(fetchHistory(1));
  }, [dispatch]);

  const handlePageChange = (page) => {
    dispatch(fetchHistory(page));
  };

  if (loading) return <p>Загрузка...</p>;
  if (bookings.length === 0) return <p>Нет истории бронирований</p>;

  return (
    <div>
      <div className={styles.historyGrid}>
        {bookings.map(booking => (
          <div key={booking.id} className={styles.historyCard}>
            <h4 className={styles.cardTitle}>{booking.computer_name}</h4>
            <p className={styles.cardInfo}>Тип: {booking.computer_type}</p>
            <p className={styles.cardInfo}>
              Дата: {new Date(booking.booking_date).toLocaleDateString('ru-RU')}
            </p>
            <p className={styles.cardInfo}>Время: {booking.start_time} – {booking.end_time}</p>
            <p className={styles.cardStatus}>Статус: {booking.status}</p>
            {booking.status === 'active' && (
              <button 
                className={styles.cancelBtnSmall}
                onClick={() => dispatch(cancelBooking(booking.id))}
              >
                Отменить
              </button>
            )}
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className={styles.pagination}>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
            <button
              key={page}
              className={`${styles.pageBtn} ${page === currentPage ? styles.activePage : ''}`}
              onClick={() => handlePageChange(page)}
            >
              {page}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default HistoryList;
import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import API from '../../api';
import styles from '../Booking/Booking.module.css'; // используем стили для формы

const Admin = () => {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({
    user_id: '',
    computer_id: '',
    date: '',
    start_time: '',
    end_time: ''
  });

  useEffect(() => {
    document.title = 'Rabbit Cube — Админ панель';
    // Загрузка пользователей
    API.get('/admin/users').then(res => setUsers(res.data));
  }, []);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      await API.post('/admin/booking', {
        user_id: parseInt(form.user_id),
        computer_id: parseInt(form.computer_id),
        booking_date: form.date,
        start_time: form.start_time,
        end_time: form.end_time
      });
      alert('Бронирование создано');
    } catch (err) {
      alert(err.response.data.message);
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Администрирование</h2>
      <div style={{ background: 'var(--block)', borderRadius: '20px', padding: '20px', marginBottom: '20px' }}>
        <h3>Создать бронь от имени пользователя</h3>
        <form onSubmit={handleSubmit}>
          <select name="user_id" value={form.user_id} onChange={handleChange} style={{ margin: '10px 0', padding: '10px', width: '100%' }}>
            <option value="">Выберите пользователя</option>
            {users.map(u => (
              <option key={u.id} value={u.id}>{u.login} ({u.email})</option>
            ))}
          </select>
          <input type="number" name="computer_id" placeholder="ID компьютера" value={form.computer_id} onChange={handleChange} style={{ margin: '10px 0', padding: '10px', width: '100%' }} />
          <input type="date" name="date" value={form.date} onChange={handleChange} style={{ margin: '10px 0', padding: '10px', width: '100%' }} />
          <input type="time" name="start_time" value={form.start_time} onChange={handleChange} style={{ margin: '10px 0', padding: '10px', width: '100%' }} />
          <input type="time" name="end_time" value={form.end_time} onChange={handleChange} style={{ margin: '10px 0', padding: '10px', width: '100%' }} />
          <button type="submit" className={styles.chooseBtn} style={{ width: '100%', height: 'auto', padding: '15px' }}>Забронировать</button>
        </form>
      </div>
    </div>
  );
};

export default Admin;
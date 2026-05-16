import React, { useState, useEffect } from 'react';
import API from '../../api';
import styles from './Admin.module.css';

const Admin = () => {
  // Состояние раскрытых секций
  const [expanded, setExpanded] = useState({
    users: false,
    kitchen: false,
    computers: false,
    bookings: false,
  });

  const toggleSection = (section) => {
    setExpanded((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const [users, setUsers] = useState([]);
  const [kitchen, setKitchen] = useState([]);
  const [computers, setComputers] = useState([]);
  const [pendingBookings, setPendingBookings] = useState([]);
  const [activeBookings, setActiveBookings] = useState([]);

  // Формы добавления
  const [newUser, setNewUser] = useState({ login: '', email: '', phone: '', password: '', role: 'User' });
  const [newKitchenItem, setNewKitchenItem] = useState({ name: '', price: '' });
  const [editKitchenId, setEditKitchenId] = useState(null);
  const [editComputerId, setEditComputerId] = useState(null);
  const [editComputerData, setEditComputerData] = useState({});

  const fetchData = async () => {
    try {
      const [usersRes, kitchenRes, computersRes, pendingRes] = await Promise.all([
        API.get('/admin/users'),
        API.get('/kitchen'),
        API.get('/admin/computers'),
        API.get('/admin/pending-bookings'),
      ]);
      setUsers(usersRes.data);
      setKitchen(kitchenRes.data);
      setComputers(computersRes.data);
      setPendingBookings(pendingRes.data);
    } catch (err) {
      console.error(err);
    }

    const activeBookingsRes = await API.get('/admin/active-bookings');
    setActiveBookings(activeBookingsRes.data);

  };

  useEffect(() => {
    fetchData();
  }, []);

  // Пользователи
  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      await API.post('/admin/users', newUser);
      alert('Пользователь добавлен');
      setNewUser({ login: '', email: '', phone: '', password: '', role: 'User' });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Ошибка');
    }
  };

  const handleRoleChange = async (userId, role) => {
    try {
      await API.put('/admin/users/role', { userId, role });
      alert('Роль изменена');
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Ошибка');
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Удалить пользователя?')) return;
    try {
      await API.delete(`/admin/users/${id}`);
      alert('Пользователь удалён');
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Ошибка');
    }
  };

  // Кухня
  const handleAddKitchen = async (e) => {
    e.preventDefault();
    try {
      await API.post('/admin/kitchen', newKitchenItem);
      alert('Позиция добавлена');
      setNewKitchenItem({ name: '', price: '' });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Ошибка');
    }
  };

  const handleEditKitchen = async (id, name, price) => {
    try {
      await API.put(`/admin/kitchen/${id}`, { name, price });
      alert('Позиция обновлена');
      setEditKitchenId(null);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Ошибка');
    }
  };

  const handleDeleteKitchen = async (id) => {
    if (!window.confirm('Удалить позицию?')) return;
    try {
      await API.delete(`/admin/kitchen/${id}`);
      alert('Позиция удалена');
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Ошибка');
    }
  };

  // Компьютеры
  const handleEditComputer = async (id) => {
    try {
      await API.put(`/admin/computers/${id}`, editComputerData);
      alert('Конфигурация обновлена');
      setEditComputerId(null);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Ошибка');
    }
  };

  const startEditComputer = (computer) => {
    setEditComputerId(computer.id);
    let specs = {};
    if (computer.specs) {
      specs = typeof computer.specs === 'string' ? JSON.parse(computer.specs) : computer.specs;
    }
    setEditComputerData({
      name: computer.name,
      type: computer.type,
      price_per_hour: computer.price_per_hour,
      is_available: computer.is_available,
      specs: specs,
    });
  };

  // Брони
  const handleActivate = async (bookingId) => {
    const code = prompt('Код активации:');
    if (!code) return;
    try {
      const res = await API.post('/admin/activate-booking', { bookingId, code });
      alert(res.data.message);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Ошибка');
    }
  };

  const handleCancelBooking = async (bookingId) => {
    try {
      await API.put(`/admin/booking/${bookingId}/cancel`);
      alert('Бронь отменена');
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Ошибка');
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Администрирование</h2>

      {/* Пользователи */}
      <div className={styles.section}>
        <div
          className={styles.sectionHeader}
          onClick={() => toggleSection('users')}
        >
          <h3 className={styles.sectionTitle}>Пользователи</h3>
          <span className={`${styles.arrow} ${expanded.users ? styles.open : ''}`}>&#9660;</span>
        </div>
        <div className={`${styles.collapsible} ${expanded.users ? styles.open : ''}`}>
          <div className={styles.sectionContent}>
            <h4 className={styles.subTitle}>Добавить пользователя</h4>
            <form className={styles.form} onSubmit={handleAddUser}>
              <div className={styles.formRow}>
                <input
                  className={styles.formInput}
                  placeholder="Логин"
                  value={newUser.login}
                  onChange={(e) => setNewUser({ ...newUser, login: e.target.value })}
                  required
                />
                <input
                  className={styles.formInput}
                  type="email"
                  placeholder="Email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  required
                />
              </div>
              <div className={styles.formRow}>
                <input
                  className={styles.formInput}
                  type="tel"
                  placeholder="Телефон"
                  value={newUser.phone}
                  onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                />
                <input
                  className={styles.formInput}
                  type="password"
                  placeholder="Пароль"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  required
                />
                <select
                  className={styles.formSelect}
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                >
                  <option value="User">User</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>
              <button type="submit" className={styles.formBtn}>Добавить</button>
            </form>

            <hr className={styles.divider} />

            <h4 className={styles.subTitle}>Список пользователей</h4>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Логин</th>
                  <th>Email</th>
                  <th>Роли</th>
                  <th>Действия</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td>{u.id}</td>
                    <td>{u.login}</td>
                    <td>{u.email}</td>
                    <td>{Array.isArray(u.roles) ? u.roles.join(', ') : 'User'}</td>
                    <td>
                      <select
                        className={styles.actionBtn}
                        onChange={(e) => handleRoleChange(u.id, e.target.value)}
                        defaultValue=""
                      >
                        <option value="" disabled>Изменить роль</option>
                        <option value="User">User</option>
                        <option value="Admin">Admin</option>
                      </select>
                      <button
                        className={styles.dangerBtn}
                        onClick={() => handleDeleteUser(u.id)}
                      >
                        Удалить
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Кухня */}
      <div className={styles.section}>
        <div
          className={styles.sectionHeader}
          onClick={() => toggleSection('kitchen')}
        >
          <h3 className={styles.sectionTitle}>Кухня</h3>
          <span className={`${styles.arrow} ${expanded.kitchen ? styles.open : ''}`}>&#9660;</span>
        </div>
        <div className={`${styles.collapsible} ${expanded.kitchen ? styles.open : ''}`}>
          <div className={styles.sectionContent}>
            <h4 className={styles.subTitle}>Добавить позицию</h4>
            <form className={styles.form} onSubmit={handleAddKitchen}>
              <div className={styles.formRow}>
                <input
                  className={styles.formInput}
                  placeholder="Название"
                  value={newKitchenItem.name}
                  onChange={(e) => setNewKitchenItem({ ...newKitchenItem, name: e.target.value })}
                  required
                />
                <input
                  className={styles.formInput}
                  type="number"
                  placeholder="Цена"
                  value={newKitchenItem.price}
                  onChange={(e) => setNewKitchenItem({ ...newKitchenItem, price: e.target.value })}
                  required
                />
              </div>
              <button type="submit" className={styles.formBtn}>Добавить</button>
            </form>

            <hr className={styles.divider} />

            <h4 className={styles.subTitle}>Меню кухни</h4>
            {kitchen.map((item) => (
              <div key={item.id} className={styles.card}>
                <div
                  className={styles.cardHeader}
                  onClick={() => {
                    if (editKitchenId === item.id) {
                      setEditKitchenId(null);
                    } else {
                      setEditKitchenId(item.id);
                    }
                  }}
                >
                  <div className={styles.cardInfo}>
                    {item.name} — {item.price}р
                  </div>
                  <div className={styles.cardActions}>
                    <span className={styles.actionBtn}>
                      {editKitchenId === item.id ? 'Скрыть' : 'Изменить'}
                    </span>
                    <button
                      className={styles.dangerBtn}
                      onClick={(e) => { e.stopPropagation(); handleDeleteKitchen(item.id); }}
                    >
                      Удалить
                    </button>
                  </div>
                </div>
                <div className={`${styles.collapsible} ${editKitchenId === item.id ? styles.open : ''}`}>
                  {editKitchenId === item.id && (
                    <div className={styles.editForm}>
                      <input
                        value={item.name}
                        onChange={(e) => setKitchen(kitchen.map(k => k.id === item.id ? { ...k, name: e.target.value } : k))}
                      />
                      <input
                        type="number"
                        value={item.price}
                        onChange={(e) => setKitchen(kitchen.map(k => k.id === item.id ? { ...k, price: e.target.value } : k))}
                      />
                      <button className={styles.actionBtn} onClick={() => handleEditKitchen(item.id, item.name, item.price)}>
                        Сохранить
                      </button>
                      <button className={styles.actionBtn} onClick={() => setEditKitchenId(null)}>
                        Отмена
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Компьютеры */}
      <div className={styles.section}>
        <div
          className={styles.sectionHeader}
          onClick={() => toggleSection('computers')}
        >
          <h3 className={styles.sectionTitle}>Компьютеры</h3>
          <span className={`${styles.arrow} ${expanded.computers ? styles.open : ''}`}>&#9660;</span>
        </div>
        <div className={`${styles.collapsible} ${expanded.computers ? styles.open : ''}`}>
          <div className={styles.sectionContent}>
            <h4 className={styles.subTitle}>Конфигурация мест</h4>
            {computers.map((comp) => (
              <div key={comp.id} className={styles.card}>
                <div
                  className={styles.cardHeader}
                  onClick={() => {
                    if (editComputerId === comp.id) {
                      setEditComputerId(null);
                    } else {
                      startEditComputer(comp);
                    }
                  }}
                >
                  <div className={styles.cardInfo}>
                    {comp.name} ({comp.type}) — {comp.price_per_hour}р
                  </div>
                  <div className={styles.cardActions}>
                    <span className={styles.actionBtn}>
                      {editComputerId === comp.id ? 'Скрыть' : 'Изменить'}
                    </span>
                  </div>
                </div>
                <div className={`${styles.collapsible} ${editComputerId === comp.id ? styles.open : ''}`}>
                  {editComputerId === comp.id && (
                    <div className={styles.editForm}>
                      <input
                        value={editComputerData.name}
                        onChange={(e) => setEditComputerData({ ...editComputerData, name: e.target.value })}
                      />
                      <select
                        value={editComputerData.type}
                        onChange={(e) => setEditComputerData({ ...editComputerData, type: e.target.value })}
                      >
                        <option value="Standard">Standard</option>
                        <option value="VIP">VIP</option>
                        <option value="PS5">PS5</option>
                      </select>
                      <input
                        type="number"
                        value={editComputerData.price_per_hour}
                        onChange={(e) => setEditComputerData({ ...editComputerData, price_per_hour: e.target.value })}
                      />
                      <label>
                        <input
                          type="checkbox"
                          checked={editComputerData.is_available}
                          onChange={(e) => setEditComputerData({ ...editComputerData, is_available: e.target.checked })}
                        />
                        Доступен
                      </label>
                      <textarea
                        value={JSON.stringify(editComputerData.specs, null, 2)}
                        onChange={(e) => setEditComputerData({ ...editComputerData, specs: JSON.parse(e.target.value) })}
                      />
                      <button className={styles.actionBtn} onClick={() => handleEditComputer(comp.id)}>
                        Сохранить
                      </button>
                      <button className={styles.actionBtn} onClick={() => setEditComputerId(null)}>
                        Отмена
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Брони */}
      <div className={styles.section}>
        <div
          className={styles.sectionHeader}
          onClick={() => toggleSection('bookings')}
        >
          <h3 className={styles.sectionTitle}>Брони</h3>
          <span className={`${styles.arrow} ${expanded.bookings ? styles.open : ''}`}>&#9660;</span>
        </div>
        <div className={`${styles.collapsible} ${expanded.bookings ? styles.open : ''}`}>
          <div className={styles.sectionContent}>
            <h4 className={styles.subTitle}>Ожидающие активации</h4>
            <div className={styles.pendingList}>
              {pendingBookings.length === 0 ? (
                <p>Нет броней, ожидающих активации</p>
              ) : (
                pendingBookings.map((b) => (
                  <div key={b.booking_id} className={styles.pendingItem}>
                    <div>
                      <p>
                        <strong>Бронь #{b.booking_id}</strong>
                      </p>
                      <p>Пользователь: {b.login}</p>
                      <p>Компьютер: {b.computer_name}</p>
                      <p>
                        Код активации: <span className={styles.cardInfo}>{b.activation_code}</span>
                      </p>
                      <p>
                        Истекает: {new Date(b.expires_at).toLocaleTimeString('ru-RU')}
                      </p>
                    </div>
                    <button
                      className={styles.formBtn}
                      onClick={() => handleActivate(b.booking_id)}
                    >
                      Активировать
                    </button>
                  </div>
                ))
              )}
            </div>
            <h4 className={styles.subTitle}>Активные брони</h4>
<div className={styles.pendingList}>
  {activeBookings.length === 0 ? (
    <p>Нет активных броней</p>
  ) : (
    activeBookings.map((b) => (
      <div key={b.booking_id} className={styles.pendingItem}>
        <div>
          <p><strong>Бронь #{b.booking_id}</strong></p>
          <p>Пользователь: {b.login}</p>
          <p>Компьютер: {b.computer_name}</p>
          <p>Дата: {new Date(b.booking_date).toLocaleDateString('ru-RU')}</p>
          <p>Время: {b.start_time?.slice(0,5)} – {b.end_time?.slice(0,5)}</p>
        </div>
        <button
          className={styles.formBtn}
          onClick={() => handleCancelBooking(b.booking_id)}
        >
          Отменить
        </button>
      </div>
    ))
  )}
</div> 
            <hr className={styles.divider} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;
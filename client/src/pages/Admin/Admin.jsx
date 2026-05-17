import React, { useState, useEffect } from 'react';
import API from '../../api';
import styles from './Admin.module.css';

const Admin = () => {

  const [activationCodes, setActivationCodes] = useState({});

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

  // ================== БРОНИ (пагинация + поиск) ==================
  const [activeBookings, setActiveBookings] = useState([]);
  const [activePage, setActivePage] = useState(1);
  const [activeTotalPages, setActiveTotalPages] = useState(1);
  const [activeSearch, setActiveSearch] = useState('');

  const [pendingBookings, setPendingBookings] = useState([]);
  const [pendingPage, setPendingPage] = useState(1);
  const [pendingTotalPages, setPendingTotalPages] = useState(1);
  const [pendingSearch, setPendingSearch] = useState('');

  // ================== ПОЛНЫЕ СПИСКИ ДЛЯ ФОРМ ==================
  const [allUsers, setAllUsers] = useState([]);
  const [allComputers, setAllComputers] = useState([]);
  const [allKitchen, setAllKitchen] = useState([]);

  // ================== КУХНЯ И КОМПЬЮТЕРЫ (пагинация) ==================
  const [kitchenPage, setKitchenPage] = useState(1);
  const [kitchenTotalPages, setKitchenTotalPages] = useState(1);
  const [kitchenSearch, setKitchenSearch] = useState('');

  const [compPage, setCompPage] = useState(1);
  const [compTotalPages, setCompTotalPages] = useState(1);
  const [compSearch, setCompSearch] = useState('');
  const [compTypeFilter, setCompTypeFilter] = useState('');

  // Данные (с пагинацией)
  const [users, setUsers] = useState([]);
  const [kitchen, setKitchen] = useState([]);
  const [computers, setComputers] = useState([]);

  // Пагинация и поиск пользователей
  const [userPage, setUserPage] = useState(1);
  const [userTotalPages, setUserTotalPages] = useState(1);
  const [searchInput, setSearchInput] = useState('');

  // Формы добавления
  const [newUser, setNewUser] = useState({ login: '', email: '', phone: '', password: '', role: 'User' });
  const [newKitchenItem, setNewKitchenItem] = useState({ name: '', price: '' });
  const [editKitchenId, setEditKitchenId] = useState(null);
  const [editComputerId, setEditComputerId] = useState(null);
  const [editComputerData, setEditComputerData] = useState({});

  const [bookingForm, setBookingForm] = useState({
    user_id: '',
    computer_id: '',
    booking_date: '',
    start_time: '',
    end_time: '',
    kitchen_items: [],
  });

  // ================== ЗАГРУЗКА ДАННЫХ ==================
  const fetchUsers = async (page = 1, search = searchInput) => {
    try {
      const res = await API.get('/admin/users', {
        params: { page, limit: 5, search },
      });
      setUsers(res.data.users);
      setUserTotalPages(res.data.totalPages);
      setUserPage(res.data.currentPage);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchKitchen = async (page = 1, search = kitchenSearch) => {
    try {
      const res = await API.get('/admin/kitchen', {
        params: { page, limit: 5, search },
      });
      setKitchen(res.data.items);
      setKitchenTotalPages(res.data.totalPages);
      setKitchenPage(res.data.currentPage);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchComputers = async (page = 1, search = compSearch, type = compTypeFilter) => {
    try {
      const res = await API.get('/admin/computers-paginated', {
        params: { page, limit: 5, search, type },
      });
      setComputers(res.data.computers);
      setCompTotalPages(res.data.totalPages);
      setCompPage(res.data.currentPage);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchActiveBookings = async (page = 1, search = activeSearch) => {
    try {
      const res = await API.get('/admin/active-bookings', {
        params: { page, limit: 5, search },
      });
      setActiveBookings(res.data.bookings);
      setActivePage(res.data.currentPage);
      setActiveTotalPages(res.data.totalPages);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchPendingBookings = async (page = 1, search = pendingSearch) => {
    try {
      const res = await API.get('/admin/pending-bookings', {
        params: { page, limit: 5, search },
      });
      setPendingBookings(res.data.bookings);
      setPendingPage(res.data.currentPage);
      setPendingTotalPages(res.data.totalPages);
    } catch (err) {
      console.error(err);
    }
  };

  // Первоначальная загрузка
  useEffect(() => {
    fetchUsers();
    fetchKitchen();
    fetchComputers();
    fetchActiveBookings();
    fetchPendingBookings();

    // Полные списки для формы бронирования
    const loadFullData = async () => {
      try {
        const [usersRes, computersRes, kitchenRes] = await Promise.all([
          API.get('/admin/all-users'),
          API.get('/admin/all-computers'),
          API.get('/kitchen')
        ]);
        setAllUsers(usersRes.data);
        setAllComputers(computersRes.data);
        setAllKitchen(kitchenRes.data);
      } catch (err) {
        console.error('Ошибка загрузки полных данных:', err);
      }
    };
    loadFullData();
  }, []);

  // Debounce для поиска
  useEffect(() => {
    const delay = setTimeout(() => fetchUsers(1, searchInput), 500);
    return () => clearTimeout(delay);
  }, [searchInput]);

  useEffect(() => {
    const delay = setTimeout(() => fetchKitchen(1, kitchenSearch), 500);
    return () => clearTimeout(delay);
  }, [kitchenSearch]);

  useEffect(() => {
    const delay = setTimeout(() => fetchComputers(1, compSearch, compTypeFilter), 500);
    return () => clearTimeout(delay);
  }, [compSearch, compTypeFilter]);

  useEffect(() => {
    const delay = setTimeout(() => fetchActiveBookings(1, activeSearch), 500);
    return () => clearTimeout(delay);
  }, [activeSearch]);

  useEffect(() => {
    const delay = setTimeout(() => fetchPendingBookings(1, pendingSearch), 500);
    return () => clearTimeout(delay);
  }, [pendingSearch]);

  // ================== ОБРАБОТЧИКИ ==================
  const handleCreateBooking = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post('/admin/booking', bookingForm);
  
      // Формируем сообщение с выбранной кухней
      let kitchenMsg = '';
      if (bookingForm.kitchen_items.length > 0) {
        const names = bookingForm.kitchen_items
          .map(id => {
            const item = allKitchen.find(k => k.id === id);
            return item ? item.name : '';
          })
          .filter(name => name)
          .join(', ');
        if (names) {
          kitchenMsg = `\n\nВыбранные блюда: ${names}\nПоставьте их на стол пользователю!`;
        }
      }
  
      alert(`Бронирование создано! Код активации: ${res.data.activation_code}${kitchenMsg}`);
  
      // Сброс формы
      setBookingForm({
        user_id: '',
        computer_id: '',
        booking_date: '',
        start_time: '',
        end_time: '',
        kitchen_items: [],
      });
      fetchPendingBookings();
    } catch (err) {
      alert(err.response?.data?.message || 'Ошибка при создании бронирования');
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      await API.post('/admin/users', newUser);
      alert('Пользователь добавлен');
      setNewUser({ login: '', email: '', phone: '', password: '', role: 'User' });
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || 'Ошибка');
    }
  };

  const handleRoleChange = async (userId, role) => {
    try {
      await API.put('/admin/users/role', { userId, role });
      alert('Роль изменена');
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || 'Ошибка');
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Удалить пользователя?')) return;
    try {
      await API.delete(`/admin/users/${id}`);
      alert('Пользователь удалён');
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || 'Ошибка');
    }
  };

  const handleAddKitchen = async (e) => {
    e.preventDefault();
    try {
      await API.post('/admin/kitchen', newKitchenItem);
      alert('Позиция добавлена');
      setNewKitchenItem({ name: '', price: '' });
      fetchKitchen();
    } catch (err) {
      alert(err.response?.data?.message || 'Ошибка');
    }
  };

  const handleEditKitchen = async (id, name, price) => {
    try {
      await API.put(`/admin/kitchen/${id}`, { name, price });
      alert('Позиция обновлена');
      setEditKitchenId(null);
      fetchKitchen();
    } catch (err) {
      alert(err.response?.data?.message || 'Ошибка');
    }
  };

  const handleDeleteKitchen = async (id) => {
    if (!window.confirm('Удалить позицию?')) return;
    try {
      await API.delete(`/admin/kitchen/${id}`);
      alert('Позиция удалена');
      fetchKitchen();
    } catch (err) {
      alert(err.response?.data?.message || 'Ошибка');
    }
  };

  const handleEditComputer = async (id) => {
    try {
      await API.put(`/admin/computers/${id}`, editComputerData);
      alert('Конфигурация обновлена');
      setEditComputerId(null);
      fetchComputers();
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

  const handleActivate = async (bookingId) => {
    const code = activationCodes[bookingId]?.trim();
    if (!code) {
      alert('Введите код активации');
      return;
    }
    try {
      const res = await API.post('/admin/activate-booking', { bookingId, code });
      alert(res.data.message);
      setActivationCodes(prev => {
        const updated = { ...prev };
        delete updated[bookingId];
        return updated;
      });
      fetchPendingBookings();
      fetchActiveBookings();
    } catch (err) {
      alert(err.response?.data?.message || 'Ошибка активации');
    }
  };

  const handleCancelBooking = async (bookingId) => {
    try {
      await API.put(`/admin/booking/${bookingId}/cancel`);
      alert('Бронь отменена');
      fetchActiveBookings(activePage, activeSearch);
      fetchPendingBookings(pendingPage, pendingSearch);
    } catch (err) {
      alert(err.response?.data?.message || 'Ошибка');
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Администрирование</h2>

      {/* Брони */}
      <div className={styles.section}>
        <div className={styles.sectionHeader} onClick={() => toggleSection('bookings')}>
          <h3 className={styles.sectionTitle}>Брони</h3>
          <span className={`${styles.arrow} ${expanded.bookings ? styles.open : ''}`}>&#9660;</span>
        </div>
        <div className={`${styles.collapsible} ${expanded.bookings ? styles.open : ''}`}>
          <div className={styles.sectionContent}>
            <h4 className={styles.subTitle}>Новое бронирование</h4>
            <form className={styles.form} onSubmit={handleCreateBooking}>
              <div className={styles.formRow}>
                <select className={styles.formSelect} value={bookingForm.user_id} onChange={(e) => setBookingForm({ ...bookingForm, user_id: e.target.value })} required>
                  <option value="">Выберите пользователя</option>
                  {allUsers.map((u) => <option key={u.id} value={u.id}>{u.login} ({u.email})</option>)}
                </select>
                <select className={styles.formSelect} value={bookingForm.computer_id} onChange={(e) => setBookingForm({ ...bookingForm, computer_id: e.target.value })} required>
                  <option value="">Выберите компьютер</option>
                  {allComputers.map((c) => <option key={c.id} value={c.id}>{c.name} ({c.type})</option>)}
                </select>
              </div>
              <div className={styles.formRow}>
                <input type="date" className={styles.formInput} value={bookingForm.booking_date} onChange={(e) => setBookingForm({ ...bookingForm, booking_date: e.target.value })} required />
                <input type="time" className={styles.formInput} value={bookingForm.start_time} onChange={(e) => setBookingForm({ ...bookingForm, start_time: e.target.value })} required />
                <input type="time" className={styles.formInput} value={bookingForm.end_time} onChange={(e) => setBookingForm({ ...bookingForm, end_time: e.target.value })} required />
              </div>
              <div className={styles.formRow}>
                <div className={styles.checkboxGroup}>
                  <label className={styles.checkboxLabel}>Добавить блюда:</label>
                  {allKitchen.map(item => (
                    <label key={item.id} className={styles.checkboxItem}>
                      <input type="checkbox" value={item.id} checked={bookingForm.kitchen_items.includes(item.id)} onChange={(e) => {
                        const id = item.id;
                        if (e.target.checked) {
                          setBookingForm(prev => ({ ...prev, kitchen_items: [...prev.kitchen_items, id] }));
                        } else {
                          setBookingForm(prev => ({ ...prev, kitchen_items: prev.kitchen_items.filter(k => k !== id) }));
                        }
                      }} />
                      {item.name} ({item.price}р)
                    </label>
                  ))}
                </div>
              </div>
              <button type="submit" className={styles.formBtn}>Забронировать</button>
            </form>
            <hr className={styles.divider} />

                        {/* Ожидающие активации */}
                        <h4 className={styles.subTitle}>Ожидающие активации</h4>
            <input type="text" placeholder="Поиск по логину..." value={pendingSearch} onChange={(e) => setPendingSearch(e.target.value)} className={styles.searchInput} />
            <div className={styles.pendingList}>
              {(pendingBookings || []).length === 0 ? (
                <p>Нет броней, ожидающих активации</p>
              ) : (
                pendingBookings.map((b) => (
                  <div key={b.booking_id} className={styles.pendingItem}>
                    <div>
                      <p><strong>Бронь #{b.booking_id}</strong></p>
                      <p>Пользователь: {b.login}</p>
                      <p>Компьютер: {b.computer_name}</p>
                      <p>Истекает: {new Date(b.expires_at).toLocaleTimeString('ru-RU')}</p>
                    </div>
                    <div className={styles.pendingActions}>
                      <input
                        type="text"
                        placeholder="Код активации"
                        className={styles.searchInput}
                        style={{ width: '140px', marginRight: '10px' }}
                        value={activationCodes[b.booking_id] || ''}
                        onChange={(e) => setActivationCodes(prev => ({ ...prev, [b.booking_id]: e.target.value }))}
                      />
                      <button
                        className={styles.formBtn}
                        onClick={() => handleActivate(b.booking_id)}
                        disabled={!activationCodes[b.booking_id]}
                      >
                        Активировать
                      </button>
                      <button
                        className={styles.formBtn}
                        onClick={() => handleCancelBooking(b.booking_id)}
                        style={{ marginLeft: '10px' }}
                      >
                        Отменить
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
            {pendingTotalPages > 1 && (
              <div className={styles.pagination}>
                {Array.from({ length: pendingTotalPages }, (_, i) => i + 1).map(p => (
                  <button key={p} className={`${styles.pageBtn} ${p === pendingPage ? styles.activePage : ''}`} onClick={() => fetchPendingBookings(p, pendingSearch)}>{p}</button>
                ))}
              </div>
            )}

            {/* Активные брони */}
            <h4 className={styles.subTitle}>Активные брони</h4>
            <input type="text" placeholder="Поиск по логину..." value={activeSearch} onChange={(e) => setActiveSearch(e.target.value)} className={styles.searchInput} />
            <div className={styles.pendingList}>
            {(activeBookings || []).length === 0 ? (
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
                    <button className={styles.formBtn} onClick={() => handleCancelBooking(b.booking_id)}>Отменить</button>
                  </div>
                ))
              )}
            </div>
            {activeTotalPages > 1 && (
              <div className={styles.pagination}>
                {Array.from({ length: activeTotalPages }, (_, i) => i + 1).map(p => (
                  <button key={p} className={`${styles.pageBtn} ${p === activePage ? styles.activePage : ''}`} onClick={() => fetchActiveBookings(p, activeSearch)}>{p}</button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Пользователи */}
      <div className={styles.section}>
        <div className={styles.sectionHeader} onClick={() => toggleSection('users')}>
          <h3 className={styles.sectionTitle}>Пользователи</h3>
          <span className={`${styles.arrow} ${expanded.users ? styles.open : ''}`}>&#9660;</span>
        </div>
        <div className={`${styles.collapsible} ${expanded.users ? styles.open : ''}`}>
          <div className={styles.sectionContent}>
            <h4 className={styles.subTitle}>Добавить пользователя</h4>
            <form className={styles.form} onSubmit={handleAddUser}>
              <div className={styles.formRow}>
                <input className={styles.formInput} placeholder="Логин" value={newUser.login} onChange={(e) => setNewUser({ ...newUser, login: e.target.value })} required />
                <input className={styles.formInput} type="email" placeholder="Email" value={newUser.email} onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} required />
              </div>
              <div className={styles.formRow}>
                <input className={styles.formInput} type="tel" placeholder="Телефон" value={newUser.phone} onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })} />
                <input className={styles.formInput} type="password" placeholder="Пароль" value={newUser.password} onChange={(e) => setNewUser({ ...newUser, password: e.target.value })} required />
                <select className={styles.formSelect} value={newUser.role} onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}>
                  <option value="User">User</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>
              <button type="submit" className={styles.formBtn}>Добавить</button>
            </form>

            <hr className={styles.divider} />

            <h4 className={styles.subTitle}>Список пользователей</h4>
            <input
              type="text"
              placeholder="Поиск по логину, email или телефону..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className={styles.searchInput}
            />
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
                      <button className={styles.dangerBtn} onClick={() => handleDeleteUser(u.id)}>Удалить</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {userTotalPages > 1 && (
              <div className={styles.pagination}>
                {Array.from({ length: userTotalPages }, (_, i) => i + 1).map(p => (
                  <button
                    key={p}
                    className={`${styles.pageBtn} ${p === userPage ? styles.activePage : ''}`}
                    onClick={() => fetchUsers(p, searchInput)}
                  >
                    {p}
                  </button>
                ))}
              </div>
            )}
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
            <input
  type="text"
  placeholder="Поиск по названию..."
  value={kitchenSearch}
  onChange={(e) => setKitchenSearch(e.target.value)}
  className={styles.searchInput}
/>
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
            {kitchenTotalPages > 1 && (
  <div className={styles.pagination}>
    {Array.from({ length: kitchenTotalPages }, (_, i) => i + 1).map(p => (
      <button
        key={p}
        className={`${styles.pageBtn} ${p === kitchenPage ? styles.activePage : ''}`}
        onClick={() => fetchKitchen(p, kitchenSearch)}
      >
        {p}
      </button>
    ))}
  </div>
)}
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
            <div className={styles.formRow}>
  <input
    type="text"
    placeholder="Поиск по названию..."
    value={compSearch}
    onChange={(e) => setCompSearch(e.target.value)}
    className={styles.searchInput}
  />
  <select
    value={compTypeFilter}
    onChange={(e) => setCompTypeFilter(e.target.value)}
    className={styles.formSelect}
  >
    <option value="">Все типы</option>
    <option value="Standard">Standard</option>
    <option value="VIP">VIP</option>
    <option value="PS5">PS5</option>
  </select>
</div>
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
            {compTotalPages > 1 && (
  <div className={styles.pagination}>
    {Array.from({ length: compTotalPages }, (_, i) => i + 1).map(p => (
      <button
        key={p}
        className={`${styles.pageBtn} ${p === compPage ? styles.activePage : ''}`}
        onClick={() => fetchComputers(p, compSearch, compTypeFilter)}
      >
        {p}
      </button>
    ))}
  </div>
)}
          </div>
        </div>
      </div>

      
    </div>
  );
};

export default Admin;
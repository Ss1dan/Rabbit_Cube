const db = require('../config/db');
const bcrypt = require('bcrypt');

// ================== ПОЛЬЗОВАТЕЛИ ==================
exports.getAllUsers = async (req, res) => {
  try {
    const users = await db('users')
      .leftJoin('user_roles', 'users.id', 'user_roles.user_id')
      .leftJoin('roles', 'roles.id', 'user_roles.role_id')
      .select(
        'users.id', 'users.login', 'users.email', 'users.phone',
        'users.confirmed', 'users.created_at',
        db.raw('COALESCE(json_agg(DISTINCT roles.name) FILTER (WHERE roles.name IS NOT NULL), \'[]\') as roles')
      )
      .groupBy('users.id');
    res.status(200).send(users);
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

exports.addUser = async (req, res) => {
  const { login, email, phone, password, role } = req.body;
  if (!login || !email || !password) {
    return res.status(400).send({ message: 'Логин, email и пароль обязательны' });
  }
  try {
    const existing = await db('users').where({ login }).orWhere({ email }).first();
    if (existing) return res.status(400).send({ message: 'Пользователь с таким логином или email уже существует' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const [newUser] = await db('users').insert({
      login,
      email,
      phone: phone || '',
      password: hashedPassword,
      confirmed: true // админ сразу подтверждает
    }).returning('id');

    // Роль
    if (role && ['User', 'Admin'].includes(role)) {
      const roleRecord = await db('roles').where({ name: role }).first();
      if (roleRecord) {
        await db('user_roles').insert({ user_id: newUser.id, role_id: roleRecord.id });
      }
    } else {
      // По умолчанию User
      const userRole = await db('roles').where({ name: 'User' }).first();
      await db('user_roles').insert({ user_id: newUser.id, role_id: userRole.id });
    }

    res.status(201).send({ message: 'Пользователь добавлен' });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

exports.updateUserRole = async (req, res) => {
  const { userId, role } = req.body;
  if (!userId || !role || !['User', 'Admin'].includes(role)) {
    return res.status(400).send({ message: 'Укажите userId и роль (User/Admin)' });
  }
  try {
    const roleRecord = await db('roles').where({ name: role }).first();
    if (!roleRecord) return res.status(400).send({ message: 'Роль не найдена' });

    await db('user_roles').where({ user_id: userId }).del();
    await db('user_roles').insert({ user_id: userId, role_id: roleRecord.id });
    res.status(200).send({ message: 'Роль обновлена' });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

exports.deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    await db('users').where({ id }).del();
    res.status(200).send({ message: 'Пользователь удалён' });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

// ================== КУХНЯ ==================
exports.addKitchenItem = async (req, res) => {
  const { name, price } = req.body;
  if (!name || !price) return res.status(400).send({ message: 'Название и цена обязательны' });
  try {
    const [newItem] = await db('kitchen').insert({ name, price }).returning('*');
    res.status(201).send(newItem);
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

exports.updateKitchenItem = async (req, res) => {
  const { id } = req.params;
  const { name, price } = req.body;
  try {
    const update = {};
    if (name) update.name = name;
    if (price) update.price = price;
    await db('kitchen').where({ id }).update(update);
    res.status(200).send({ message: 'Позиция обновлена' });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

exports.deleteKitchenItem = async (req, res) => {
  const { id } = req.params;
  try {
    await db('kitchen').where({ id }).del();
    res.status(200).send({ message: 'Позиция удалена' });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

// ================== КОМПЬЮТЕРЫ ==================
exports.getComputers = async (req, res) => {
  try {
    const computers = await db('computers').select('*').orderBy('id');
    res.status(200).send(computers);
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

exports.updateComputer = async (req, res) => {
  const { id } = req.params;
  const { name, type, price_per_hour, is_available, specs } = req.body;
  try {
    const update = {};
    if (name) update.name = name;
    if (type) update.type = type;
    if (price_per_hour) update.price_per_hour = price_per_hour;
    if (is_available !== undefined) update.is_available = is_available;
    if (specs) update.specs = JSON.stringify(specs);
    await db('computers').where({ id }).update(update);
    res.status(200).send({ message: 'Компьютер обновлён' });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

// ================== БРОНИ ==================
exports.createBookingForUser = async (req, res) => {
  const { user_id, computer_id, booking_date, start_time, end_time, kitchen_items } = req.body;
  // ... (оставь как было) ...
};

exports.cancelAnyBooking = async (req, res) => {
  const bookingId = req.params.id;
  try {
    await db('bookings').where({ id: bookingId }).update({ status: 'cancelled' });
    res.status(200).send({ message: 'Бронь отменена' });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

// Активация
exports.activateBooking = async (req, res) => {
  const { bookingId, code } = req.body;
  try {
    const booking = await db('bookings').where({ id: bookingId }).first();
    if (!booking) return res.status(404).send({ message: 'Бронь не найдена' });
    if (booking.status !== 'pending') return res.status(400).send({ message: 'Бронь уже активирована или отменена' });
    if (new Date() > new Date(booking.expires_at)) {
      await db('bookings').where({ id: bookingId }).update({ status: 'expired' });
      return res.status(400).send({ message: 'Время активации истекло' });
    }
    if (booking.activation_code !== code) {
      return res.status(400).send({ message: 'Неверный код активации' });
    }

    // Активируем бронь
    await db('bookings').where({ id: bookingId }).update({
      status: 'active',
      activation_code: null,
      expires_at: null,
    });

    // Получаем данные для уведомления
    const user = await db('users').where({ id: booking.user_id }).select('login').first();
    const computer = await db('computers').where({ id: booking.computer_id }).select('name').first();

    res.status(200).send({
      message: `Успешная активация кода доступа для места ${computer.name} пользователя ${user.login}`,
      alert: true,
    });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

exports.getPendingBookings = async (req, res) => {
  try {
    const pending = await db('bookings')
      .join('computers', 'bookings.computer_id', 'computers.id')
      .join('users', 'bookings.user_id', 'users.id')
      .where('bookings.status', 'pending')
      .where('bookings.expires_at', '>', new Date()) // только не истекшие
      .select(
        'bookings.id as booking_id',
        'users.login',
        'computers.name as computer_name',
        'bookings.activation_code',
        'bookings.expires_at'
      );
    res.status(200).send(pending);
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

exports.getActiveBookings = async (req, res) => {
  try {
    const bookings = await db('bookings')
      .join('computers', 'bookings.computer_id', 'computers.id')
      .join('users', 'bookings.user_id', 'users.id')
      .where('bookings.status', 'active')
      .select(
        'bookings.id as booking_id',
        'users.login',
        'computers.name as computer_name',
        'bookings.booking_date',
        'bookings.start_time',
        'bookings.end_time',
        'bookings.created_at'
      )
      .orderBy('bookings.start_time', 'asc');
    res.status(200).send(bookings);
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};
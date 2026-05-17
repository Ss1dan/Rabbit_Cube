const db = require('../config/db');
const bcrypt = require('bcrypt');

exports.getAllUsers = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;
  const search = req.query.search || '';

  try {
    // Строим общий запрос с пагинацией и поиском
    let query = db('users')
      .leftJoin('user_roles', 'users.id', 'user_roles.user_id')
      .leftJoin('roles', 'roles.id', 'user_roles.role_id')
      .select(
        'users.id', 'users.login', 'users.email', 'users.phone',
        'users.confirmed', 'users.created_at',
        db.raw(`COALESCE(json_agg(DISTINCT roles.name) FILTER (WHERE roles.name IS NOT NULL), '[]') as roles`)
      )
      .groupBy('users.id');

    if (search) {
      query = query.where(function () {
        this.where('users.login', 'ilike', `%${search}%`)
          .orWhere('users.email', 'ilike', `%${search}%`)
          .orWhere('users.phone', 'ilike', `%${search}%`);
      });
    }

    // Считаем общее количество с тем же фильтром
    const totalQuery = db('users');
    if (search) {
      totalQuery.where(function () {
        this.where('login', 'ilike', `%${search}%`)
          .orWhere('email', 'ilike', `%${search}%`)
          .orWhere('phone', 'ilike', `%${search}%`);
      });
    }
    const { count } = await totalQuery.count('id as count').first();
    const total = parseInt(count);

    const users = await query
      .orderBy('users.id', 'asc')
      .limit(limit)
      .offset(offset);

    res.status(200).send({
      users,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    });
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

exports.getActiveBookings = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 5;
  const offset = (page - 1) * limit;
  const search = req.query.search || '';

  try {
    let baseQuery = db('bookings')
      .join('computers', 'bookings.computer_id', 'computers.id')
      .join('users', 'bookings.user_id', 'users.id')
      .where('bookings.status', 'active');

    if (search) {
      baseQuery = baseQuery.where('users.login', 'ilike', `%${search}%`);
    }

    // Запрос для подсчёта
    const { count } = await baseQuery.clone().count('* as count').first();

    // Запрос для данных
    const bookings = await baseQuery
      .select(
        'bookings.id as booking_id',
        'users.login',
        'computers.name as computer_name',
        'bookings.booking_date',
        'bookings.start_time',
        'bookings.end_time'
      )
      .orderBy('users.login', 'asc')
      .limit(limit)
      .offset(offset);

    res.status(200).send({
      bookings,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
    });
  } catch (err) {
    console.error('getActiveBookings error:', err);
    res.status(500).send({ message: err.message });
  }
};

exports.getPendingBookings = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 5;
  const offset = (page - 1) * limit;
  const search = req.query.search || '';

  try {
    let baseQuery = db('bookings')
      .join('computers', 'bookings.computer_id', 'computers.id')
      .join('users', 'bookings.user_id', 'users.id')
      .where('bookings.status', 'pending')
      .where('bookings.expires_at', '>', new Date()); // только не истекшие

    if (search) {
      baseQuery = baseQuery.where('users.login', 'ilike', `%${search}%`);
    }

    // Запрос для подсчёта
    const { count } = await baseQuery.clone().count('* as count').first();

    // Запрос для данных
    const bookings = await baseQuery
      .select(
        'bookings.id as booking_id',
        'users.login',
        'computers.name as computer_name',
        'bookings.activation_code',
        'bookings.expires_at',
        'bookings.booking_date',
        'bookings.start_time',
        'bookings.end_time',
        'bookings.kitchen_items'
      )
      .orderBy('users.login', 'asc')
      .limit(limit)
      .offset(offset);

    res.status(200).send({
      bookings,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
    });
  } catch (err) {
    console.error('getPendingBookings error:', err);
    res.status(500).send({ message: err.message });
  }
};

exports.getKitchenItems = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;
  const search = req.query.search || '';

  try {
    let query = db('kitchen');
    let countQuery = db('kitchen');

    if (search) {
      query = query.where('name', 'ilike', `%${search}%`);
      countQuery = countQuery.where('name', 'ilike', `%${search}%`);
    }

    const [{ count }] = await countQuery.count('id as count');
    const total = parseInt(count);

    const items = await query
      .orderBy('id', 'asc')
      .limit(limit)
      .offset(offset);

    res.status(200).send({
      items,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

exports.getComputersPaginated = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;
  const search = req.query.search || '';
  const type = req.query.type || ''; // фильтр по типу

  try {
    let query = db('computers');
    let countQuery = db('computers');

    if (search) {
      query = query.where('name', 'ilike', `%${search}%`);
      countQuery = countQuery.where('name', 'ilike', `%${search}%`);
    }
    if (type && ['Standard', 'VIP', 'PS5'].includes(type)) {
      query = query.where('type', type);
      countQuery = countQuery.where('type', type);
    }

    const [{ count }] = await countQuery.count('id as count');
    const total = parseInt(count);

    const computers = await query
      .orderBy('id', 'asc')
      .limit(limit)
      .offset(offset);

    res.status(200).send({
      computers,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

exports.createBookingForUser = async (req, res) => {
  const {
    user_id, computer_id, booking_date, start_time, end_time, kitchen_items,
  } = req.body;

  // Валидация
  if (!user_id || !computer_id || !booking_date || !start_time || !end_time) {
    return res.status(400).send({ message: 'Не все поля заполнены' });
  }

  if (end_time <= start_time) {
    return res.status(400).send({ message: 'Время окончания должно быть позже времени начала' });
  }

  const bookingDateTime = new Date(`${booking_date}T${start_time}`);
  if (bookingDateTime < new Date()) {
    return res.status(400).send({ message: 'Нельзя бронировать на прошедшее время' });
  }

  try {
    // Проверка существования пользователя и компьютера
    const user = await db('users').where({ id: user_id }).first();
    if (!user) return res.status(400).send({ message: 'Пользователь не найден' });

    const computer = await db('computers').where({ id: computer_id }).first();
    if (!computer) return res.status(400).send({ message: 'Компьютер не найден' });

    // Проверка: у пользователя не должно быть активной или ожидающей брони
    const existingUserBooking = await db('bookings')
      .where({ user_id })
      .whereIn('status', ['active', 'pending'])
      .first();
    if (existingUserBooking) {
      return res.status(400).send({
        message: 'У этого пользователя уже есть активная или ожидающая активацию бронь. Сначала отмените её.',
      });
    }

    // Проверка конфликта времени для компьютера
    const conflict = await db('bookings')
      .where({ computer_id, booking_date })
      .whereIn('status', ['active', 'pending'])
      .where(function () {
        this.where('start_time', '<', end_time).andWhere('end_time', '>', start_time);
      })
      .first();
    if (conflict) {
      return res.status(409).send({ message: 'Это время уже занято для данного компьютера' });
    }

    // Генерируем код активации и срок
    const activationCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // +15 минут

    await db('bookings').insert({
      user_id,
      computer_id,
      booking_date,
      start_time,
      end_time,
      kitchen_items: JSON.stringify(kitchen_items || []),
      status: 'pending',
      activation_code: activationCode,
      expires_at: expiresAt,
    });

    res.status(201).send({
      message: 'Бронирование создано (ожидает активации)',
      activation_code: activationCode,
    });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

exports.getAllUsersFull = async (req, res) => {
  try {
    const users = await db('users')
      .leftJoin('user_roles', 'users.id', 'user_roles.user_id')
      .leftJoin('roles', 'roles.id', 'user_roles.role_id')
      .select(
        'users.id', 'users.login', 'users.email', 'users.phone',
        'users.confirmed', 'users.created_at',
        db.raw(`COALESCE(json_agg(DISTINCT roles.name) FILTER (WHERE roles.name IS NOT NULL), '[]') as roles`)
      )
      .groupBy('users.id')
      .orderBy('users.id', 'asc');
    res.status(200).send(users);
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

exports.getAllComputersFull = async (req, res) => {
  try {
    const computers = await db('computers')
      .select('*')
      .orderBy('id', 'asc');
    res.status(200).send(computers);
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};
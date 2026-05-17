const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const mailService = require('../services/mail.service');
const config = require('../config/auth.config');

exports.getProfile = async (req, res) => {
  try {
    const user = await db('users')
      .select('id', 'login', 'email', 'phone', 'avatar', 'mood', 'about')
      .where({ id: req.userId })
      .first();
    if (!user) return res.status(404).send({ message: 'Пользователь не найден' });

    const roles = await db('roles')
      .join('user_roles', 'roles.id', 'user_roles.role_id')
      .where('user_roles.user_id', req.userId)
      .pluck('roles.name');

    res.status(200).send({ ...user, roles });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

exports.updateProfile = async (req, res) => {
  const userId = req.userId;
  const { login, mood, phone, email, about, password } = req.body;

  try {
    if (login) {
      const existingLogin = await db('users')
        .where({ login })
        .whereNot({ id: userId })
        .first();
      if (existingLogin) return res.status(400).send({ message: 'Логин уже занят' });
    }

    const updateData = {};
    if (login !== undefined) updateData.login = login;
    if (mood !== undefined) updateData.mood = mood;
    if (phone !== undefined) updateData.phone = phone;
    if (about !== undefined) updateData.about = about;

    if (req.file) {
      updateData.avatar = req.file.filename;
    }

    let emailChanged = false;
    if (email) {
      const currentUser = await db('users').where({ id: userId }).select('email').first();
      if (currentUser.email !== email) {
        const existingEmail = await db('users').where({ email }).whereNot({ id: userId }).first();
        if (existingEmail) return res.status(400).send({ message: 'Email уже используется' });

        emailChanged = true;
        const token = jwt.sign({ userId, newEmail: email }, config.secret, { expiresIn: '1h' });
        await mailService.sendEmailChangeConfirmation(email, token);
      } else {
        updateData.email = email;
      }
    }

    let passwordChanged = false;
    if (password) {
      if (password.length < 4) return res.status(400).send({ message: 'Пароль должен быть не менее 4 символов' });
      const hashedPassword = await bcrypt.hash(password, 10);
      await db('users').where({ id: userId }).update({ pending_password: hashedPassword });

      const user = await db('users').where({ id: userId }).select('email').first();
      const token = jwt.sign({ userId, type: 'password' }, config.secret, { expiresIn: '1h' });
      await mailService.sendPasswordChangeConfirmation(user.email, token);
      passwordChanged = true;
    }

    if (Object.keys(updateData).length > 0) {
      await db('users').where({ id: userId }).update(updateData);
    }

    const updatedUser = await db('users')
      .select('id', 'login', 'email', 'phone', 'avatar', 'mood', 'about')
      .where({ id: userId })
      .first();

    const response = {
      message: 'Профиль обновлён',
      user: updatedUser,
    };
    if (emailChanged) response.emailPending = true;
    if (passwordChanged) response.passwordPending = true;

    res.status(200).send(response);
  } catch (err) {
    console.error('Update profile error:', err);
    res.status(500).send({ message: err.message });
  }
};

exports.confirmEmailChange = async (req, res) => {
  const { token } = req.body;
  if (!token) return res.status(400).send({ message: 'Токен не предоставлен' });
  try {
    const decoded = jwt.verify(token, config.secret);
    const { userId, newEmail } = decoded;
    const existing = await db('users').where({ email: newEmail }).whereNot({ id: userId }).first();
    if (existing) return res.status(400).send({ message: 'Этот email уже используется' });
    await db('users').where({ id: userId }).update({ email: newEmail });
    const user = await db('users')
      .select('id', 'login', 'email', 'phone', 'avatar', 'mood', 'about')
      .where({ id: userId })
      .first();
    res.status(200).send({ message: 'Email изменён', user });
  } catch (err) {
    if (err.name === 'TokenExpiredError') return res.status(400).send({ message: 'Срок действия ссылки истёк' });
    res.status(400).send({ message: 'Недействительный токен' });
  }
};

exports.confirmPasswordChange = async (req, res) => {
  const { token } = req.body;
  if (!token) return res.status(400).send({ message: 'Токен не предоставлен' });
  try {
    const decoded = jwt.verify(token, config.secret);
    if (decoded.type !== 'password') throw new Error('Invalid token type');
    const userId = decoded.userId;
    const user = await db('users').where({ id: userId }).select('pending_password').first();
    if (!user.pending_password) return res.status(400).send({ message: 'Нет ожидающего подтверждения пароля' });
    await db('users').where({ id: userId }).update({
      password: user.pending_password,
      pending_password: null,
    });
    res.status(200).send({ message: 'Пароль успешно изменён' });
  } catch (err) {
    if (err.name === 'TokenExpiredError') return res.status(400).send({ message: 'Срок действия ссылки истёк' });
    res.status(400).send({ message: 'Недействительный токен' });
  }
};

exports.getBookingHistory = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = 4;
  const offset = (page - 1) * limit;

  try {
    const total = await db('bookings')
      .where({ user_id: req.userId })
      .count('id as count')
      .first();
    const totalPages = Math.ceil(total.count / limit);

    const history = await db('bookings')
      .join('computers', 'bookings.computer_id', 'computers.id')
      .where('bookings.user_id', req.userId)
      .orderBy('bookings.booking_date', 'desc')
      .orderBy('bookings.start_time', 'desc')
      .limit(limit)
      .offset(offset)
      .select(
        'bookings.*',
        'computers.name as computer_name',
        'computers.type as computer_type',
        'computers.specs'
      );

    res.status(200).send({ history, totalPages, currentPage: page });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

exports.cancelBooking = async (req, res) => {
  const bookingId = req.params.id;
  try {
    const booking = await db('bookings').where({ id: bookingId }).first();
    if (!booking) return res.status(404).send({ message: 'Бронь не найдена' });
    if (booking.user_id !== req.userId) {
      const isAdmin = await db('user_roles')
        .join('roles', 'roles.id', 'user_roles.role_id')
        .where('user_roles.user_id', req.userId)
        .where('roles.name', 'Admin')
        .first();
      if (!isAdmin) return res.status(403).send({ message: 'Вы не можете отменить чужую бронь' });
    }
    await db('bookings').where({ id: bookingId }).update({ status: 'cancelled' });
    res.status(200).send({ message: 'Бронь отменена' });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};
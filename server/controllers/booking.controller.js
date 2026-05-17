const db = require('../config/db');
const mailService = require('../services/mail.service');

exports.createBooking = async (req, res) => {
  const { computer_id, booking_date, start_time, end_time, kitchen_items } = req.body;
  const userId = req.userId;

  // Валидация
  if (!computer_id || !booking_date || !start_time || !end_time) {
    return res.status(400).send({ message: 'Не все поля заполнены' });
  }

  // Проверка на прошедшее время
  const now = new Date();
  const bookingDateTime = new Date(`${booking_date}T${start_time}`);
  if (bookingDateTime < now) {
    return res.status(400).send({ message: 'Нельзя бронировать на прошедшее время' });
  }
  if (end_time <= start_time) {
    return res.status(400).send({ message: 'Время окончания должно быть позже времени начала' });
  }

  try {
    // Проверка: у пользователя не должно быть активной или ожидающей брони
    const existingBooking = await db('bookings')
      .where({ user_id: userId })
      .whereIn('status', ['active', 'pending'])
      .first();
    if (existingBooking) {
      return res.status(409).send({ message: 'У вас уже есть активная или ожидающая бронь. Сначала отмените её.' });
    }

    // Проверка конфликтов по времени для компьютера
    const conflict = await db('bookings')
      .where({ computer_id, booking_date })
      .whereIn('status', ['active', 'pending'])
      .where(function() {
        this.where('start_time', '<', end_time).andWhere('end_time', '>', start_time);
      })
      .first();
    if (conflict) {
      return res.status(409).send({ message: 'Это время уже занято' });
    }

    // Генерируем код активации и срок
    const activationCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // +15 минут

    const [bookingId] = await db('bookings').insert({
      user_id: userId,
      computer_id,
      booking_date,
      start_time,
      end_time,
      kitchen_items: JSON.stringify(kitchen_items || []),
      status: 'pending',
      activation_code: activationCode,
      expires_at: expiresAt,
    }).returning('id');

    // Отправляем код активации в ответе
    res.status(201).send({
      message: 'Бронирование создано (ожидает активации)',
      activationCode: activationCode,
    });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

exports.getActiveBooking = async (req, res) => {
  try {
    // Автоматически помечаем просроченные ожидающие брони как истекшие
    await db('bookings')
      .where('status', 'pending')
      .andWhere('expires_at', '<', new Date())
      .update({ status: 'expired', activation_code: null, expires_at: null });

    // Ищем любую бронь со статусом active или pending для текущего пользователя
    const booking = await db('bookings')
      .join('computers', 'bookings.computer_id', 'computers.id')
      .where('bookings.user_id', req.userId)
      .whereIn('bookings.status', ['active', 'pending'])
      .orderBy('bookings.created_at', 'desc')
      .first()
      .select(
        'bookings.*',
        'computers.name as computer_name',
        'computers.type as computer_type',
        'computers.specs'
      );

    if (!booking) {
      return res.status(404).send({ message: 'Нет активных или ожидающих бронирований' });
    }
    res.status(200).send(booking);
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};
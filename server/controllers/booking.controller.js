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
    // Проверка: у пользователя может быть только одна активная бронь
    const activeBooking = await db('bookings')
      .where({ user_id: userId, status: 'active' })
      .first();

    if (activeBooking) {
      // Можно либо запретить новую бронь, либо отменить старую. Сейчас запретим.
      return res.status(409).send({
        message: 'У вас уже есть активная бронь. Сначала отмените текущую бронь.'
      });
    }

    // Проверка конфликтов по времени для компьютера
    const conflict = await db('bookings')
      .where({ computer_id, booking_date, status: 'active' })
      .where(function() {
        this.where('start_time', '<', end_time).andWhere('end_time', '>', start_time);
      })
      .first();
    if (conflict) {
      return res.status(409).send({ message: 'Это время уже занято' });
    }

    const [bookingId] = await db('bookings').insert({
      user_id: userId,
      computer_id,
      booking_date,
      start_time,
      end_time,
      kitchen_items: JSON.stringify(kitchen_items || []),
      status: 'active'
    }).returning('id');

    // Получить информацию для письма
    const computer = await db('computers').where({ id: computer_id }).first();
    const user = await db('users').where({ id: userId }).first();

    try {
      await mailService.sendBookingConfirmation(user.email, {
        booking_date,
        start_time,
        end_time,
        computer_name: computer.name
      });
    } catch (mailErr) {
      console.error('Ошибка отправки уведомления:', mailErr);
    }

    res.status(201).send({ message: 'Бронирование создано', bookingId });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

exports.getActiveBooking = async (req, res) => {
  try {
    const booking = await db('bookings')
      .join('computers', 'bookings.computer_id', 'computers.id')
      .where('bookings.user_id', req.userId)
      .where('bookings.status', 'active')
      .orderBy('bookings.booking_date', 'asc')
      .first()
      .select(
        'bookings.*',
        'computers.name as computer_name',
        'computers.type as computer_type',
        'computers.specs'
      );
    if (!booking) {
      return res.status(404).send({ message: 'Нет активных бронирований' });
    }
    res.status(200).send(booking);
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};
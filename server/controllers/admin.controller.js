const db = require('../config/db');
const bcrypt = require('bcrypt');

exports.getAllUsers = async (req, res) => {
  try {
    const users = await db('users')
      .select('id', 'login', 'email', 'phone', 'confirmed', 'created_at');
    res.status(200).send(users);
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

exports.createBookingForUser = async (req, res) => {
  const { user_id, computer_id, booking_date, start_time, end_time, kitchen_items } = req.body;
  // Аналогично createBooking, но user_id передаётся админом
  try {
    const conflict = await db('bookings')
      .where({ computer_id, booking_date, status: 'active' })
      .where(function() {
        this.where('start_time', '<', end_time).andWhere('end_time', '>', start_time);
      })
      .first();
    if (conflict) return res.status(409).send({ message: 'Время занято' });

    await db('bookings').insert({
      user_id,
      computer_id,
      booking_date,
      start_time,
      end_time,
      kitchen_items: JSON.stringify(kitchen_items || []),
      status: 'active'
    });
    res.status(201).send({ message: 'Бронирование создано админом' });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

exports.cancelAnyBooking = async (req, res) => {
  try {
    const bookingId = req.params.id;
    await db('bookings').where({ id: bookingId }).update({ status: 'cancelled' });
    res.status(200).send({ message: 'Бронь отменена' });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

exports.updatePrice = async (req, res) => {
  const { type, price } = req.body;
  try {
    await db('price_rates').where({ computer_type: type }).update({ price });
    // Также обновить цену у компьютеров этого типа
    await db('computers').where({ type }).update({ price_per_hour: price });
    res.status(200).send({ message: 'Цена обновлена' });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

exports.updateKitchenItem = async (req, res) => {
  const { id, price } = req.body;
  try {
    await db('kitchen').where({ id }).update({ price });
    res.status(200).send({ message: 'Цена блюда обновлена' });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

exports.getFreeComputers = async (req, res) => {
  const { date, start_time, end_time } = req.query;
  try {
    const occupiedIds = await db('bookings')
      .where('booking_date', date)
      .where('status', 'active')
      .where(function() {
        this.where('start_time', '<', end_time).andWhere('end_time', '>', start_time);
      })
      .pluck('computer_id');
    const freeComputers = await db('computers')
      .whereNotIn('id', occupiedIds)
      .select('id', 'name', 'type');
    res.status(200).send(freeComputers);
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};
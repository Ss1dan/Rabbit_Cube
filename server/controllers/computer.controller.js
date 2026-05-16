const db = require('../config/db');

exports.getAllComputers = async (req, res) => {
  try {
    const computers = await db('computers').select('*');
    res.status(200).send(computers);
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

exports.getComputerById = async (req, res) => {
  try {
    const computer = await db('computers').where({ id: req.params.id }).first();
    if (!computer) return res.status(404).send({ message: 'Компьютер не найден' });
    res.status(200).send(computer);
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

// Получить занятые места на конкретную дату и время
exports.getOccupiedForSlot = async (req, res) => {
  const { date, start_time, end_time } = req.query;
  try {
    const occupied = await db('bookings')
      .where('booking_date', date)
      .where('status', 'active')
      .where(function() {
        this.where('start_time', '<', end_time).andWhere('end_time', '>', start_time);
      })
      .pluck('computer_id');
    res.status(200).send(occupied);
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};
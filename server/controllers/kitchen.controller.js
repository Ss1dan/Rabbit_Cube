const db = require('../config/db');

exports.getAllItems = async (req, res) => {
  try {
    const items = await db('kitchen').select('*');
    res.status(200).send(items);
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};
const db = require('../config/db');

checkDuplicateUsernameOrEmail = async (req, res, next) => {
  try {
    const userByLogin = await db('users').where({ login: req.body.login }).first();
    if (userByLogin) {
      return res.status(400).send({ message: 'Ошибка. Имя пользователя уже занято!' });
    }

    const userByEmail = await db('users').where({ email: req.body.email }).first();
    if (userByEmail) {
      return res.status(400).send({ message: 'Ошибка. Email уже используется!' });
    }
    next();
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

checkRolesExisted = (req, res, next) => {
  if (req.body.roles) {
    const allowedRoles = ['User', 'Admin'];
    for (let i = 0; i < req.body.roles.length; i++) {
      if (!allowedRoles.includes(req.body.roles[i])) {
        return res.status(400).send({ message: `Ошибка! Роль ${req.body.roles[i]} не существует` });
      }
    }
  }
  next();
};

const verifySignUp = {
  checkDuplicateUsernameOrEmail,
  checkRolesExisted
};

module.exports = verifySignUp;
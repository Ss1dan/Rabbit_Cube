const jwt = require('jsonwebtoken');
const config = require('../config/auth.config');
const db = require('../config/db');

verifyToken = (req, res, next) => {
  let token = req.headers['x-access-token'] || req.headers['authorization'];
  if (!token) {
    return res.status(403).send({ message: 'Токен не предоставлен' });
  }
  if (token.startsWith('Bearer ')) {
    token = token.slice(7, token.length);
  }

  jwt.verify(token, config.secret, (err, decoded) => {
    if (err) {
      return res.status(401).send({ message: 'Недействительный токен' });
    }
    req.userId = decoded.id;
    next();
  });
};

isAdmin = async (req, res, next) => {
  try {
    const user = await db('users')
      .join('user_roles', 'users.id', 'user_roles.user_id')
      .join('roles', 'roles.id', 'user_roles.role_id')
      .where('users.id', req.userId)
      .where('roles.name', 'Admin')
      .first();
    if (user) {
      next();
      return;
    }
    res.status(403).send({ message: 'Требуется роль администратора' });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

const authJwt = {
  verifyToken,
  isAdmin
};

module.exports = authJwt;
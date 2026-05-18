const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const mailService = require('../services/mail.service');
const config = require('../config/auth.config');
const { OAuth2Client } = require('google-auth-library');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Вход через Google
exports.googleAuth = async (req, res) => {
    const { token } = req.body;
    if (!token) return res.status(400).send({ message: 'Токен не предоставлен' });

    try {
        const ticket = await googleClient.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        const { email, name, picture } = payload;

        let user = await db('users').where({ email }).first();
        if (!user) {
            const [newUser] = await db('users').insert({
                login: name || email.split('@')[0],
                email,
                phone: '',
                password: '',
                confirmed: true,
                avatar: picture || 'default.png'
            }).returning('id');
            const userId = newUser.id;

            const userRole = await db('roles').where({ name: 'User' }).first();
            await db('user_roles').insert({ user_id: userId, role_id: userRole.id });

            user = await db('users').where({ id: userId }).first();
        }

        const jwtToken = jwt.sign({ id: user.id }, config.secret, { expiresIn: '24h' });
        const roles = await db('roles')
            .join('user_roles', 'roles.id', 'user_roles.role_id')
            .where('user_roles.user_id', user.id)
            .pluck('roles.name');

        res.status(200).send({
            id: user.id,
            login: user.login,
            email: user.email,
            roles,
            accessToken: jwtToken
        });
    } catch (err) {
        console.error('Google auth error:', err);
        res.status(401).send({ message: 'Недействительный токен Google' });
    }
};

// Регистрация
exports.signup = async (req, res) => {
  const { login, email, phone, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const [userRecord] = await db('users').insert({
      login,
      email,
      phone: phone || '',
      password: hashedPassword,
      avatar: 'default-avatar.png',
    }).returning('id');

    const userId = userRecord.id;
    const userRole = await db('roles').where({ name: 'User' }).first();
    await db('user_roles').insert({ user_id: userId, role_id: userRole.id });

    // Генерируем токен подтверждения
    const token = jwt.sign({ id: userId }, config.secret, { expiresIn: '1d' });
    
    // Выводим ссылку в консоль Railway
    const confirmationLink = `${process.env.CLIENT_URL || 'http://localhost:3000'}/confirm?token=${token}`;
    console.log(`\n[MAIL] Подтверждение регистрации для ${email}`);
    console.log(`Ссылка: ${confirmationLink}\n`);

    // Возвращаем токен клиенту, чтобы показать в alert
    res.status(201).send({ 
      message: 'Регистрация успешна. Подтвердите почту. (Из-за бесплатного тарифа, нет возможности сделать нормально отправку через почту)',
      confirmationToken: token,
    });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

// Авторизация
exports.signin = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await db('users').where({ email }).first();
        if (!user) return res.status(404).send({ message: 'Пользователь не найден' });

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) return res.status(401).send({ message: 'Неверный пароль' });

        if (!user.confirmed) return res.status(403).send({ message: 'Почта не подтверждена' });

        const token = jwt.sign({ id: user.id }, config.secret, { expiresIn: '24h' });
        const roles = await db('roles')
            .join('user_roles', 'roles.id', 'user_roles.role_id')
            .where('user_roles.user_id', user.id)
            .pluck('roles.name');

        res.status(200).send({
            id: user.id,
            login: user.login,
            email: user.email,
            roles,
            accessToken: token
        });
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};

// Подтверждение email
exports.confirmEmail = async (req, res) => {
    const { token } = req.body;
    if (!token) return res.status(400).send({ message: 'Токен не предоставлен' });
    try {
      const decoded = jwt.verify(token, config.secret);
      await db('users').where({ id: decoded.id }).update({ confirmed: true });
  
      // Генерируем новый JWT для автоматического входа
      const accessToken = jwt.sign({ id: decoded.id }, config.secret, { expiresIn: '24h' });
  
      // Получаем роли пользователя
      const roles = await db('roles')
        .join('user_roles', 'roles.id', 'user_roles.role_id')
        .where('user_roles.user_id', decoded.id)
        .pluck('roles.name');
  
      // Получаем основные данные пользователя
      const user = await db('users')
        .select('id', 'login', 'email')
        .where({ id: decoded.id })
        .first();
  
      res.status(200).send({
        message: 'Почта подтверждена',
        accessToken,
        roles,
        user
      });
    } catch (err) {
      res.status(400).send({ message: 'Недействительный токен' });
    }
  };

  // Запрос на сброс пароля
exports.forgotPassword = async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).send({ message: 'Email обязателен' });
  
    try {
      const user = await db('users').where({ email }).first();
      // Не сообщаем, есть ли такой пользователь, по соображениям безопасности
      if (user) {
        // Генерируем одноразовый токен на 1 час
        const token = jwt.sign({ id: user.id, type: 'reset' }, config.secret, { expiresIn: '1h' });
        await mailService.sendPasswordReset(email, token);
      }
      // Всегда отвечаем одинаково, чтобы не раскрывать существование email
      res.status(200).send({ message: 'Если такой email зарегистрирован, на него отправлена инструкция' });
    } catch (err) {
      console.error('Forgot password error:', err);
      res.status(500).send({ message: 'Ошибка сервера' });
    }
  };
  
  // Сброс пароля
  exports.resetPassword = async (req, res) => {
    const { token, password } = req.body;
    if (!token || !password) return res.status(400).send({ message: 'Токен и новый пароль обязательны' });
  
    try {
      const decoded = jwt.verify(token, config.secret);
      if (decoded.type !== 'reset') {
        return res.status(400).send({ message: 'Недействительный токен' });
      }
  
      const hashedPassword = await bcrypt.hash(password, 10);
      await db('users').where({ id: decoded.id }).update({ password: hashedPassword });
  
      res.status(200).send({ message: 'Пароль успешно изменён' });
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(400).send({ message: 'Срок действия ссылки истёк' });
      }
      res.status(400).send({ message: 'Недействительный токен' });
    }
  };
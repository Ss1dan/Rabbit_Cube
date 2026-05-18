require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const winston = require('./utils/logger');
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const computerRoutes = require('./routes/computer.routes');
const bookingRoutes = require('./routes/booking.routes');
const adminRoutes = require('./routes/admin.routes');
const kitchenRoutes = require('./routes/kitchen.routes');

const knexConfig = require('./config/knexfile');
const knex = require('knex')(knexConfig.development);

// Сразу закрываем просроченные брони при старте
(async () => {
  try {
    const updated = await knex('bookings')
      .where('status', 'active')
      .whereRaw("(booking_date || ' ' || end_time)::timestamp < now()")
      .update({ status: 'completed' });
    if (updated) console.log(`Закрыто просроченных броней: ${updated}`);
  } catch (err) {
    console.error('Ошибка при закрытии просроченных броней:', err);
  }
})();

// Затем каждые 10 секунд проверяем
setInterval(async () => {
  try {
    await knex('bookings')
      .where('status', 'active')
      .whereRaw("(booking_date || ' ' || end_time)::timestamp < now()")
      .update({ status: 'completed' });
  } catch (err) {
    console.error('Ошибка авто-закрытия броней:', err);
  }
}, 10000);

(async () => {
  try {
    console.log('Проверяю базу данных...');
    await knex.raw('SELECT 1');
    console.log('База доступна.');

    const [migrations] = await knex.migrate.latest();
    if (migrations.length) {
      console.log(`Применено новых миграций: ${migrations.length}`);
    } else {
      console.log('Новых миграций нет.');
    }

    const rolesCount = await knex('roles').count('id as count').first();
    if (!rolesCount.count || rolesCount.count == 0) {
      console.log('Запускаю сиды...');
      await knex.seed.run();
      console.log('Сиды выполнены.');
    } else {
      console.log('Сиды уже были запущены.');
    }
  } catch (err) {
    console.error('Ошибка миграции/БД, но сервак работает:', err.message);
  }
})();

const app = express();

// Middleware
if (process.env.NODE_ENV === 'production') {
  app.use(cors());
} else {
  app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:3000', credentials: true }));
}

app.use(express.json());
const fs = require('fs');
const uploadsDir = path.join(__dirname, 'uploads', 'avatars');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined', { stream: { write: message => winston.http(message.trim()) } }));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/computers', computerRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/kitchen', kitchenRoutes);
// Временно разрешим все origins (потом замените на конкретный)
app.use(cors({ origin: process.env.CLIENT_URL || '*' }));

//if (process.env.NODE_ENV === 'production') {
//  app.use(express.static(path.join(__dirname, 'public')));
//  app.get('*', (req, res) => {
//    res.sendFile(path.join(__dirname, 'public', 'index.html'));
//  });
//}

// Обработка ошибок
app.use((err, req, res, next) => {
  winston.error(err.stack);
  res.status(500).send({ message: 'Внутренняя ошибка сервера' });
});

app.get('/', (req, res) => {
  res.json({ message: 'Rabbit Cube API is running' });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  winston.info(`Сервер запущен на порту ${PORT}`);
});
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

const app = express();

// Middleware
if (process.env.NODE_ENV === 'production') {
  app.use(cors());
} else {
  app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:3000', credentials: true }));
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined', { stream: { write: message => winston.http(message.trim()) } }));

// Статические файлы (аватары)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API-роуты
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/computers', computerRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/kitchen', kitchenRoutes);

// В production отдаём собранный React
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
  });
}

// Обработка ошибок
app.use((err, req, res, next) => {
  winston.error(err.stack);
  res.status(500).send({ message: 'Внутренняя ошибка сервера' });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  winston.info(`Сервер запущен на порту ${PORT}`);
});
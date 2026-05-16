const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  host: 'smtp.mail.ru',
  port: 465,
  secure: true,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS
  }
});

exports.sendConfirmation = async (to, token) => {
  const link = `${process.env.CLIENT_URL}/confirm?token=${token}`;
  await transporter.sendMail({
    from: `Rabbit Cube <${process.env.MAIL_USER}>`,
    to,
    subject: 'Подтверждение регистрации',
    html: `
      <h2>Добро пожаловать в Rabbit Cube!</h2>
      <p>Для подтверждения аккаунта перейдите по ссылке:</p>
      <a href="${link}">${link}</a>
    `
  });
};

exports.sendBookingConfirmation = async (to, booking) => {
  await transporter.sendMail({
    from: `Rabbit Cube <${process.env.MAIL_USER}>`,
    to,
    subject: 'Бронирование подтверждено',
    html: `
      <h2>Бронирование успешно создано</h2>
      <p>Дата: ${booking.booking_date}</p>
      <p>Время: ${booking.start_time} - ${booking.end_time}</p>
      <p>Компьютер: ${booking.computer_name}</p>
    `
  });
};

exports.sendPasswordReset = async (to, token) => {
  const link = `${process.env.CLIENT_URL}/reset-password?token=${token}`;
  await transporter.sendMail({
    from: `Rabbit Cube <${process.env.MAIL_USER}>`,
    to,
    subject: 'Восстановление пароля',
    html: `
      <h2>Восстановление пароля</h2>
      <p>Для сброса пароля перейдите по ссылке:</p>
      <a href="${link}">${link}</a>
      <p>Ссылка действительна 1 час.</p>
    `
  });
};

exports.sendEmailChangeConfirmation = async (to, token) => {
  const link = `${process.env.CLIENT_URL}/confirm-email-change?token=${token}`;
  await transporter.sendMail({
    from: `Rabbit Cube <${process.env.MAIL_USER}>`,
    to,
    subject: 'Подтверждение смены email',
    html: `
      <h2>Подтвердите новый email</h2>
      <p>Вы запросили смену email на этот адрес. Для подтверждения перейдите по ссылке:</p>
      <a href="${link}">${link}</a>
      <p>Ссылка действительна 1 час.</p>
    `
  });
};

exports.sendPasswordChangeConfirmation = async (to, token) => {
  const link = `${process.env.CLIENT_URL}/confirm-password-change?token=${token}`;
  await transporter.sendMail({
    from: `Rabbit Cube <${process.env.MAIL_USER}>`,
    to,
    subject: 'Подтверждение смены пароля',
    html: `
      <h2>Подтвердите смену пароля</h2>
      <p>Вы запросили смену пароля. Для подтверждения перейдите по ссылке:</p>
      <a href="${link}">${link}</a>
      <p>Ссылка действительна 1 час.</p>
    `
  });
};
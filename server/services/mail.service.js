const formData = require('form-data');
const Mailgun = require('mailgun.js');
const mailgun = new Mailgun(formData);

const mg = process.env.MAILGUN_API_KEY
  ? mailgun.client({
      username: 'api',
      key: process.env.MAILGUN_API_KEY,
    })
  : null;

const sendOrLog = async (mailOptions) => {
  if (mg) {
    try {
      const result = await mg.messages.create(process.env.MAILGUN_DOMAIN, {
        from: mailOptions.from,
        to: mailOptions.to,
        subject: mailOptions.subject,
        html: mailOptions.html,
      });
      console.log('[MAIL] Успешно отправлено:', result);
    } catch (err) {
      console.error('[MAIL] Ошибка отправки через Mailgun:', err.message);
    }
  } else {
    console.log(`[MAIL] (Mailgun не настроен) To: ${mailOptions.to}`);
    console.log(`[MAIL] Subject: ${mailOptions.subject}`);
    console.log(`[MAIL] HTML: ${mailOptions.html}`);
  }
};

exports.sendConfirmation = async (to, token) => {
  const link = `${process.env.CLIENT_URL || 'http://localhost:3000'}/confirm?token=${token}`;
  await sendOrLog({
    from: 'Rabbit Cube <noreply@rabbitcube.ru>',
    to,
    subject: 'Подтверждение регистрации',
    html: `<h2>Добро пожаловать!</h2><p>Перейдите по ссылке: <a href="${link}">${link}</a></p>`,
  });
};

exports.sendBookingConfirmation = async (to, booking) => {
  await sendOrLog({
    from: 'Rabbit Cube <noreply@rabbitcube.ru>',
    to,
    subject: 'Бронирование подтверждено',
    html: `<p>Дата: ${booking.booking_date}</p><p>Время: ${booking.start_time} – ${booking.end_time}</p><p>Компьютер: ${booking.computer_name}</p>`,
  });
};

exports.sendPasswordReset = async (to, token) => {
  const link = `${process.env.CLIENT_URL || 'http://localhost:3000'}/reset-password?token=${token}`;
  await sendOrLog({
    from: 'Rabbit Cube <noreply@rabbitcube.ru>',
    to,
    subject: 'Восстановление пароля',
    html: `<p>Для сброса пароля перейдите по ссылке: <a href="${link}">${link}</a></p>`,
  });
};

exports.sendEmailChangeConfirmation = async (to, token) => {
  const link = `${process.env.CLIENT_URL || 'http://localhost:3000'}/confirm-email-change?token=${token}`;
  await sendOrLog({
    from: 'Rabbit Cube <noreply@rabbitcube.ru>',
    to,
    subject: 'Подтверждение смены email',
    html: `<p>Для подтверждения перейдите по ссылке: <a href="${link}">${link}</a></p>`,
  });
};

exports.sendPasswordChangeConfirmation = async (to, token) => {
  const link = `${process.env.CLIENT_URL || 'http://localhost:3000'}/confirm-password-change?token=${token}`;
  await sendOrLog({
    from: 'Rabbit Cube <noreply@rabbitcube.ru>',
    to,
    subject: 'Подтверждение смены пароля',
    html: `<p>Для подтверждения перейдите по ссылке: <a href="${link}">${link}</a></p>`,
  });
};
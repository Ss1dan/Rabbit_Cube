const { Resend } = require('resend');

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

  const sendOrLog = async (mailOptions) => {
    if (resend) {
      try {
        const result = await resend.emails.send({
          from: mailOptions.from,
          to: mailOptions.to,
          subject: mailOptions.subject,
          html: mailOptions.html,
        });
        console.log('[MAIL] Успешно отправлено:', result);
      } catch (err) {
        console.error('[MAIL] Ошибка при отправке через Resend:', err.message);
      }
    } else {
      console.log(`[MAIL] (Resend не настроен) To: ${mailOptions.to}`);
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
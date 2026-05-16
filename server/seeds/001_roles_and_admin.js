const bcrypt = require('bcrypt');

exports.seed = async function(knex) {
  // Удаляем все записи (порядок важен из-за внешних ключей)
  await knex('user_roles').del();
  await knex('roles').del();
  await knex('users').del();

  // Вставляем роли
  await knex('roles').insert([
    { id: 1, name: 'User' },
    { id: 2, name: 'Admin' }
  ]);

  // Хешируем пароль администратора
  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  // Вставляем администратора и сразу получаем его id
  const [adminUser] = await knex('users').insert({
    login: 'admin',
    email: 'admin@rabbit.ru',
    phone: '+79008002555',
    password: hashedPassword,
    confirmed: true
  }).returning('id');

  // Привязываем роль Admin
  await knex('user_roles').insert({ user_id: adminUser.id, role_id: 2 });
};
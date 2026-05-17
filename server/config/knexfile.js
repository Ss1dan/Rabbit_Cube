const path = require('path');

function getConnection() {
  // Railway предоставляет DATABASE_URL
  if (process.env.DATABASE_URL) {
    const { URL } = require('url');
    const dbUrl = new URL(process.env.DATABASE_URL);
    return {
      host: dbUrl.hostname,
      port: parseInt(dbUrl.port || '5432', 10),
      user: dbUrl.username,
      password: dbUrl.password,
      database: dbUrl.pathname.replace('/', ''),
    };
  }

  // Railway может давать отдельные переменные
  if (process.env.PGHOST) {
    return {
      host: process.env.PGHOST,
      port: parseInt(process.env.PGPORT || '5432', 10),
      user: process.env.PGUSER,
      password: process.env.PGPASSWORD,
      database: process.env.PGDATABASE,
    };
  }

  // Локальная разработка
  require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
  return {
    host: process.env.DB_HOST || '127.0.0.1',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'rabbit_cube',
  };
}

module.exports = {
  development: {
    client: 'pg',
    connection: getConnection(),
    migrations: {
      directory: path.resolve(__dirname, '../migrations'),
    },
    seeds: {
      directory: path.resolve(__dirname, '../seeds'),
    },
  },
};
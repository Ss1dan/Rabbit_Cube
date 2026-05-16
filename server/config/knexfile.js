const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

module.exports = {
  development: {
    client: 'pg',
    connection: {
      host: process.env.DB_HOST || '127.0.0.1',
      port: process.env.DB_PORT || 5432,
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_NAME || 'rabbit_cube'
    },
    migrations: {
      directory: path.resolve(__dirname, '../migrations')
    },
    seeds: {
      directory: path.resolve(__dirname, '../seeds')
    }
  }
};
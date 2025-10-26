const mysql = require('mysql2');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'viper',
  database: process.env.DB_NAME || 'professional_network',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Promisify pool for async/await
const promisePool = pool.promise();

module.exports = promisePool;

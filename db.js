require('dotenv').config();
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'sql12.freesqldatabase.com',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'sql12794397',
  password: process.env.DB_PASSWORD || 'FvglTqaAUl',
  database: process.env.DB_NAME || 'sql12794397',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = pool;

const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME,      // database name
  process.env.DB_USER,      // username
  process.env.DB_PASSWORD,  // password
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT, // add port for PostgreSQL
    dialect: 'postgres',      // changed from mysql to postgres
    logging: false
  }
);


module.exports = sequelize;

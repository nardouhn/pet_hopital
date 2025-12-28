const { Sequelize } = require("sequelize");
require("dotenv").config();

// Khởi tạo Sequelize instance
const sequelize = new Sequelize(
  process.env.PGDATABASE, // Tên DB
  process.env.PGUSER,     // Username
  process.env.PGPASSWORD, // Password
  {
    host: process.env.PGHOST,
    port: process.env.PGPORT || 5432,
    dialect: "postgres",
    logging: false, // Tắt log SQL ra console
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

module.exports = { sequelize }; // Chỉ cần export instance này
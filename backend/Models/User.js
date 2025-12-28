const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const User = sequelize.define("User", {
  user_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  first_name: DataTypes.STRING(100),
  last_name: DataTypes.STRING(100),
  email: { type: DataTypes.STRING(150), allowNull: false, unique: true },
  password: { type: DataTypes.STRING(255), allowNull: false },
  user_type: { type: DataTypes.ENUM("admin","customer"), defaultValue: "customer" },
  phone: DataTypes.STRING(20),
  address: DataTypes.STRING(255),
  city: DataTypes.STRING(100),
  country: DataTypes.STRING(100),
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, {
  tableName: "users",
  timestamps: false
});

module.exports = User;

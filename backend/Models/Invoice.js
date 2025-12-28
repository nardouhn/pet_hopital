const { DataTypes } = require("sequelize");
const {sequelize} = require("../config/db");
const User = require("./User");

const Invoice = sequelize.define("Invoice", {
  invoice_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  ser_name: DataTypes.STRING(100),
  ser_qty: DataTypes.INTEGER,
  ser_price: DataTypes.NUMERIC(10,2),
  ser_desc: DataTypes.TEXT,
  med_name: DataTypes.STRING(100),
  med_qty: DataTypes.INTEGER,
  med_price: DataTypes.NUMERIC(10,2),
  med_desc: DataTypes.TEXT,
  total: DataTypes.NUMERIC(12,2),
  date: DataTypes.DATEONLY,
  note: DataTypes.TEXT,
  user_id: { type: DataTypes.INTEGER, references: { model: User, key: "user_id" } }
}, {
  tableName: "invoice",
  timestamps: false
});

module.exports = Invoice;

const { DataTypes } = require("sequelize");
const {sequelize} = require("../config/db");

const Medication = sequelize.define("Medication", {
  medicine_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: DataTypes.STRING(100),
  quantity: DataTypes.INTEGER,
  price: DataTypes.NUMERIC(10,2)
}, {
  tableName: "medication",
  timestamps: false
});

module.exports = Medication;

const { DataTypes } = require("sequelize");
const {sequelize }= require("../config/db");

const Services = sequelize.define("Services", {
  service_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: DataTypes.STRING(100),
  price: DataTypes.NUMERIC(10,2)
}, {
  tableName: "Services",
  timestamps: false
});

module.exports = Services;

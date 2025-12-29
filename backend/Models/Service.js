const { DataTypes } = require("sequelize");
const {sequelize }= require("../config/db");

const Service = sequelize.define("Service", {
  service_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: DataTypes.STRING(100),
  price: DataTypes.NUMERIC(10,2)
}, {
  tableName: "services",
  timestamps: false
});

module.exports = Service;

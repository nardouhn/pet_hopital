const { DataTypes } = require("sequelize");
const {sequelize }= require("../config/db");

const Vaccin = sequelize.define("Vaccin", {
  vaccin_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name_vaccin: DataTypes.STRING(100),
  price: DataTypes.NUMERIC(10,2),
  quantity: DataTypes.INTEGER
}, {
  tableName: "Vaccin",
  timestamps: false
});

module.exports = Vaccin;

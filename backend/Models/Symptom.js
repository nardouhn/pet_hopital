const { DataTypes } = require("sequelize");
const {sequelize} = require("../config/db");

const Symptom = sequelize.define("Symptom", {
  symptom_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: DataTypes.STRING(255)
}, {
  tableName: "symptom",
  timestamps: false
});

module.exports = Symptom;

const { DataTypes } = require("sequelize");
const {sequelize }= require("../config/db");

const Doctor = sequelize.define("Doctor", {
  doctor_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  doctor_name: { type: DataTypes.STRING(150), allowNull: false },
  birth: DataTypes.DATEONLY,
  email: DataTypes.STRING(150),
  phone: DataTypes.STRING(20),
  specialization: DataTypes.STRING(150)
}, {
  tableName: "doctor",
  timestamps: false
});

module.exports = Doctor;

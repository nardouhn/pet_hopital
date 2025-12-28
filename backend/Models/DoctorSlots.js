const { DataTypes } = require("sequelize");
const {sequelize }= require("../config/db");
const Doctor = require("./Doctor");

const DoctorSlots = sequelize.define("DoctorSlots", {
  doctor_slots_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  doctor_id: { type: DataTypes.INTEGER, references: { model: Doctor, key: "doctor_id" } },
  start_time: DataTypes.DATE,
  end_time: DataTypes.DATE,
  number_of_slots: DataTypes.INTEGER,
  duration: DataTypes.INTEGER,
  created_on: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, {
  tableName: "TBL_doctor_slots",
  timestamps: false
});

module.exports = DoctorSlots;

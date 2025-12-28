const { DataTypes } = require("sequelize");
const{ sequelize} = require("../config/db");
const User = require("./User");
const Pet = require("./Pet");
const Doctor = require("./Doctor");
const Appointment = require("./Appointment");

const PatientReport = sequelize.define("PatientReport", {
  report_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  services: DataTypes.TEXT,
  symptoms: DataTypes.TEXT,
  medication: DataTypes.TEXT,
  status: DataTypes.STRING(100),
  doctor_id: { type: DataTypes.INTEGER, references: { model: Doctor, key: "doctor_id" } },
  pet_id: { type: DataTypes.INTEGER, references: { model: Pet, key: "pet_id" } },
  user_id: { type: DataTypes.INTEGER, references: { model: User, key: "user_id" } },
  appointment_id: { type: DataTypes.INTEGER, references: { model: Appointment, key: "appointment_id" } }
}, {
  tableName: "patient_report",
  timestamps: false
});

module.exports = PatientReport;

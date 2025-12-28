const { DataTypes } = require("sequelize");
const {sequelize} = require("../config/db");
const User = require("./User");
const Pet = require("./Pet");
const Doctor = require("./Doctor");

const Appointment = sequelize.define("Appointment", {
  appointment_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  owner_name: DataTypes.STRING,
  pet_name: DataTypes.STRING,
  pet_breed: DataTypes.STRING,
  service: DataTypes.STRING,
  symptoms: DataTypes.STRING,
  date: DataTypes.DATEONLY,
  timeslot: DataTypes.STRING(100),
  status: { type: DataTypes.ENUM("pending","confirmed","completed","cancelled"), defaultValue: "pending" },
  pet_id: { type: DataTypes.INTEGER, references: { model: Pet, key: "pet_id" } },
  user_id: { type: DataTypes.INTEGER, references: { model: User, key: "user_id" } },
  doctor_id: { type: DataTypes.INTEGER, references: { model: Doctor, key: "doctor_id" } }
}, {
  tableName: "appointment",
  timestamps: false
});


module.exports = Appointment;

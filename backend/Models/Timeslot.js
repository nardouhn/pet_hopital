const { DataTypes } = require("sequelize");
const {sequelize} = require("../config/db");
const User = require("./User");
const DoctorSlots = require("./DoctorSlots");

const Timeslot = sequelize.define("Timeslot", {
  timeslot_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  slot: DataTypes.STRING(100),
  user_id: { type: DataTypes.INTEGER, references: { model: User, key: "user_id" } },
  doctor_slots_id: { type: DataTypes.INTEGER, references: { model: DoctorSlots, key: "doctor_slots_id" } }
}, {
  tableName: "Timeslot",
  timestamps: false
});

module.exports = Timeslot;

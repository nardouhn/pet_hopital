const { DataTypes } = require("sequelize");
const {sequelize} = require("../config/db");
const User = require("./User");
const Pet = require("./Pet");

const PetHotel = sequelize.define("PetHotel", {
  petboard_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  status: { type: DataTypes.ENUM("booked","checked_in","checked_out"), defaultValue: "booked" },
  check_in: DataTypes.DATEONLY,
  check_out: DataTypes.DATEONLY,
  notes: DataTypes.TEXT,
  user_id: { type: DataTypes.INTEGER, references: { model: User, key: "user_id" } },
  pet_id: { type: DataTypes.INTEGER, references: { model: Pet, key: "pet_id" } }
}, {
  tableName: "Pet_Hotel",
  timestamps: false
});

module.exports = PetHotel;

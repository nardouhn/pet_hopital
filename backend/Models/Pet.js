const { DataTypes } = require("sequelize");
const {sequelize }= require("../config/db");
const User = require("./User");

const Pet = sequelize.define("Pet", {
  pet_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: DataTypes.STRING(100),
  breed: DataTypes.STRING(100),
  gender: DataTypes.ENUM("male","female","unknown"),
  age: DataTypes.INTEGER,
  weight: DataTypes.NUMERIC(5,2),
  color: DataTypes.STRING(50),
  user_id: { type: DataTypes.INTEGER, references: { model: User, key: "user_id" } }
}, {
  tableName: "pets",
  timestamps: false
});

module.exports = Pet;

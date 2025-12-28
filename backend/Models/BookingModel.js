
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const User = require('./User');

const Booking = sequelize.define('Booking', {
  booking_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  pet_id: { type: DataTypes.INTEGER, references: { model: 'Pets', key: 'pet_id' } },
  user_id: { type: DataTypes.INTEGER, references: { model: User, key: 'user_id' } },
  date: { type: DataTypes.DATE, allowNull: false },
  status: { type: DataTypes.STRING(50), defaultValue: 'pending' }
}, {
  tableName: 'bookings',
  timestamps: false
});

module.exports = Booking;

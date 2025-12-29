const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const User = require('./User');

const Feedback = sequelize.define('Feedback', {
  feedback_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  user_id: { type: DataTypes.INTEGER, references: { model: User, key: 'user_id' } },
  subject: DataTypes.STRING(255),
  message: DataTypes.TEXT,
  reply: DataTypes.TEXT,
  status: { type: DataTypes.STRING(50), defaultValue: 'open' },
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, {
  tableName: 'feedback',
  timestamps: false
});

module.exports = Feedback;
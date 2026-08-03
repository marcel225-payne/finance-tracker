const { DataTypes } = require('sequelize');
const sequelize = require('@/config/database');

const Budget = sequelize.define('Budget', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  limit: { type: DataTypes.FLOAT, allowNull: false },
  period: { type: DataTypes.STRING, defaultValue: 'monthly' },
});

module.exports = Budget;
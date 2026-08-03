const { DataTypes } = require('sequelize');
const sequelize = require('@/config/database');

const Transaction = sequelize.define('Transaction', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  amount: { type: DataTypes.FLOAT, allowNull: false },
  type: { type: DataTypes.ENUM('income', 'expense'), allowNull: false },
  description: { type: DataTypes.STRING },
  date: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
});

module.exports = Transaction;
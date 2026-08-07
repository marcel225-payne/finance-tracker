const { DataTypes } = require('sequelize');
const sequelize = require('@/config/database');

const Notification = sequelize.define('Notification', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  type: { type: DataTypes.STRING, allowNull: false },
  title: { type: DataTypes.STRING, allowNull: false },
  message: { type: DataTypes.STRING, allowNull: false },
  read: { type: DataTypes.BOOLEAN, defaultValue: false },
  // Utilisés uniquement pour "budget_exceeded", afin d'éviter les doublons par catégorie/mois
  categoryId: { type: DataTypes.UUID, allowNull: true },
  monthKey: { type: DataTypes.STRING, allowNull: true },
});

module.exports = Notification;
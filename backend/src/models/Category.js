const { DataTypes } = require('sequelize');
const sequelize = require('@/config/database');

const Category = sequelize.define('Category', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false },
  // distingue les catégories de dépenses et de revenus (comme côté frontend)
  type: { type: DataTypes.ENUM('income', 'expense'), allowNull: false, defaultValue: 'expense' },
  // nom de l'icône Ionicons (ex: "fast-food-outline")
  icon: { type: DataTypes.STRING, defaultValue: 'pricetag-outline' },
  color: { type: DataTypes.STRING, defaultValue: '#4CAF50' },
  // budget mensuel de la catégorie (null = aucun budget défini)
  budget: { type: DataTypes.FLOAT, allowNull: true, defaultValue: null },
  // seuil d'alerte visuel en % (80, 90, 100...)
  alertThreshold: { type: DataTypes.INTEGER, allowNull: true, defaultValue: null },
});

module.exports = Category;
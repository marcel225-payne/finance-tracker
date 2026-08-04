const { DataTypes } = require('sequelize');
const sequelize = require('@/config/database');

const User = sequelize.define('User', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  password: { type: DataTypes.STRING, allowNull: false },
  // code de verification pour changer le mots de passe en cas de mots de passe oublié 
  restCode: {type: DataTypes.STRING, allowNull: true, defaultValue: null},
  // Date d'expiration du mot de passe pour la verification 
  resetCodeExpiry: { type: DataTypes.DATE, allowNull: true, defaultValue: null },
});

module.exports = User;
const sequelize = require('@/config/database');
const User = require('@/models/User');
const Category = require('@/models/Category');
const Transaction = require('@/models/Transaction');
const Budget = require('@/models/Budget');

User.hasMany(Transaction, { onDelete: 'CASCADE' });
Transaction.belongsTo(User);

User.hasMany(Category, { onDelete: 'CASCADE' });
Category.belongsTo(User);

User.hasMany(Budget, { onDelete: 'CASCADE' });
Budget.belongsTo(User);

Category.hasMany(Transaction);
Transaction.belongsTo(Category);

Category.hasMany(Budget);
Budget.belongsTo(Category);

module.exports = { sequelize, User, Category, Transaction, Budget };
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const CategoryReceita = sequelize.define('CategoryReceita', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.STRING,
    allowNull: true
  },
  color: {
    type: DataTypes.STRING,
    defaultValue: '#10b981'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'categories_receita',
  timestamps: true,
  underscored: true
});

module.exports = CategoryReceita;

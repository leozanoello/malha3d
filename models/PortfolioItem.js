const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const PortfolioItem = sequelize.define('PortfolioItem', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  category: {
    type: DataTypes.STRING, // e.g., 'Residencial', 'Comercial', 'Interior'
    allowNull: true
  },
  clientName: {
    type: DataTypes.STRING,
    allowNull: true
  },
  year: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  mainImage: {
    type: DataTypes.STRING,
    allowNull: true
  },
  galleryImages: {
    type: DataTypes.JSON, // Array of image URLs
    defaultValue: []
  },
  details: {
    type: DataTypes.JSON, // Additional archviz details
    defaultValue: {}
  },
  isPublic: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  projectId: {
    type: DataTypes.UUID,
    allowNull: true
  }
}, {
  tableName: 'portfolio_items',
  timestamps: true,
  underscored: true
});

module.exports = PortfolioItem;

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const LeadPortfolioItem = sequelize.define('LeadPortfolioItem', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  leadId: {
    type: DataTypes.UUID,
    allowNull: true,
    field: 'lead_id'
  },
  title: {
    type: DataTypes.STRING,
    allowNull: true
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  category: {
    type: DataTypes.STRING,
    allowNull: true
  },
  clientName: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'client_name'
  },
  year: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  mainImage: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'main_image'
  },
  galleryImages: {
    type: DataTypes.JSONB,
    defaultValue: [],
    field: 'gallery_images'
  },
  details: {
    type: DataTypes.JSONB,
    defaultValue: {}
  },
  isPublic: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'is_public'
  }
}, {
  tableName: 'lead_portfolio_items',
  underscored: true
});

module.exports = LeadPortfolioItem;

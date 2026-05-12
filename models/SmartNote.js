const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const SmartNote = sequelize.define('SmartNote', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  color: {
    type: DataTypes.STRING,
    defaultValue: 'bg-yellow-100', // Default post-it color
    allowNull: false
  },
  hashtags: {
    type: DataTypes.TEXT, // Store as JSON string or comma-separated
    allowNull: true
  },
  isPinned: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  createdBy: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  tableName: 'smart_notes'
});

module.exports = SmartNote;

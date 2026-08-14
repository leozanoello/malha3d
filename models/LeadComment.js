const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const LeadComment = sequelize.define('LeadComment', {
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
  userId: {
    type: DataTypes.UUID,
    allowNull: true,
    field: 'user_id'
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'lead_comment',
  underscored: true
});

module.exports = LeadComment;

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const LeadLog = sequelize.define('LeadLog', {
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
  userName: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'user_name'
  },
  action: {
    type: DataTypes.STRING,
    allowNull: true
  },
  details: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'lead_logs'
});

module.exports = LeadLog;

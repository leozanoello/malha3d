const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const CRMNote = sequelize.define('CRMNote', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  budgetId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'budgets',
      key: 'id'
    }
  },
  type: {
    type: DataTypes.ENUM('note', 'call', 'email', 'meeting', 'follow_up', 'status_change'),
    allowNull: false
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  reminderDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  isCompleted: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  createdBy: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'sistema'
  },
  tags: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  tableName: 'crm_notes',
  indexes: [
    {
      fields: ['budget_id']
    },
    {
      fields: ['type']
    },
    {
      fields: ['reminder_date']
    }
  ]
});

module.exports = CRMNote;

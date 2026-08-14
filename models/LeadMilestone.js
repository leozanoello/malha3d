const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const LeadMilestone = sequelize.define('LeadMilestone', {
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
  status: {
    type: DataTypes.ENUM('pendente', 'em_progresso', 'concluido'),
    defaultValue: 'pendente'
  },
  order: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, {
  tableName: 'lead_milestones',
  underscored: true
});

module.exports = LeadMilestone;

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

module.exports = (sequelize) => {
  const LeadTask = sequelize.define('LeadTask', {
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
    stage: {
      type: DataTypes.STRING,
      allowNull: true
    },
    title: {
      type: DataTypes.STRING,
      allowNull: true
    },
    isCompleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'is_completed'
    },
    order: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    }
  }, {
    tableName: 'lead_tasks',
    underscored: true
  });

  return LeadTask;
};

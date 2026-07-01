const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const TaskFile = sequelize.define('TaskFile', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  taskId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'task_id',
    references: {
      model: 'tasks',
      key: 'id'
    }
  },
  filePathOrUrl: {
    type: DataTypes.TEXT,
    allowNull: false,
    field: 'file_path_or_url'
  },
  fileType: {
    type: DataTypes.STRING(10),
    allowNull: false,
    field: 'file_type' // local, image, document
  },
  versionNumber: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
    field: 'version_number'
  },
  isApprovedByClient: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'is_approved_by_client'
  },
  clientFeedback: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'client_feedback'
  },
  uploadedBy: {
    type: DataTypes.UUID,
    allowNull: true,
    field: 'uploaded_by',
    references: {
      model: 'users',
      key: 'id'
    }
  }
}, {
  tableName: 'task_files',
  timestamps: true,
  underscored: true
});

module.exports = TaskFile;

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const CalendarEvent = sequelize.define('CalendarEvent', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  startTime: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'start_time'
  },
  endTime: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'end_time'
  },
  type: {
    type: DataTypes.STRING,
    allowNull: true
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  projectId: {
    type: DataTypes.UUID,
    allowNull: true,
    field: 'project_id'
  },
  contactId: {
    type: DataTypes.UUID,
    allowNull: true,
    field: 'contact_id'
  },
  createdBy: {
    type: DataTypes.UUID,
    allowNull: true,
    field: 'created_by'
  },
  participants: {
    type: DataTypes.TEXT,
    allowNull: true,
    get() {
      const val = this.getDataValue('participants');
      try { return val ? JSON.parse(val) : []; } catch (e) { return []; }
    },
    set(val) {
      this.setDataValue('participants', JSON.stringify(val || []));
    }
  },
  history: {
    type: DataTypes.TEXT,
    allowNull: true,
    get() {
      const val = this.getDataValue('history');
      try { return val ? JSON.parse(val) : []; } catch (e) { return []; }
    },
    set(val) {
      this.setDataValue('history', JSON.stringify(val || []));
    }
  },
  tasks: {
    type: DataTypes.TEXT,
    allowNull: true,
    get() {
      const val = this.getDataValue('tasks');
      try { return val ? JSON.parse(val) : []; } catch (e) { return []; }
    },
    set(val) {
      this.setDataValue('tasks', JSON.stringify(val || []));
    }
  }
}, {
  tableName: 'calendar_events',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = CalendarEvent;

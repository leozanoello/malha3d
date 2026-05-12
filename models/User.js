const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: true
  },
  firstName: {
    type: DataTypes.STRING,
    allowNull: true
  },
  lastName: {
    type: DataTypes.STRING,
    allowNull: true
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  role: {
    type: DataTypes.ENUM('admin', 'staff', 'subscriber', 'collaborator', 'user', 'client'),
    defaultValue: 'user',
    validate: {
      isIn: [['admin', 'staff', 'subscriber', 'collaborator', 'user', 'client']]
    }
  },
  parentId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  tenantName: {
    type: DataTypes.STRING,
    allowNull: true
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: true
  },
  avatar: {
    type: DataTypes.STRING,
    allowNull: true
  },
  specialty: {
    type: DataTypes.STRING,
    allowNull: true
  },
  mainTool: {
    type: DataTypes.STRING,
    allowNull: true
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  isVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  verificationCode: {
    type: DataTypes.STRING,
    allowNull: true
  },
  lastLogin: {
    type: DataTypes.DATE,
    allowNull: true
  },
  permissions: {
    type: DataTypes.JSON,
    defaultValue: {
      crm: true,
      projects: true,
      finance: false,
      freelancers: false,
      company: false,
      canApproveBudgets: false,
      canSeeFinance: false,
      ownProjectsOnly: false
    }
  },
  hourlyRate: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00
  },
  // ArchViz Team Extended Fields
  phoneWhatsapp: {
    type: DataTypes.STRING(30),
    allowNull: true,
    field: 'phone_whatsapp'
  },
  weeklyHours: {
    type: DataTypes.INTEGER,
    defaultValue: 40,
    field: 'weekly_hours'
  },
  costHour: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00,
    field: 'cost_hour'
  },
  techStack: {
    type: DataTypes.JSON,
    defaultValue: [],
    field: 'tech_stack'
  },
  softwareLicenses: {
    type: DataTypes.JSON,
    defaultValue: [],
    field: 'software_licenses'
  },
  jobTitle: {
    type: DataTypes.STRING(100),
    allowNull: true,
    field: 'job_title'
  },
  suspendedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'suspended_at'
  },
  suspensionReason: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'suspension_reason'
  },
  forcedLogoutAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'forced_logout_at'
  }
}, {
  tableName: 'users',
  hooks: {
    beforeCreate: async (user) => {
      const bcrypt = require('bcryptjs');
      if (user.password) {
        user.password = await bcrypt.hash(user.password, 10);
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed('password')) {
        const bcrypt = require('bcryptjs');
        user.password = await bcrypt.hash(user.password, 10);
      }
    }
  },
  indexes: [
    {
      unique: true,
      fields: ['email']
    }
  ]
});

module.exports = User;

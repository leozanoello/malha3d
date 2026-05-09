const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Freelancer = sequelize.define('Freelancer', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: true
  },
  expertise: {
    type: DataTypes.STRING, // e.g., 'Renderização, Modelagem Orgânica, Animação'
    allowNull: true
  },
  rating: {
    type: DataTypes.INTEGER,
    defaultValue: 5,
    validate: {
      min: 1,
      max: 5
    }
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive', 'on_project'),
    defaultValue: 'active'
  },
  hourlyRate: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00
  },
  portfolioUrl: {
    type: DataTypes.STRING,
    allowNull: true
  },
  contractUrl: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  tableName: 'freelancers',
  timestamps: true,
  underscored: true
});

module.exports = Freelancer;

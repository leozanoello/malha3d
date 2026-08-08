const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Freelancer = sequelize.define('Freelancer', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  // === 1. DADOS PESSOAIS E CONTATO ===
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: { isEmail: true }
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: true
  },
  portfolioUrl: {
    type: DataTypes.STRING,
    allowNull: true
  },
  timezone: {
    type: DataTypes.STRING,
    allowNull: true
  },
  location: {
    type: DataTypes.STRING,
    allowNull: true
  },
  // Login vinculado ao User model via userId
  userId: {
    type: DataTypes.UUID,
    allowNull: true
  },

  // === 2. PERFIL TÉCNICO ===
  expertise: {
    type: DataTypes.STRING,
    allowNull: true
  },
  softwares: {
    type: DataTypes.STRING,
    allowNull: true
  },
  hardwareSpecs: {
    type: DataTypes.TEXT,
    allowNull: true
  },

  // === 3. GESTÃO DE PROJETOS E TEMPO ===
  status: {
    type: DataTypes.STRING,
    defaultValue: 'active'
  },
  availability: {
    type: DataTypes.STRING,
    defaultValue: 'disponivel'
  },
  startTimestamp: {
    type: DataTypes.DATE,
    allowNull: true
  },
  monthlyHours: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  linkedProjects: {
    type: DataTypes.TEXT,
    defaultValue: '[]'
  },

  // === 4. PERFORMANCE E QUALIDADE ===
  rating: {
    type: DataTypes.INTEGER,
    defaultValue: 5,
    validate: { min: 1, max: 5 }
  },
  totalImagesDelivered: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  totalAnimationSeconds: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  refactionIndex: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },

  // === 5. FINANCEIRO E CONTRATUAL ===
  remunerationModel: {
    type: DataTypes.STRING,
    defaultValue: 'hora'
  },
  hourlyRate: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00
  },
  pixKey: {
    type: DataTypes.STRING,
    allowNull: true
  },
  bankDetails: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  contractUrl: {
    type: DataTypes.STRING,
    allowNull: true
  },

  // === 6. SISTEMA E PERMISSÕES ===
  isHidden: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  chatId: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  tableName: 'freelancers',
  timestamps: true,
  underscored: true
});

module.exports = Freelancer;

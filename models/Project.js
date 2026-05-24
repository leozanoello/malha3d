const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Project = sequelize.define('Project', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [3, 100]
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  image: {
    type: DataTypes.STRING,
    allowNull: false
  },
  thumbnail: {
    type: DataTypes.STRING,
    allowNull: true
  },
  category: {
    type: DataTypes.ENUM(
      'interior',
      'exterior',
      'produto',
      'arquitetonico',
      'animacao',
      'outro'
    ),
    allowNull: false
  },
  tags: {
    type: DataTypes.STRING,
    allowNull: true
  },
  isFeatured: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  order: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  client: {
    type: DataTypes.STRING,
    allowNull: true
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'briefing'
  },
  year: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  budgetId: {
    type: DataTypes.UUID,
    allowNull: true
  },
  clientId: {
    type: DataTypes.UUID,
    allowNull: true
  },
  software: {
    type: DataTypes.STRING,
    allowNull: true
  },
  renderEngine: {
    type: DataTypes.STRING,
    allowNull: true
  },
  complexity: {
    type: DataTypes.STRING,
    allowNull: true
  },
  priority: {
    type: DataTypes.STRING,
    allowNull: true
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  deadline: {
    type: DataTypes.DATE,
    allowNull: true
  },
  startDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  totalArea: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  softwareStack: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  productionDays: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  origin: {
    type: DataTypes.STRING,
    allowNull: true
  },
  city: {
    type: DataTypes.STRING,
    allowNull: true
  },
  state: {
    type: DataTypes.STRING,
    allowNull: true
  },
  visualStyle: {
    type: DataTypes.STRING,
    allowNull: true
  },
  // --- Fields synced from Budget (CRM) ---
  imagesCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  animationSeconds: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  clientBudget: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  panoramasCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  staticImagesCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  imagesFachadaCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  imagesInterioresCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  imagesPlantaCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  floorPlansCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  videoFachadaCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  videoInterioresCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  videoPanoramasCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  imageFormat: {
    type: DataTypes.STRING,
    allowNull: true
  },
  videoFormat: {
    type: DataTypes.STRING,
    allowNull: true
  },
  videoResolution: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  imageResolution: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  environments: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  lightingMood: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  inputFormats: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  extraDeliverables: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  driveLink: {
    type: DataTypes.STRING,
    allowNull: true
  },
  projectType: {
    type: DataTypes.STRING,
    allowNull: true
  },
  desiredAtmosphere: {
    type: DataTypes.STRING,
    allowNull: true
  },
  moodboardUrl: {
    type: DataTypes.STRING,
    allowNull: true
  },
  humanizationLevel: {
    type: DataTypes.STRING,
    allowNull: true
  },
  specialElements: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  revisionsIncluded: {
    type: DataTypes.STRING,
    allowNull: true
  },
  portfolioImages: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  assignedUserId: {
    type: DataTypes.UUID,
    allowNull: true
  },
  plannedHours: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  extraResponsibles: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  // --- New CRM Sync Fields (Parity Upgrade) ---
  email: {
    type: DataTypes.STRING,
    allowNull: true
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: true
  },
  renderValue: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  installments: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  source: {
    type: DataTypes.STRING,
    defaultValue: 'website'
  },
  ipAddress: {
    type: DataTypes.STRING,
    allowNull: true
  },
  userAgent: {
    type: DataTypes.STRING,
    allowNull: true
  },
  color: {
    type: DataTypes.STRING,
    defaultValue: '#f97316'
  },
  probability: {
    type: DataTypes.INTEGER,
    defaultValue: 50
  },
  leadImage: {
    type: DataTypes.STRING,
    allowNull: true
  },
  targetSoftware: {
    type: DataTypes.STRING,
    allowNull: true
  },
  expectedRevenueDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  nextActionDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  nextActionNote: {
    type: DataTypes.TEXT,
    allowNull: true,
    defaultValue: ''
  },
  winStatus: {
    type: DataTypes.STRING,
    defaultValue: 'aberto'
  },
  lossReason: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: ''
  },
  closeDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  period: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  templateTheme: {
    type: DataTypes.STRING,
    defaultValue: 'design_a'
  },
  proposalStatus: {
    type: DataTypes.STRING,
    defaultValue: 'rascunho'
  },
  trackingCode: {
    type: DataTypes.STRING,
    allowNull: true
  },
  profileType: {
    type: DataTypes.STRING,
    allowNull: true
  },
  projectCategory: {
    type: DataTypes.STRING,
    allowNull: true
  },
  predominantStyle: {
    type: DataTypes.STRING,
    allowNull: true
  },
  location: {
    type: DataTypes.STRING,
    allowNull: true
  },
  paymentDate: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  paymentStatus: {
    type: DataTypes.STRING,
    allowNull: true
  },
  installmentsData: {
    type: DataTypes.JSONB,
    allowNull: true
  },
  receivedFormat: {
    type: DataTypes.STRING,
    allowNull: true
  },
  fileQuality: {
    type: DataTypes.STRING,
    allowNull: true
  },
  specificationsUrl: {
    type: DataTypes.STRING,
    allowNull: true
  },
  animationTime: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  firstPreviewDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  finalDeadline: {
    type: DataTypes.DATE,
    allowNull: true
  },
  hasUrgency: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  urgencyFee: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 0
  }
}, {
  tableName: 'projects',
  indexes: [
    {
      fields: ['category']
    },
    {
      fields: ['is_featured']
    },
    {
      fields: ['is_active']
    },
    {
      fields: ['order']
    }
  ],
  hooks: {
    afterUpdate: async (project, options) => {
      if (project.changed('status') || project.changed('price')) {
        const SystemLog = sequelize.models.SystemLog;
        if (SystemLog) {
          const user = options.user || {};
          const ip = options.ipAddress || 'system';
          let details = `Projeto '${project.title}' (${project.id}) atualizado. `;
          if (project.changed('status')) details += `Status alterado de '${project.previous('status')}' para '${project.status}'. `;
          if (project.changed('price')) details += `Valor alterado de '${project.previous('price')}' para '${project.price}'.`;
          
          await SystemLog.create({
            userId: user.id || null,
            userName: user.name || 'Sistema',
            action: 'PROJECT_UPDATE',
            module: 'projects',
            ipAddress: ip,
            details: details.trim(),
            level: 'info'
          }, { transaction: options.transaction });
        }
      }
    }
  }
});

module.exports = Project;

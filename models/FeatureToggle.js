const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const FeatureToggle = sequelize.define('FeatureToggle', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  // Identificador único do campo/aba/seção
  featureKey: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    field: 'feature_key'
  },
  // Tipo: 'field' (campo individual) ou 'section' (aba/bloco inteiro)
  type: {
    type: DataTypes.ENUM('field', 'section'),
    allowNull: false
  },
  // Categoria/Pai (ex: 'finance', 'planning', 'profile')
  category: {
    type: DataTypes.STRING,
    allowNull: true
  },
  // Label descritivo para o admin
  label: {
    type: DataTypes.STRING,
    allowNull: false
  },
  // Visibilidade: visível para Lead?
  visibleInLead: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'visible_in_lead'
  },
  // Visibilidade: visível para Project?
  visibleInProject: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'visible_in_project'
  },
  // Obrigatoriedade para Lead (ignored se !visibleInLead)
  requiredInLead: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'required_in_lead'
  },
  // Obrigatoriedade para Project
  requiredInProject: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'required_in_project'
  },
  // Ordem de renderização
  order: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, {
  tableName: 'feature_toggles',
  indexes: [
    { unique: true, fields: ['feature_key'] },
    { fields: ['type'] },
    { fields: ['category'] }
  ]
});

module.exports = FeatureToggle;
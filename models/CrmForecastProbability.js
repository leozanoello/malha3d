const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

/**
 * CRM Forecast Probability — Tabela exclusiva para métrica de Probabilidade de Fechamento
 *
 * ESCOPO: Apenas CRM (Leads). NUNCA aparece em Projetos (Modelagem).
 * PROPÓSITO: Pilar de inteligência de previsão de vendas e análises futuras.
 */
const CrmForecastProbability = sequelize.define('CrmForecastProbability', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  budgetId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'budget_id'
  },
  probability: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 50,
    validate: { min: 0, max: 100 }
  },
  previousProbability: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'previous_probability'
  },
  changedBy: {
    type: DataTypes.UUID,
    allowNull: true,
    field: 'changed_by'
  },
  changeReason: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'change_reason'
  },
  estimatedCloseDate: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    field: 'estimated_close_date'
  },
  weightedValue: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: true,
    field: 'weighted_value'
  }
}, {
  tableName: 'crm_forecast_probabilities',
  underscored: true,
  timestamps: true
});

module.exports = CrmForecastProbability;

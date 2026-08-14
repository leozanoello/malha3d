const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

/**
 * UniversalTask — Modelo polimórfico unificado de Tarefas
 *
 * Substitui: CRMTask, ProjectTask, LeadTask
 * Associação Polimórfica: entityType + entityId
 *
 * Uso:
 *   UniversalTask.findAll({ where: { entityType: 'Budget', entityId: leadId } })
 *   UniversalTask.findAll({ where: { entityType: 'Project', entityId: projectId } })
 */
const UniversalTask = sequelize.define('UniversalTask', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },

  // === ASSOCIAÇÃO POLIMÓRFICA ===
  entityType: {
    type: DataTypes.STRING(50),
    allowNull: false,
    field: 'entity_type',
    comment: 'Tipo da entidade: Budget, Project, Client, etc.'
  },
  entityId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'entity_id',
    comment: 'ID da entidade associada'
  },

  // === DADOS DA TAREFA ===
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  dueDate: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'due_date'
  },
  priority: {
    type: DataTypes.ENUM('baixa', 'media', 'alta', 'urgente'),
    defaultValue: 'media'
  },
  status: {
    type: DataTypes.ENUM('ativa', 'concluida', 'cancelada'),
    defaultValue: 'ativa'
  },
  category: {
    type: DataTypes.STRING,
    defaultValue: 'geral'
  },

  // === KANBAN / ORGANIZAÇÃO ===
  stage: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: 'A Fazer',
    comment: 'Coluna kanban: A Fazer, Em Andamento, Concluído'
  },
  order: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },

  // === RESPONSÁVEL ===
  assigneeId: {
    type: DataTypes.UUID,
    allowNull: true,
    field: 'assignee_id'
  },
  assigneeName: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'assignee_name'
  },

  // === METADATA ===
  completedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'completed_at'
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: true,
    field: 'user_id',
    comment: 'Quem criou a tarefa (tenant isolation)'
  }
}, {
  tableName: 'universal_tasks',
  timestamps: true,
  underscored: true,
  indexes: [
    { fields: ['entity_type', 'entity_id'] },
    { fields: ['status'] },
    { fields: ['assignee_id'] },
    { fields: ['user_id'] }
  ]
});

module.exports = UniversalTask;

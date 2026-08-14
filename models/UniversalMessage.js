const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

/**
 * UniversalMessage — Modelo polimórfico unificado de Chat/Mensagens
 *
 * Substitui: CRMLeadMessage, LeadComment, ProjectComment
 * Associação Polimórfica: entityType + entityId
 *
 * Uso:
 *   UniversalMessage.findAll({ where: { entityType: 'Budget', entityId: leadId } })
 *   UniversalMessage.findAll({ where: { entityType: 'Project', entityId: projectId } })
 */
const UniversalMessage = sequelize.define('UniversalMessage', {
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

  // === DADOS DA MENSAGEM ===
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  messageType: {
    type: DataTypes.ENUM('text', 'system', 'file', 'note'),
    defaultValue: 'text',
    field: 'message_type'
  },

  // === REMETENTE ===
  senderId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'sender_id'
  },
  senderName: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'sender_name'
  },

  // === DESTINATÁRIO (opcional — para mensagens diretas) ===
  recipientId: {
    type: DataTypes.UUID,
    allowNull: true,
    field: 'recipient_id'
  },
  recipientName: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'recipient_name'
  },

  // === METADATA ===
  isRead: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'is_read'
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: true,
    field: 'user_id',
    comment: 'Tenant isolation'
  }
}, {
  tableName: 'universal_messages',
  timestamps: true,
  underscored: true,
  indexes: [
    { fields: ['entity_type', 'entity_id'] },
    { fields: ['sender_id'] },
    { fields: ['user_id'] }
  ]
});

module.exports = UniversalMessage;

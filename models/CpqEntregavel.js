const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const CpqEntregavel = sequelize.define('CpqEntregavel', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  ambienteId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'ambiente_id'
  },
  tipo: {
    type: DataTypes.ENUM(
      'imagem',
      'video',
      'imagem_360',
      'video_interativo',
      'planta_humanizada',
      'video_ia',
      'custom'
    ),
    allowNull: false,
    defaultValue: 'imagem'
  },
  nome: {
    type: DataTypes.STRING,
    allowNull: true
  },
  qtd: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
    validate: { min: 1 }
  },
  valorBase: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
    field: 'valor_base'
  },
  subtotalCached: {
    type: DataTypes.DECIMAL(14, 2),
    defaultValue: 0,
    field: 'subtotal_cached'
  },
  ordem: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  config: {
    type: DataTypes.JSONB,
    defaultValue: {
      resolucao: 'FullHD',
      arquivo_aberto: false,
      softwares: [],
      revisoes_inclusas: 2,
      fatores_preco: {
        resolucao: { FullHD: 1.0, '4K': 1.5, '8K': 2.2, Web: 0.8 },
        arquivo_aberto: 0.4,
        revisao_extra: 250.0
      },
      prazo_dias: null,
      observacoes: ''
    }
  }
}, {
  tableName: 'cpq_entregaveis',
  indexes: [
    { fields: ['ambiente_id'] },
    { unique: true, fields: ['ambiente_id', 'ordem'] }
  ]
});

module.exports = CpqEntregavel;

// Dicionário central de Feature Toggles
// Lista todos os campos/seções que o Admin pode ocultar para Lead ou Project.
// Associa cada feature com seu category para agrupamento no painel admin.

const FEATURE_TOGGLE_DEFAULTS = [
  // === SEÇÕES (Abas inteiras) ===
  { featureKey: 'section.profile', type: 'section', category: 'profile', label: 'Aba Perfil / Dados Básicos', order: 10 },
  { featureKey: 'section.planning', type: 'section', category: 'planning', label: 'Aba Planejamento 360°', order: 20 },
  { featureKey: 'section.deliveries', type: 'section', category: 'production', label: 'Aba Entregáveis / Entregas', order: 30 },
  { featureKey: 'section.finance', type: 'section', category: 'finance', label: 'Aba Financeiro (Receitas/Despesas)', order: 40 },
  { featureKey: 'section.revisions', type: 'section', category: 'production', label: 'Aba Revisões', order: 50 },
  { featureKey: 'section.timesheet', type: 'section', category: 'planning', label: 'Aba Time Tracking', order: 60 },
  { featureKey: 'section.milestones', type: 'section', category: 'planning', label: 'Aba Milestones / Marcos', order: 70 },
  { featureKey: 'section.portfolio', type: 'section', category: 'production', label: 'Aba Portfólio', order: 80 },
  { featureKey: 'section.calendar', type: 'section', category: 'planning', label: 'Aba Eventos / Agenda', order: 90 },
  { featureKey: 'section.comments', type: 'section', category: 'profile', label: 'Aba Comentários', order: 100 },

  // === CAMPOS INDIVIDUAIS (Profile) ===
  { featureKey: 'field.title', type: 'field', category: 'profile', label: 'Título do Projeto', order: 110 },
  { featureKey: 'field.description', type: 'field', category: 'profile', label: 'Descrição Detalhada', order: 120 },
  { featureKey: 'field.category', type: 'field', category: 'profile', label: 'Categoria ArchViz', order: 130 },
  { featureKey: 'field.softwareStack', type: 'field', category: 'profile', label: 'Softwares do Pipeline', order: 140 },
  { featureKey: 'field.complexity', type: 'field', category: 'profile', label: 'Complexidade', order: 150 },
  { featureKey: 'field.priority', type: 'field', category: 'profile', label: 'Prioridade', order: 160 },
  { featureKey: 'field.deadline', type: 'field', category: 'profile', label: 'Prazo de Entrega', order: 170 },
  { featureKey: 'field.totalArea', type: 'field', category: 'profile', label: 'Área Total (m²)', order: 180 },
  { featureKey: 'field.location', type: 'field', category: 'profile', label: 'Localização (Cidade/Estado)', order: 190 },
  { featureKey: 'field.assignedUser', type: 'field', category: 'profile', label: 'Responsável Comercial', order: 200 },
  { featureKey: 'field.clientBudget', type: 'field', category: 'finance', label: 'Orçamento Estimado do Cliente', order: 210 },
  { featureKey: 'field.moodboardUrl', type: 'field', category: 'profile', label: 'URL do Moodboard', order: 220 },
  { featureKey: 'field.specialElements', type: 'field', category: 'profile', label: 'Elementos Especiais', order: 230 },

  // === CAMPOS INDIVIDUAIS (Finance) ===
  { featureKey: 'field.price', type: 'field', category: 'finance', label: 'Preço Final', order: 240 },
  { featureKey: 'field.installments', type: 'field', category: 'finance', label: 'Número de Parcelas', order: 250 },
  { featureKey: 'field.paymentStatus', type: 'field', category: 'finance', label: 'Status de Pagamento', order: 260 },
  { featureKey: 'field.probability', type: 'field', category: 'finance', label: 'Probabilidade de Fechamento (%)', order: 270 },
  { featureKey: 'field.winStatus', type: 'field', category: 'finance', label: 'Status da Negociação (Aberto/Ganho/Perdido)', order: 280 },
  { featureKey: 'field.expectedRevenueDate', type: 'field', category: 'finance', label: 'Data Esperada de Receita', order: 290 },

  // === CAMPOS INDIVIDUAIS (Production) ===
  { featureKey: 'field.productionDays', type: 'field', category: 'production', label: 'Dias de Produção', order: 300 },
  { featureKey: 'field.revisionsIncluded', type: 'field', category: 'production', label: 'Revisões Inclusas', order: 310 },
  { featureKey: 'field.urgencyFee', type: 'field', category: 'production', label: 'Taxa de Urgência', order: 320 },
  { featureKey: 'field.hasUrgency', type: 'field', category: 'production', label: 'Marcar como Urgente', order: 330 },
  { featureKey: 'field.deliveriesCount', type: 'field', category: 'production', label: 'Contadores de Entregáveis', order: 340 },
  { featureKey: 'field.imagesCount', type: 'field', category: 'production', label: 'Qtd. Imagens Estáticas', order: 350 },
  { featureKey: 'field.animationSeconds', type: 'field', category: 'production', label: 'Segundos de Animação', order: 360 },
  { featureKey: 'field.floorPlansCount', type: 'field', category: 'production', label: 'Qtd. Plantas Humanizadas', order: 370 },
  { featureKey: 'field.panoramasCount', type: 'field', category: 'production', label: 'Qtd. Imagens 360°', order: 380 }
];

async function syncFeatureToggles(force = false) {
  const { FeatureToggle } = require('../models');
  for (const def of FEATURE_TOGGLE_DEFAULTS) {
    const [record] = await FeatureToggle.findOrCreate({
      where: { featureKey: def.featureKey },
      defaults: def
    });
    if (force && (record.label !== def.label || record.category !== def.category)) {
      await record.update(def);
    }
  }
}

function buildFeatureMap(toggles) {
  const map = {};
  for (const t of toggles) {
    map[t.featureKey] = {
      visibleInLead: t.visibleInLead,
      visibleInProject: t.visibleInProject,
      requiredInLead: t.requiredInLead,
      requiredInProject: t.requiredInProject,
      type: t.type
    };
  }
  return map;
}

function filterFieldsForContext(featureMap, contextType) {
  // contextType: 'lead' | 'project'
  // Retorna mapa apenas com fields visíveis para aquele contexto
  const filtered = {};
  for (const [key, config] of Object.entries(featureMap)) {
    const visibleKey = contextType === 'lead' ? 'visibleInLead' : 'visibleInProject';
    const requiredKey = contextType === 'lead' ? 'requiredInLead' : 'requiredInProject';
    if (config[visibleKey]) {
      filtered[key] = {
        required: config[requiredKey],
        type: config.type
      };
    }
  }
  return filtered;
}

module.exports = {
  FEATURE_TOGGLE_DEFAULTS,
  syncFeatureToggles,
  buildFeatureMap,
  filterFieldsForContext
};
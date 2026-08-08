/**
 * Card Field Sync — Fonte única de verdade para campos dos cards (CRM + Projetos)
 *
 * COMO USAR:
 * Quando um novo campo for adicionado ao sistema:
 *   1. Adicionar no models/Budget.js (migration se necessário)
 *   2. Adicionar neste arquivo na seção correta
 *   → O campo aparecerá automaticamente em AMBOS os formulários (CRM + Projetos)
 *
 * O partial views/partials/newCardModal.hbs consome estes dados.
 */

const CARD_FIELDS = {
  // === SEÇÃO: DETALHES ===
  details: {
    label: 'Detalhes do Card',
    icon: 'info',
    color: 'orange',
    fields: [
      { name: 'name', label: 'Nome', type: 'text', required: true, placeholder: 'Nome do Lead/Projeto' },
      { name: 'totalArea', label: 'Metragem (m²)', type: 'number', step: '0.01', placeholder: '350.00' },
      { name: 'dataGanhoOportunidade', label: 'Data Ganho Oportunidade', type: 'date-br', placeholder: 'DD/MM/AAAA' },
      { name: 'expectativaInicio', label: 'Expectativa de Início', type: 'date-br', placeholder: 'DD/MM/AAAA' },
      { name: 'origemProjeto', label: 'Origem', type: 'select', options: ['Instagram', 'Facebook', 'LinkedIn', 'TikTok', 'E-mail', 'Indicação', 'Outros'] },
      { name: 'observacao', label: 'Observação', type: 'textarea', rows: 2 },
      { name: 'etiquetas', label: 'Etiquetas', type: 'tags' },
    ]
  },

  // === SEÇÃO: CONTATO ===
  contact: {
    label: 'Contato',
    icon: 'contact_page',
    color: 'cyan',
    fields: [
      { name: 'clientName', label: 'Nome do Contato', type: 'text', required: true },
      { name: 'email', label: 'Email', type: 'email' },
      { name: 'phone', label: 'Telefone', type: 'text', placeholder: '(xx) xxxxx-xxxx' },
      { name: 'state', label: 'Estado', type: 'ibge-state' },
      { name: 'city', label: 'Cidade', type: 'ibge-city' },
    ]
  },

  // === SEÇÃO: ENDEREÇO ===
  address: {
    label: 'Endereço',
    icon: 'location_on',
    color: 'purple',
    toggleable: true,
    fields: [
      { name: 'cep', label: 'CEP', type: 'cep', maxlength: 9 },
      { name: 'rua', label: 'Rua', type: 'text' },
      { name: 'numero', label: 'Número', type: 'text' },
      { name: 'complemento', label: 'Complemento', type: 'text' },
      { name: 'bairro', label: 'Bairro', type: 'text' },
    ]
  },

  // === SEÇÃO: EQUIPE ===
  team: {
    label: 'Equipe / Responsáveis',
    icon: 'groups',
    color: 'cyan',
    fields: [
      { name: 'assignedUserId[]', label: 'Responsável', type: 'user-select', multiple: true },
      { name: 'status', label: 'Etapa (Kanban)', type: 'kanban-status' },
    ]
  },

  // === SEÇÃO: INFORMAÇÕES DO CARD (Col 2) ===
  info: {
    label: 'Informações do Card',
    icon: 'inventory_2',
    color: 'emerald',
    fields: [
      { name: 'projectType', label: 'Tipologia', type: 'select-dynamic', options: ['Renderização', 'Modelagem 3D', 'Animação', 'Visita Virtual', 'Interiores', 'Arquitetônico', 'Comercial', 'Outro'] },
      { name: 'color', label: 'Cor de Destaque', type: 'color', default: '#f97316' },
      { name: 'estimatedValue', label: 'Valor Estimado (R$)', type: 'number', step: '0.01' },
      { name: 'probability', label: 'Probabilidade (%)', type: 'number', min: 0, max: 100, default: 50 },
      { name: 'priority', label: 'Prioridade', type: 'select', options: [{ value: 'baixa', label: 'Baixa' }, { value: 'media', label: 'Média' }, { value: 'alta', label: 'Alta' }], default: 'media' },
    ]
  },

  // === SEÇÃO: ENTREGÁVEIS ===
  deliverables: {
    label: 'Entregáveis',
    icon: 'inventory_2',
    color: 'emerald',
    fields: [
      { name: 'imagesCount', label: 'Imagens', type: 'number', min: 0, default: 0 },
      { name: 'animationSeconds', label: 'Animação (s)', type: 'number', min: 0, default: 0 },
      { name: 'floorPlansCount', label: 'Plantas Hum.', type: 'number', min: 0, default: 0 },
    ]
  },

  // === SEÇÃO: PRAZOS E TÉCNICOS ===
  technical: {
    label: 'Prazos e Técnicos',
    icon: 'schedule',
    color: 'blue',
    fields: [
      { name: 'productionDays', label: 'Prazo (Dias)', type: 'number', placeholder: '15' },
      { name: 'deadline', label: 'Deadline (Data)', type: 'date' },
      { name: 'revisionsIncluded', label: 'Revisões Inclusas', type: 'number', min: 0, max: 10 },
      { name: 'driveLink', label: 'Link Drive/Moodboard', type: 'url' },
      { name: 'targetSoftware', label: 'Software Alvo', type: 'select', options: ['D5 Render', 'Corona', 'V-Ray', '3ds Max', 'Blender', 'Unreal Engine 5'], default: 'V-Ray' },
      { name: 'visualStyle', label: 'Formato de Arquivo', type: 'text', placeholder: 'SketchUp, DWG, PDF' },
    ]
  }
};

/**
 * Retorna todos os campos organizados por seção
 */
function getCardFields() {
  return CARD_FIELDS;
}

/**
 * Retorna campos de uma seção específica
 * @param {string} section - Nome da seção (details, contact, address, team, info, deliverables, technical)
 */
function getFieldsBySection(section) {
  return CARD_FIELDS[section] || null;
}

/**
 * Retorna lista flat de todos os nomes de campo (para validação no backend)
 */
function getAllFieldNames() {
  const names = [];
  Object.values(CARD_FIELDS).forEach(section => {
    section.fields.forEach(f => {
      names.push(f.name.replace('[]', ''));
    });
  });
  return names;
}

/**
 * Verifica se um campo existe na definição
 * @param {string} fieldName - Nome do campo
 */
function fieldExists(fieldName) {
  return getAllFieldNames().includes(fieldName);
}

module.exports = {
  CARD_FIELDS,
  getCardFields,
  getFieldsBySection,
  getAllFieldNames,
  fieldExists
};

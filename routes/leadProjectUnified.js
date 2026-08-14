const express = require('express');
const router = express.Router();
const { sequelize } = require('../config/database');
const {
  Project, Lead,
  FeatureToggle
} = require('../models');
const { syncFeatureToggles, buildFeatureMap, filterFieldsForContext } = require('../utils/featureToggleConfig');

// Mapeamento de campos: Lead <-> Project (mesmo nome, mas em Lead tudo é nullable)
const FIELD_MAP = {
  title: 'title',
  description: 'description',
  category: 'category',
  status: 'status',
  priority: 'priority',
  name: 'name',
  email: 'email',
  phone: 'phone',
  clientName: 'clientName',
  clientId: 'clientId',
  price: 'price',
  installments: 'installments',
  paymentStatus: 'paymentStatus',
  paymentDate: 'paymentDate',
  renderValue: 'renderValue',
  deadline: 'deadline',
  startDate: 'startDate',
  expectedRevenueDate: 'expectedRevenueDate',
  expectedCloseDate: 'expectedCloseDate',
  nextActionDate: 'nextActionDate',
  closeDate: 'closeDate',
  complexity: 'complexity',
  visualStyle: 'visualStyle',
  color: 'color',
  software: 'software',
  renderEngine: 'renderEngine',
  targetSoftware: 'targetSoftware',
  softwareStack: 'softwareStack',
  projectType: 'projectType',
  projectCategory: 'projectCategory',
  profileType: 'profileType',
  predominantStyle: 'predominantStyle',
  location: 'location',
  city: 'city',
  state: 'state',
  totalArea: 'totalArea',
  productionDays: 'productionDays',
  driveLink: 'driveLink',
  leadImage: 'leadImage',
  moodboardUrl: 'moodboardUrl',
  specificationsUrl: 'specificationsUrl',
  imagesCount: 'imagesCount',
  animationSeconds: 'animationSeconds',
  staticImagesCount: 'staticImagesCount',
  panoramasCount: 'panoramasCount',
  floorPlansCount: 'floorPlansCount',
  animationTime: 'animationTime',
  revisionsIncluded: 'revisionsIncluded',
  hasUrgency: 'hasUrgency',
  urgencyFee: 'urgencyFee',
  desiredAtmosphere: 'desiredAtmosphere',
  humanizationLevel: 'humanizationLevel',
  specialElements: 'specialElements',
  lightingMood: 'lightingMood',
  environments: 'environments',
  inputFormats: 'inputFormats',
  extraDeliverables: 'extraDeliverables',
  source: 'source',
  origin: 'origin',
  origemProjeto: 'origemProjeto',
  ipAddress: 'ipAddress',
  userAgent: 'userAgent',
  trackingCode: 'trackingCode',
  probability: 'probability',
  winStatus: 'winStatus',
  lossReason: 'lossReason',
  notes: 'notes',
  observacao: 'observacao',
  nextActionNote: 'nextActionNote',
  plannerColumns: 'plannerColumns',
  assignedUserId: 'assignedUserId',
  assignedFreelancerId: 'assignedFreelancerId',
  order: 'order',
  templateTheme: 'templateTheme',
  portfolioImages: 'portfolioImages',
  videoResolution: 'videoResolution',
  imageResolution: 'imageResolution',
  tags: 'tags'
};

// ============================================================
// GET /admin/api/universal/feature-toggles
// Retorna mapa de visibilidade para o front-end
// ============================================================
router.get('/feature-toggles', async (req, res) => {
  try {
    await syncFeatureToggles();
    const toggles = await FeatureToggle.findAll({ order: [['order', 'ASC']] });
    res.json({
      toggles,
      map: buildFeatureMap(toggles)
    });
  } catch (err) {
    console.error('FeatureToggle GET error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ============================================================
// PUT /admin/api/universal/feature-toggles/:featureKey
// Admin atualiza visibilidade de uma feature
// ============================================================
router.put('/feature-toggles/:featureKey', async (req, res) => {
  try {
    const { featureKey } = req.params;
    const updates = {};
    if (req.body.visibleInLead !== undefined) updates.visibleInLead = req.body.visibleInLead;
    if (req.body.visibleInProject !== undefined) updates.visibleInProject = req.body.visibleInProject;
    if (req.body.requiredInLead !== undefined) updates.requiredInLead = req.body.requiredInLead;
    if (req.body.requiredInProject !== undefined) updates.requiredInProject = req.body.requiredInProject;

    const [updated] = await FeatureToggle.update(updates, { where: { featureKey } });
    if (!updated) return res.status(404).json({ error: 'Feature não encontrada' });
    res.json({ success: true });
  } catch (err) {
    console.error('FeatureToggle PUT error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ============================================================
// POST /admin/api/universal/:contextType
// contextType: 'lead' ou 'project'
// Body: { ...data... }
// ============================================================
router.post('/:contextType', async (req, res) => {
  const tx = await sequelize.transaction();
  try {
    const { contextType } = req.params;
    if (!['lead', 'project'].includes(contextType)) {
      await tx.rollback();
      return res.status(400).json({ error: 'contextType inválido. Use "lead" ou "project"' });
    }

    // Sincroniza toggles + carrega visibilidade
    await syncFeatureToggles();
    const toggles = await FeatureToggle.findAll();
    const featureMap = buildFeatureMap(toggles);
    const visibleFields = filterFieldsForContext(featureMap, contextType);

    // Aplica filtro: remove campos não visíveis do payload
    const payload = {};
    for (const [key, config] of Object.entries(visibleFields)) {
      if (config.type === 'section') {
        // Sections controlam abas inteiras, não campos individuais
        continue;
      }
      if (req.body[key] !== undefined) {
        payload[FIELD_MAP[key] || key] = req.body[key];
      }
    }

    // Salva no modelo apropriado
    let record;
    if (contextType === 'lead') {
      // Lead aceita qualquer campo como nullable
      record = await Lead.create(payload, { transaction: tx });
    } else {
      record = await Project.create(payload, { transaction: tx });
    }

    await tx.commit();
    res.status(201).json({ success: true, id: record.id, contextType });
  } catch (err) {
    await tx.rollback();
    console.error('Universal POST error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ============================================================
// PUT /admin/api/universal/:contextType/:id
// Atualiza um registro existente
// ============================================================
router.put('/:contextType/:id', async (req, res) => {
  const tx = await sequelize.transaction();
  try {
    const { contextType, id } = req.params;
    if (!['lead', 'project'].includes(contextType)) {
      await tx.rollback();
      return res.status(400).json({ error: 'contextType inválido' });
    }

    const Model = contextType === 'lead' ? Lead : Project;
    const record = await Model.findByPk(id, { transaction: tx });
    if (!record) {
      await tx.rollback();
      return res.status(404).json({ error: 'Registro não encontrado' });
    }

    // Carrega visibilidade
    await syncFeatureToggles();
    const toggles = await FeatureToggle.findAll();
    const featureMap = buildFeatureMap(toggles);
    const visibleFields = filterFieldsForContext(featureMap, contextType);

    // Aplica filtro + atualiza
    const updates = {};
    for (const [key, config] of Object.entries(visibleFields)) {
      if (config.type === 'section') continue;
      if (req.body[key] !== undefined) {
        updates[FIELD_MAP[key] || key] = req.body[key];
      }
    }

    await record.update(updates, { transaction: tx });
    await tx.commit();
    res.json({ success: true, id: record.id, contextType });
  } catch (err) {
    await tx.rollback();
    console.error('Universal PUT error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ============================================================
// GET /admin/api/universal/:contextType/:id
// Retorna registro completo
// ============================================================
router.get('/:contextType/:id', async (req, res) => {
  try {
    const { contextType, id } = req.params;
    if (!['lead', 'project'].includes(contextType)) {
      return res.status(400).json({ error: 'contextType inválido' });
    }

    const Model = contextType === 'lead' ? Lead : Project;
    const record = await Model.findByPk(id);
    if (!record) return res.status(404).json({ error: 'Registro não encontrado' });

    // Anexa visibilidade
    const toggles = await FeatureToggle.findAll();
    const featureMap = buildFeatureMap(toggles);
    const visibleFields = filterFieldsForContext(featureMap, contextType);

    res.json({
      record,
      contextType,
      visibleFields
    });
  } catch (err) {
    console.error('Universal GET error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ============================================================
// DELETE /admin/api/universal/:contextType/:id
// ============================================================
router.delete('/:contextType/:id', async (req, res) => {
  try {
    const { contextType, id } = req.params;
    if (!['lead', 'project'].includes(contextType)) {
      return res.status(400).json({ error: 'contextType inválido' });
    }

    const Model = contextType === 'lead' ? Lead : Project;
    const record = await Model.findByPk(id);
    if (!record) return res.status(404).json({ error: 'Registro não encontrado' });

    await record.destroy();
    res.json({ success: true });
  } catch (err) {
    console.error('Universal DELETE error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ============================================================
// POST /admin/api/universal/convert-lead/:id
// Converte Lead em Project (migração de dados entre tabelas)
// ============================================================
router.post('/convert-lead/:id', async (req, res) => {
  const tx = await sequelize.transaction();
  try {
    const lead = await Lead.findByPk(req.params.id, { transaction: tx });
    if (!lead) {
      await tx.rollback();
      return res.status(404).json({ error: 'Lead não encontrado' });
    }

    // Extrai dados (exceto id e timestamps)
    const leadData = lead.toJSON();
    const { id, createdAt, updatedAt, ...projectData } = leadData;

    // Adiciona campos que Project exige como não-null
    if (!projectData.title) projectData.title = projectData.name || 'Projeto Convertido';
    if (!projectData.image) projectData.image = leadData.leadImage || '/public/img/default-project.png';
    if (!projectData.category) projectData.category = 'outro';

    // Cria o Project com os dados do Lead
    const project = await Project.create(projectData, { transaction: tx });

    // Opcionalmente, marca o lead como convertido (não deleta)
    await lead.update({ winStatus: 'ganho', closeDate: new Date() }, { transaction: tx });

    await tx.commit();
    res.json({
      success: true,
      projectId: project.id,
      leadId: lead.id,
      message: 'Lead convertido em Project com sucesso'
    });
  } catch (err) {
    await tx.rollback();
    console.error('Convert lead error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
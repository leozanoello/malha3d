/**
 * TESTES DE ISOLAMENTO — ETAPA 5 (QA Rigoroso)
 * Valida que Lead e Project salvam em tabelas SEPARADAS
 * e que Feature Toggles oculta campos corretamente.
 */

process.env.LOCAL_DEV = 'true';

const { sequelize, Lead, Project, FeatureToggle, Client } = require('../models');
const {
  syncFeatureToggles,
  buildFeatureMap,
  filterFieldsForContext
} = require('../utils/featureToggleConfig');

let pass = 0;
let fail = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✓ ${message}`);
    pass++;
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    fail++;
  }
}

async function cleanup() {
  await Lead.destroy({ where: {}, truncate: true, cascade: true }).catch(() => {});
  await Project.destroy({ where: {}, truncate: true, cascade: true }).catch(() => {});
  await FeatureToggle.destroy({ where: {}, truncate: true, cascade: true }).catch(() => {});
}

(async () => {
  console.log('═══════════════════════════════════════════════════════');
  console.log('  TESTES DE ISOLAMENTO LEAD ↔ PROJECT');
  console.log('═══════════════════════════════════════════════════════\n');

  try {
    await sequelize.authenticate();
    console.log('✓ Conexão DB estabelecida');

    // Força criação das tabelas (apenas em SQLite/dev)
    if (process.env.LOCAL_DEV === 'true') {
      console.log('⚙️  Sincronizando schema...');
      await sequelize.sync({ alter: true });
      console.log('✓ Schema sincronizado\n');
    } else {
      console.log();
    }

    // ============================================================
    // TEST 1: Sincronização de Feature Toggles
    // ============================================================
    console.log('TEST 1: Sincronização de Feature Toggles');
    await syncFeatureToggles(true);
    const toggles = await FeatureToggle.findAll();
    assert(toggles.length >= 20, `FeatureToggle sincronizado (${toggles.length} features)`);
    const sampleToggle = toggles.find(t => t.featureKey === 'field.title');
    assert(!!sampleToggle, 'Toggle "field.title" existe');
    assert(sampleToggle.visibleInLead === true, 'Por padrão, "field.title" visível para Lead');
    assert(sampleToggle.visibleInProject === true, 'Por padrão, "field.title" visível para Project');
    console.log();

    // ============================================================
    // TEST 2: Filtro de campos visíveis por contexto
    // ============================================================
    console.log('TEST 2: Filtro de campos visíveis por contexto');
    const featureMap = buildFeatureMap(toggles);
    const leadVisible = filterFieldsForContext(featureMap, 'lead');
    const projectVisible = filterFieldsForContext(featureMap, 'project');
    assert(Object.keys(leadVisible).length > 0, `Campos visíveis para Lead: ${Object.keys(leadVisible).length}`);
    assert(Object.keys(projectVisible).length > 0, `Campos visíveis para Project: ${Object.keys(projectVisible).length}`);
    assert(leadVisible['field.title'] !== undefined, 'Lead vê "field.title" por padrão');
    assert(projectVisible['field.title'] !== undefined, 'Project vê "field.title" por padrão');
    console.log();

    // ============================================================
    // TEST 3: Admin oculta campo → Front-end não envia
    // ============================================================
    console.log('TEST 3: Admin oculta campo e front-end não envia');
    await FeatureToggle.update(
      { visibleInLead: false },
      { where: { featureKey: 'field.title' } }
    );
    const togglesAfterHide = await FeatureToggle.findAll();
    const newFeatureMap = buildFeatureMap(togglesAfterHide);
    const leadVisibleAfter = filterFieldsForContext(newFeatureMap, 'lead');
    const projectVisibleAfter = filterFieldsForContext(newFeatureMap, 'project');
    assert(leadVisibleAfter['field.title'] === undefined, 'Lead NÃO vê "field.title" após admin ocultar');
    assert(projectVisibleAfter['field.title'] !== undefined, 'Project CONTINUA vendo "field.title"');
    // Restaurar para próximos testes
    await FeatureToggle.update(
      { visibleInLead: true },
      { where: { featureKey: 'field.title' } }
    );
    console.log();

    // ============================================================
    // TEST 4: Criar Lead com dados parciais (campos ocultos = NULL)
    // ============================================================
    console.log('TEST 4: Criar Lead com dados parciais (3 abas ocultas)');
    await cleanup();
    const lead = await Lead.create({
      name: 'Lead Teste - Aurora Construtora',
      email: 'contato@aurora.com',
      clientName: 'Construtora Aurora',
      phone: '11999998888',
      // CAMPOS QUE SERIAM OBRIGATÓRIOS EM PROJECT (mas nullable em Lead):
      // title: NÃO enviado (admin ocultou)
      // image: NÃO enviado
      // category: NÃO enviado
      // price: NÃO enviado (admin ocultou aba Finance)
      probability: 75
    });
    assert(!!lead.id, `Lead criado com ID: ${lead.id}`);
    assert(lead.name === 'Lead Teste - Aurora Construtora', 'Nome do Lead salvo corretamente');
    assert(lead.probability === 75, 'Probabilidade (75%) salva');
    assert(lead.title === null || lead.title === undefined || lead.title === '', 'title = null/empty (campo oculto não enviado)');
    assert(lead.price == 0 || lead.price === null, 'price = 0 ou null (campo oculto → aceita default ou null)');
    console.log();

    // ============================================================
    // TEST 5: Criar Project com campos OBRIGATÓRIOS
    // ============================================================
    console.log('TEST 5: Criar Project com campos obrigatórios');
    await cleanup();
    let projectError = null;
    try {
      await Project.create({
        // Project exige title, image, category → devem ser preenchidos
        title: 'Projeto Teste - Residencial Aurora',
        image: '/public/img/projeto1.jpg',
        category: 'arquitetonico',
        name: 'João Silva',
        email: 'joao@silva.com',
        price: 15000
      });
    } catch (e) {
      projectError = e;
    }
    assert(projectError === null, 'Project criado SEM erros (campos obrigatórios fornecidos)');
    console.log();

    // ============================================================
    // TEST 6: ISOLAMENTO TOTAL — Lead e Project NÃO compartilham IDs
    // ============================================================
    console.log('TEST 6: Isolamento total entre Lead e Project');
    await cleanup();
    const lead1 = await Lead.create({ name: 'Lead 1' });
    const project1 = await Project.create({
      title: 'Project 1',
      image: '/img.jpg',
      category: 'outro'
    });
    assert(lead1.id !== project1.id, 'IDs diferentes (Lead vs Project)');

    // Tentar buscar lead ID em Project → DEVE retornar null
    const crossLookup = await Project.findByPk(lead1.id);
    assert(crossLookup === null, 'Project NÃO encontra registro de Lead (isolamento confirmado)');

    const crossLookup2 = await Lead.findByPk(project1.id);
    assert(crossLookup2 === null, 'Lead NÃO encontra registro de Project (isolamento confirmado)');
    console.log();

    // ============================================================
    // TEST 7: Validação em Project (campo obrigatório rejeitado)
    // ============================================================
    console.log('TEST 7: Project REJEITA campos obrigatórios ausentes');
    let validationError = null;
    try {
      await Project.create({ name: 'Sem titulo' }); // Faltam title, image, category
    } catch (e) {
      validationError = e;
    }
    assert(validationError !== null, 'Project rejeita criação SEM title (mantém integridade)');
    console.log();

    // ============================================================
    // TEST 8: Lead aceita campos vazios (flexibilidade para Feature Toggles)
    // ============================================================
    console.log('TEST 8: Lead aceita campos vazios sem erro');
    let leadNoError = null;
    try {
      const emptyLead = await Lead.create({});
      assert(!!emptyLead.id, 'Lead vazio criado com sucesso (todos campos nullable)');
    } catch (e) {
      leadNoError = e;
    }
    assert(leadNoError === null, 'Lead aceita objeto vazio (todos campos são nullable)');
    console.log();

    // ============================================================
    // TEST 9: Conversão Lead → Project (migração entre tabelas)
    // ============================================================
    console.log('TEST 9: Conversão Lead → Project');
    await cleanup();
    const leadToConvert = await Lead.create({
      name: 'Lead Para Conversão',
      email: 'convert@teste.com',
      clientName: 'Cliente Teste',
      price: 10000,
      probability: 90
    });

    // Executa lógica de conversão (espelhada de routes/leadProjectUnified.js)
    const leadData = leadToConvert.toJSON();
    const { id, createdAt, updatedAt, tags, softwareStack, plannerColumns, environments,
            lightingMood, inputFormats, extraDeliverables, portfolioImages,
            videoResolution, imageResolution, installmentsData, ...projectData } = leadData;
    if (!projectData.title) projectData.title = projectData.name || 'Projeto Convertido';
    if (!projectData.image) projectData.image = '/public/img/default.png';
    if (!projectData.category) projectData.category = 'outro';

    const convertedProject = await Project.create(projectData);
    assert(!!convertedProject.id, `Project criado da conversão: ${convertedProject.id}`);
    assert(convertedProject.title === 'Lead Para Conversão', 'Nome/Title preservado na conversão');
    assert(convertedProject.email === 'convert@teste.com', 'Email preservado');
    assert(convertedProject.price === 10000, 'Preço preservado');

    const originalLead = await Lead.findByPk(leadToConvert.id);
    assert(originalLead !== null, 'Lead ORIGINAL preservado (não foi deletado)');
    console.log();

    // ============================================================
    // TEST 10: Feature Toggle afeta apenas o contexto alvo
    // ============================================================
    console.log('TEST 10: Feature Toggle afeta APENAS o contexto alvo');
    await FeatureToggle.update(
      { visibleInLead: false, visibleInProject: false },
      { where: { featureKey: 'field.title' } }
    );
    const togglesBoth = await FeatureToggle.findAll();
    const fmBoth = buildFeatureMap(togglesBoth);
    const lv = filterFieldsForContext(fmBoth, 'lead');
    const pv = filterFieldsForContext(fmBoth, 'project');
    assert(lv['field.title'] === undefined, 'Lead não vê field.title');
    assert(pv['field.title'] === undefined, 'Project não vê field.title');

    await FeatureToggle.update(
      { visibleInLead: true, visibleInProject: false },
      { where: { featureKey: 'field.title' } }
    );
    const togglesMixed = await FeatureToggle.findAll();
    const fmMixed = buildFeatureMap(togglesMixed);
    const lvm = filterFieldsForContext(fmMixed, 'lead');
    const pvm = filterFieldsForContext(fmMixed, 'project');
    assert(!!lvm['field.title'], 'Lead VÊ field.title (only-in-lead)');
    assert(!pvm['field.title'], 'Project NÃO vê field.title (only-in-lead)');
    console.log();

    // ============================================================
    // RESUMO FINAL
    // ============================================================
    console.log('═══════════════════════════════════════════════════════');
    console.log(`  RESULTADO: ${pass} PASSARAM, ${fail} FALHARAM`);
    console.log('═══════════════════════════════════════════════════════');

    if (fail === 0) {
      console.log('\n✅ TODOS OS TESTES DE ISOLAMENTO PASSARAM!\n');
      console.log('Garantias validadas:');
      console.log('  ✓ Feature Toggles sincronizam e controlam visibilidade');
      console.log('  ✓ Lead aceita dados parciais (nullable)');
      console.log('  ✓ Project valida campos obrigatórios');
      console.log('  ✓ IDs não vazam entre tabelas');
      console.log('  ✓ Conversão Lead→Project preserva dados');
      console.log('  ✓ Toggles podem ser lead-only, project-only ou ambos');
    } else {
      console.error(`\n❌ ${fail} TESTES FALHARAM — REVISAR!\n`);
    }

    await cleanup();
    process.exit(fail === 0 ? 0 : 1);
  } catch (err) {
    console.error('\n❌ ERRO FATAL:', err.message);
    console.error(err.stack);
    process.exit(1);
  }
})();
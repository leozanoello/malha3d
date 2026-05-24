require('dotenv').config();
const { Budget, sequelize } = require('../models');
const { getAutomatedFieldsForStatus } = require('../services/crmAutomation');
const moment = require('moment');

async function testAutomation() {
  console.log('🧪 Iniciando testes do Serviço de Automação de CRM...');

  // Teste 1: Regras do Serviço em Memória
  const testStages = ['novo', 'qualificacao', 'proposta', 'ajustes', 'fechamento', 'desconhecido'];
  let failed = false;

  testStages.forEach(stage => {
    const fields = getAutomatedFieldsForStatus(stage);
    console.log(`\n🔹 Estágio: ${stage.toUpperCase()}`);
    console.log('   Campos gerados:', JSON.stringify(fields, null, 2));

    const dateDiff = moment(fields.nextActionDate).diff(moment(), 'hours');
    console.log(`   Diferença de tempo agendado: ~${dateDiff} horas`);

    if (!fields.nextActionNote || !fields.nextActionDate || !fields.priority || !fields.probability) {
      console.error(`   ❌ FALHA: Campos obrigatórios ausentes para ${stage}`);
      failed = true;
    } else {
      console.log(`   ✅ OK`);
    }
  });

  if (failed) {
    console.error('\n❌ Testes em memória falharam!');
    process.exit(1);
  }
  console.log('\n✅ Testes em memória passaram com sucesso!');

  // Teste 2: Integração com o Banco de Dados
  try {
    await sequelize.authenticate();
    console.log('\n💾 Conectado ao Banco de Dados. Testando persistência...');

    // Criar um lead temporário para teste
    const tempLead = await Budget.create({
      name: 'Lead Teste Automacao CRM',
      projectType: 'Outro',
      status: 'novo',
      estimatedValue: 5000.00
    });

    console.log(`   Lead criado: ID ${tempLead.id}`);

    // Aplicar automação para o status 'proposta'
    const automatedFields = getAutomatedFieldsForStatus('proposta', tempLead);
    await tempLead.update(automatedFields);

    // Recarregar do banco e verificar
    const updatedLead = await Budget.findByPk(tempLead.id);
    
    console.log('\n📝 Campos recarregados do Banco de Dados:');
    console.log(`   Status: ${updatedLead.status} (Esperado: proposta)`);
    console.log(`   Priority: ${updatedLead.priority} (Esperado: alta)`);
    console.log(`   Probability: ${updatedLead.probability}% (Esperado: 60%)`);
    console.log(`   ProposalStatus: ${updatedLead.proposalStatus} (Esperado: enviada)`);
    console.log(`   NextActionDate: ${moment(updatedLead.nextActionDate).format('DD/MM/YYYY HH:mm')}`);
    console.log(`   NextActionNote: ${updatedLead.nextActionNote}`);

    let dbPassed = true;
    if (updatedLead.status !== 'proposta') dbPassed = false;
    if (updatedLead.priority !== 'alta') dbPassed = false;
    if (updatedLead.probability !== 60) dbPassed = false;
    if (updatedLead.proposalStatus !== 'enviada') dbPassed = false;

    // Limpar o lead de teste do BD
    await tempLead.destroy();
    console.log('\n🧹 Lead temporário removido do banco.');

    if (dbPassed) {
      console.log('✅ Integração com o Banco de Dados PASSOU!');
      process.exit(0);
    } else {
      console.error('❌ Integração com o Banco de Dados FALHOU!');
      process.exit(1);
    }

  } catch (error) {
    console.error('❌ Erro durante o teste de banco de dados:', error);
    process.exit(1);
  }
}

testAutomation();

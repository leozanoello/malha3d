const { sequelize, Project, Client, ProjectTask } = require('../models');

async function runQATests() {
  console.log('=== INICIANDO PROTOCOLO DE QA (FASES 1 A 3) ===');
  try {
    await sequelize.authenticate();
    console.log('Conexão com BD OK.');

    // TESTE 1: Criar Cliente Dinamicamente
    console.log('\n[TESTE 1] Mock de criação de cliente');
    const client = await Client.create({
      name: 'Cliente QA Automation',
      email: 'qa@automation.com',
      type: 'PF'
    });
    console.log(`✔️  Sucesso! Cliente criado: ${client.name}`);

    // TESTE 2: Criar Projeto com Enum "3d"
    console.log("\n[TESTE 2] Criação de Projeto com category='3d' e softwareStack='D5 Render'");
    const project = await Project.create({
      title: 'Projeto QA Teste 3D',
      category: '3d', // Testing Enum
      softwareStack: ['Revit', 'D5 Render'],
      status: 'briefing',
      image: '/uploads/default-project.jpg',
      clientId: client.id
    });
    console.log(`✔️  Sucesso! Projeto criado com ID: ${project.id}`);

    // TESTE 3: Aplicar Template e Progresso Matemático
    console.log('\n[TESTE 3] Inserção de Tarefas de Template');
    const newTasks = [
      { stage: 'Modelagem', title: 'Topografia', order: 1, projectId: project.id, isCompleted: false },
      { stage: 'Modelagem', title: 'Paredes', order: 2, projectId: project.id, isCompleted: true },
      { stage: 'Renderização', title: 'Materiais', order: 3, projectId: project.id, isCompleted: true },
      { stage: 'Renderização', title: 'Câmeras', order: 4, projectId: project.id, isCompleted: false }
    ];
    await ProjectTask.bulkCreate(newTasks);

    const tasks = await ProjectTask.findAll({ where: { projectId: project.id } });
    const total = tasks.length;
    const completed = tasks.filter(t => t.isCompleted).length;
    const percent = Math.round((completed / total) * 100);

    console.log(`Progresso: ${completed} de ${total} tarefas concluídas.`);
    console.log(`Cálculo de Progresso Visual: ${percent}%`);
    if (percent === 50) {
      console.log(`✔️  Sucesso! Matemática de Progresso validada (50%).`);
    } else {
      console.log(`❌  Falha na matemática.`);
    }

    // Limpeza
    console.log('\n[Limpando Dados de QA]');
    await ProjectTask.destroy({ where: { projectId: project.id } });
    await project.destroy();
    await client.destroy();
    console.log('✔️  Limpeza concluída.');

  } catch (error) {
    console.error('❌  ERRO NO QA:', error);
  } finally {
    await sequelize.close();
  }
}

runQATests();

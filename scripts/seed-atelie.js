const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const { sequelize, User, Project, FinanceTransaction, Client, Budget, CalendarEvent, CRMNote, CRMTask, TimeLog, Freelancer } = require('../models');

async function seedAtelie() {
  try {
    console.log('🚀 Iniciando configuração do usuário atelie@zanoello.com...');
    
    // 1. Verificar se o usuário já existe
    let user = await User.findOne({ where: { email: 'atelie@zanoello.com' } });
    
    if (user) {
      console.log('⚠️  Usuário atelie@zanoello.com já existe. Atualizando para Assinante Equipe zerado...');
      
      // Limpar todos os registros operacionais antigos deste usuário para garantir estado zerado
      const tenantId = user.id;
      
      await Project.destroy({ where: { userId: tenantId } });
      await FinanceTransaction.destroy({ where: { userId: tenantId } });
      await Client.destroy({ where: { userId: tenantId } });
      await Budget.destroy({ where: { userId: tenantId } });
      await CalendarEvent.destroy({ where: { userId: tenantId } });
      await CRMNote.destroy({ where: { userId: tenantId } });
      await CRMTask.destroy({ where: { userId: tenantId } });
      await TimeLog.destroy({ where: { userId: tenantId } });
      await Freelancer.destroy({ where: { userId: tenantId } });
      
      // Remover sub-contas antigas
      await User.destroy({ where: { parentId: tenantId } });

      // Atualizar o usuário principal
      await user.update({
        role: 'subscriber',
        tenantName: 'Ateliê Zanoello',
        isActive: true,
        status: 'active',
        isVerified: true,
        permissions: {
          crm: true,
          projects: true,
          finance: true,
          freelancers: true,
          company: true,
          canApproveBudgets: true,
          canSeeFinance: true,
          ownProjectsOnly: false
        }
      });
      console.log('✅ Usuário atelie@zanoello.com atualizado com sucesso!');
    } else {
      console.log('➕ Criando novo usuário atelie@zanoello.com...');
      
      // Criar usuário principal atelie@zanoello.com
      user = await User.create({
        name: 'Ateliê Zanoello',
        firstName: 'Ateliê',
        lastName: 'Zanoello',
        email: 'atelie@zanoello.com',
        password: 'atelie123', // Será hasheada pelo hook beforeCreate
        role: 'subscriber',
        tenantName: 'Ateliê Zanoello',
        isActive: true,
        status: 'active',
        isVerified: true,
        permissions: {
          crm: true,
          projects: true,
          finance: true,
          freelancers: true,
          company: true,
          canApproveBudgets: true,
          canSeeFinance: true,
          ownProjectsOnly: false
        }
      });
      console.log('✅ Usuário atelie@zanoello.com criado com sucesso!');
    }
    
    console.log('\n💎 Credenciais de Acesso:');
    console.log('==========================================');
    console.log('📧 Email: atelie@zanoello.com');
    console.log('🔑 Senha: atelie123');
    console.log('📈 Plano: Equipe (Assinante)');
    console.log('👥 Contas conectadas permitidas: Até 10');
    console.log('==========================================\n');
    console.log('🎉 Configuração concluída com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao configurar o ateliê:', error);
  } finally {
    await sequelize.close();
  }
}

seedAtelie();

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const { sequelize, User, SubscriptionPlan, Project, Client, Budget, FinanceTransaction } = require('../models');

async function run() {
  try {
    await sequelize.authenticate();
    console.log('✅ Conectado ao banco de dados.');

    // 1. Mostrar usuários cadastrados
    const users = await User.findAll({ attributes: ['id', 'name', 'email', 'role', 'parentId', 'tenantName'] });
    console.log('\n👥 USUÁRIOS NO BANCO:');
    users.forEach(u => {
      console.log(`- [${u.role}] Name: ${u.name}, Email: ${u.email}, Parent: ${u.parentId}, Tenant: ${u.tenantName}`);
    });

    // 2. Mostrar planos de assinatura
    try {
      const plans = await SubscriptionPlan.findAll();
      console.log('\n📋 PLANOS DE ASSINATURA:');
      plans.forEach(p => {
        console.log(`- Plan: ${p.name}, Price: ${p.price}, UsersLimit: ${p.usersLimit}`);
      });
    } catch (e) {
      console.log('Não foi possível ler os planos de assinatura:', e.message);
    }

    // 3. Verificar estrutura de colunas de Project
    const projectAttributes = Object.keys(Project.rawAttributes);
    console.log('\n📐 COLUNAS DA TABELA PROJECTS:', projectAttributes.join(', '));

    // 4. Verificar estrutura de colunas de FinanceTransaction
    const financeAttributes = Object.keys(FinanceTransaction.rawAttributes);
    console.log('📐 COLUNAS DA TABELA FINANCE_TRANSACTIONS:', financeAttributes.join(', '));

  } catch (error) {
    console.error('❌ Erro ao analisar banco de dados:', error);
  } finally {
    await sequelize.close();
  }
}

run();

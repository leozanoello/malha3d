require('dotenv').config();
const { Project, FinanceTransaction } = require('../models');
const { Op } = require('sequelize');

async function test() {
  try {
    const transactions = (await FinanceTransaction.findAll({ order: [['dueDate', 'DESC']] })).map(t => t.get({ plain: true }));
    const projectsRaw = await Project.findAll({ where: { status: { [Op.ne]: 'finalizado' } } });
    const projects = projectsRaw.map(p => p.get({ plain: true }));
    
    console.log('Transactions:', transactions.length);
    console.log('Projects:', projects.length);
    
    const projectProfits = projects.map(p => {
      const pTransactions = transactions.filter(t => t.projectId === p.id || t.budgetId === p.budgetId);
      const income = pTransactions.filter(t => t.type === 'receita').reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);
      const expenses = pTransactions.filter(t => t.type === 'despesa').reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);
      return {
        id: p.id,
        name: p.title,
        price: parseFloat(p.price) || 0,
        income,
        expenses,
        profit: income - expenses,
        margin: income > 0 ? ((income - expenses) / income * 100).toFixed(1) : 0
      };
    });

    const income = transactions.filter(t => t.type === 'receita').reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);
    const expense = transactions.filter(t => t.type === 'despesa').reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);
    
    const avgMargin = projectProfits.length > 0 
      ? (projectProfits.reduce((sum, p) => sum + parseFloat(p.margin), 0) / projectProfits.length).toFixed(1) 
      : 0;

    const expenseCategories = transactions
      .filter(t => t.type === 'despesa')
      .reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + parseFloat(t.amount);
        return acc;
      }, {});

    console.log('BI Metrics:', { avgMargin, expenseCategories });
    console.log('Success!');
  } catch (err) {
    console.error('ERROR:', err);
  }
}

test();

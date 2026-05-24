require('dotenv').config();
const { Budget } = require('../models');

async function checkData() {
  try {
    const budgets = await Budget.findAll({ attributes: ['id', 'name', 'status', 'winStatus', 'estimatedValue', 'expectedRevenueDate', 'probability'] });
    console.log('Total Budgets:', budgets.length);
    budgets.forEach(b => {
      console.log(`- ID: ${b.id}, Name: ${b.name}, Status: ${b.status}, WinStatus: ${b.winStatus}, EstimatedValue: ${b.estimatedValue}, Probability: ${b.probability}`);
    });
  } catch (error) {
    console.error('Error:', error);
  } finally {
    process.exit();
  }
}

checkData();

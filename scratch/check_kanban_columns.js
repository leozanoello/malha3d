require('dotenv').config();
const { KanbanColumn } = require('../models');

async function checkColumns() {
  try {
    const columns = await KanbanColumn.findAll();
    console.log('Total Kanban Columns:', columns.length);
    columns.forEach(c => {
      console.log(`- ID: ${c.id}, Title: ${c.title}, StatusKey: ${c.statusKey}, Type: ${c.type}`);
    });
  } catch (error) {
    console.error('Error:', error);
  } finally {
    process.exit();
  }
}

checkColumns();

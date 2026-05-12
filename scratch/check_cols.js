const { KanbanColumn } = require('./models');

async function checkColumns() {
  try {
    const cols = await KanbanColumn.findAll();
    console.log(JSON.stringify(cols.map(c => ({ title: c.title, key: c.statusKey, type: c.type })), null, 2));
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
checkColumns();

const { sequelize, User, Project, KanbanColumn, Budget } = require('../models');

async function check() {
    try {
        await sequelize.authenticate();
        console.log('DB Auth: OK');
        
        await sequelize.sync({ alter: true });
        console.log('Sync: OK');
        
        const tables = await sequelize.getQueryInterface().showAllTables();
        console.log('Tables:', tables);
        
        const userCount = await User.count();
        console.log('Users:', userCount);
        
        const kanbanCount = await KanbanColumn.count();
        console.log('Kanban Columns:', kanbanCount);

        const projectCount = await Project.count();
        console.log('Projects:', projectCount);

    } catch (err) {
        console.error('DB Check Failed:', err.message);
        console.error(err.stack);
    } finally {
        await sequelize.close();
    }
}

check();

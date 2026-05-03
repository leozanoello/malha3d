const { sequelize, Sequelize } = require('../config/database');
const User = require('./User');
const Budget = require('./Budget');
const BudgetItem = require('./BudgetItem');
const Client = require('./Client');
const CRMNote = require('./CRMNote');
const Project = require('./Project');
const Testimonial = require('./Testimonial');
const Setting = require('./Setting');
const FinanceTransaction = require('./FinanceTransaction');
const Revision = require('./Revision');
const Delivery = require('./Delivery');
const CalendarEvent = require('./CalendarEvent');

// Relacionamentos Budget e Client
Client.hasMany(Budget, { as: 'budgets', foreignKey: 'clientId' });
Budget.belongsTo(Client, { as: 'client', foreignKey: 'clientId' });

// Relacionamentos Budget e CRMNote
Budget.hasMany(CRMNote, { as: 'crmNotes', foreignKey: 'budgetId' });
CRMNote.belongsTo(Budget, { as: 'budget', foreignKey: 'budgetId' });

// Relacionamentos Project
Project.hasMany(Revision, { as: 'revisions', foreignKey: 'projectId' });
Revision.belongsTo(Project, { as: 'project', foreignKey: 'projectId' });

Project.hasMany(Delivery, { as: 'deliveries', foreignKey: 'projectId' });
Delivery.belongsTo(Project, { as: 'project', foreignKey: 'projectId' });

// Relacionamentos Calendar
Project.hasMany(CalendarEvent, { as: 'calendarEvents', foreignKey: 'projectId' });
CalendarEvent.belongsTo(Project, { as: 'project', foreignKey: 'projectId' });
Client.hasMany(CalendarEvent, { as: 'calendarEvents', foreignKey: 'contactId' });
CalendarEvent.belongsTo(Client, { as: 'client', foreignKey: 'contactId' });

// Relacionamentos Finance
Budget.hasMany(FinanceTransaction, { as: 'transactions', foreignKey: 'budgetId' });
FinanceTransaction.belongsTo(Budget, { as: 'budget', foreignKey: 'budgetId' });

module.exports = {
  sequelize,
  Sequelize,
  User,
  Budget,
  BudgetItem,
  Client,
  CRMNote,
  Project,
  Testimonial,
  Setting,
  FinanceTransaction,
  Revision,
  Delivery,
  CalendarEvent
};

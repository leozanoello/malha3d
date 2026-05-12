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
const KanbanColumn = require('./KanbanColumn');
const CRMTask = require('./CRMTask');
const TimeLog = require('./TimeLog');
const Freelancer = require('./Freelancer');
const PortfolioItem = require('./PortfolioItem');
const ProjectTemplate = require('./ProjectTemplate');
const Instance = require('./Instance');
const SubscriptionPlan = require('./SubscriptionPlan');
const SystemLog = require('./SystemLog');
const Webhook = require('./Webhook');
const NotificationTemplate = require('./NotificationTemplate');
const BudgetContact = require('./BudgetContact');
const SmartNote = require('./SmartNote');
const ApiKey = require('./ApiKey');

// Relacionamentos Budget e Client
Client.hasMany(Budget, { as: 'budgets', foreignKey: 'clientId', onDelete: 'SET NULL' });
Budget.belongsTo(Client, { as: 'client', foreignKey: 'clientId' });

// Relacionamentos para múltiplos contatos (M:N)
Budget.belongsToMany(Client, { through: BudgetContact, as: 'contacts', foreignKey: 'budgetId' });
Client.belongsToMany(Budget, { through: BudgetContact, as: 'crmBudgets', foreignKey: 'clientId' });
Budget.hasMany(BudgetContact, { as: 'budgetContactLinks', foreignKey: 'budgetId' });

Budget.hasMany(CRMNote, { as: 'crmNotes', foreignKey: 'budgetId', onDelete: 'CASCADE' });
CRMNote.belongsTo(Budget, { as: 'budget', foreignKey: 'budgetId' });

// Relacionamento Project e Budget
Budget.hasOne(Project, { as: 'project', foreignKey: 'budgetId' });
Project.belongsTo(Budget, { as: 'budget', foreignKey: 'budgetId' });
Project.belongsTo(Client, { as: 'customer', foreignKey: 'clientId' });
Client.hasMany(Project, { as: 'projects', foreignKey: 'clientId' });

// Relacionamento Lead -> Propostas (1:N)
Budget.hasMany(Budget, { as: 'propostas', foreignKey: 'linkedBudgetId', useJunctionTable: false });
Budget.belongsTo(Budget, { as: 'leadOrigem', foreignKey: 'linkedBudgetId' });

// Relacionamentos Budget e CRMTask
Budget.hasMany(CRMTask, { as: 'crmTasks', foreignKey: 'budgetId', onDelete: 'CASCADE' });
CRMTask.belongsTo(Budget, { as: 'budget', foreignKey: 'budgetId' });

// Relacionamentos Project
Project.hasMany(Revision, { as: 'revisions', foreignKey: 'projectId', onDelete: 'CASCADE' });
Revision.belongsTo(Project, { as: 'project', foreignKey: 'projectId' });

Project.hasMany(Delivery, { as: 'deliveries', foreignKey: 'projectId', onDelete: 'CASCADE' });
Delivery.belongsTo(Project, { as: 'project', foreignKey: 'projectId' });

// Relacionamentos Calendar
Project.hasMany(CalendarEvent, { as: 'calendarEvents', foreignKey: 'projectId' });
CalendarEvent.belongsTo(Project, { as: 'project', foreignKey: 'projectId' });
Client.hasMany(CalendarEvent, { as: 'calendarEvents', foreignKey: 'contactId' });
CalendarEvent.belongsTo(Client, { as: 'client', foreignKey: 'contactId' });

// Relacionamentos Finance
Budget.hasMany(FinanceTransaction, { as: 'budgetTransactions', foreignKey: 'budgetId', onDelete: 'SET NULL' });
FinanceTransaction.belongsTo(Budget, { as: 'budget', foreignKey: 'budgetId' });
Project.hasMany(FinanceTransaction, { as: 'transactions', foreignKey: 'projectId', onDelete: 'SET NULL' });
FinanceTransaction.belongsTo(Project, { as: 'project', foreignKey: 'projectId' });

// Relacionamentos Time Tracking
Project.hasMany(TimeLog, { as: 'timeLogs', foreignKey: 'projectId', onDelete: 'CASCADE' });
TimeLog.belongsTo(Project, { as: 'project', foreignKey: 'projectId' });
User.hasMany(TimeLog, { as: 'timeLogs', foreignKey: 'userId', onDelete: 'CASCADE' });
TimeLog.belongsTo(User, { as: 'user', foreignKey: 'userId' });

// Relacionamentos Freelancers
Freelancer.hasMany(TimeLog, { as: 'timeLogs', foreignKey: 'freelancerId' });
TimeLog.belongsTo(Freelancer, { as: 'freelancer', foreignKey: 'freelancerId' });

// Relacionamentos Portfolio
Project.hasOne(PortfolioItem, { as: 'portfolio', foreignKey: 'projectId' });
PortfolioItem.belongsTo(Project, { as: 'project', foreignKey: 'projectId' });

// Relacionamentos ApiKey
User.hasMany(ApiKey, { as: 'apiKeys', foreignKey: 'created_by', onDelete: 'SET NULL' });
ApiKey.belongsTo(User, { as: 'creator', foreignKey: 'created_by' });

// Relacionamento Budget -> Responsável Comercial (User)
User.hasMany(Budget, { as: 'assignedDeals', foreignKey: 'assigned_user_id' });
Budget.belongsTo(User, { as: 'assignedUser', foreignKey: 'assigned_user_id' });

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
  CalendarEvent,
  KanbanColumn,
  CRMTask,
  TimeLog,
  Freelancer,
  PortfolioItem,
  ProjectTemplate,
  Instance,
  SubscriptionPlan,
  SystemLog,
  Webhook,
  NotificationTemplate,
  BudgetContact,
  SmartNote,
  ApiKey
};

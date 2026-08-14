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
const CategoryReceita = require('./CategoryReceita');
const CategoryDespesa = require('./CategoryDespesa');
const BudgetContact = require('./BudgetContact');
const SmartNote = require('./SmartNote');
const ApiKey = require('./ApiKey');
const ProjectLog = require('./ProjectLog');
const ProjectTask = require('./ProjectTask')(sequelize);
const Milestone = require('./Milestone');
const Task = require('./Task');
const TaskFile = require('./TaskFile');
const TaskHistoryComment = require('./TaskHistoryComment');
const TaskDependency = require('./TaskDependency');
const TaskTemplate = require('./TaskTemplate');
const CRMLeadLog = require('./CRMLeadLog');
const CRMLeadMessage = require('./CRMLeadMessage');
const CrmForecastProbability = require('./CrmForecastProbability');
const UniversalTask = require('./UniversalTask');
const UniversalMessage = require('./UniversalMessage');
const CpqOrcamento = require('./CpqOrcamento');
const CpqFase = require('./CpqFase');
const CpqAmbiente = require('./CpqAmbiente');
const CpqEntregavel = require('./CpqEntregavel');
const BankAccount = require('./BankAccount');
const ChartOfAccounts = require('./ChartOfAccounts');
const CostCenter = require('./CostCenter');
const AccountsReceivable = require('./AccountsReceivable');
const AccountsPayable = require('./AccountsPayable');
const ArInstallment = require('./ArInstallment');
const ApInstallment = require('./ApInstallment');

// === LEAD MODELS (Espelhamento isolado de Project) ===
const Lead = require('./Lead');
const LeadRevision = require('./LeadRevision');
const LeadDelivery = require('./LeadDelivery');
const LeadTask = require('./LeadTask')(sequelize);
const LeadLog = require('./LeadLog');
const LeadMilestone = require('./LeadMilestone');
const LeadTimeLog = require('./LeadTimeLog');
const LeadCalendarEvent = require('./LeadCalendarEvent');
const LeadFinanceTransaction = require('./LeadFinanceTransaction');
const LeadPortfolioItem = require('./LeadPortfolioItem');
const LeadAccountsReceivable = require('./LeadAccountsReceivable');
const LeadAccountsPayable = require('./LeadAccountsPayable');
const LeadComment = require('./LeadComment');
const LeadFocusSession = require('./LeadFocusSession');

// === FEATURE TOGGLES (Admin controla visibilidade) ===
const FeatureToggle = require('./FeatureToggle');

// Relacionamentos Budget e Client
Client.hasMany(Budget, { as: 'budgets', foreignKey: 'clientId', onDelete: 'SET NULL' });
Budget.belongsTo(Client, { as: 'client', foreignKey: 'clientId' });

// Relacionamentos para múltiplos contatos (M:N)
Budget.belongsToMany(Client, { through: BudgetContact, as: 'clientContacts', foreignKey: 'budgetId', otherKey: 'clientId' });
Client.belongsToMany(Budget, { through: BudgetContact, as: 'crmBudgets', foreignKey: 'clientId', otherKey: 'budgetId' });
Budget.hasMany(BudgetContact, { as: 'budgetContactLinks', foreignKey: 'budgetId' });

Budget.hasMany(CRMNote, { as: 'crmNotes', foreignKey: 'budgetId', onDelete: 'CASCADE' });
CRMNote.belongsTo(Budget, { as: 'budget', foreignKey: 'budgetId' });

// Relacionamento Project e Budget
Budget.hasOne(Project, { as: 'project', foreignKey: 'budgetId' });
Project.belongsTo(Budget, { as: 'budget', foreignKey: 'budgetId' });
Project.belongsTo(Client, { as: 'customer', foreignKey: 'clientId' });
Project.belongsTo(User, { as: 'assignedUser', foreignKey: 'assignedUserId' });
Project.belongsTo(Freelancer, { as: 'assignedFreelancer', foreignKey: 'assignedFreelancerId' });
Client.hasMany(Project, { as: 'projects', foreignKey: 'clientId' });
User.hasMany(Project, { as: 'assignedProjects', foreignKey: 'assignedUserId' });
Freelancer.hasMany(Project, { as: 'assignedFreelancerProjects', foreignKey: 'assignedFreelancerId' });

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

Project.hasMany(ProjectTask, { as: 'tasks', foreignKey: 'projectId', onDelete: 'CASCADE' });
ProjectTask.belongsTo(Project, { as: 'project', foreignKey: 'projectId' });

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
Task.hasMany(TimeLog, { as: 'timeLogs', foreignKey: 'taskId', onDelete: 'CASCADE' });
TimeLog.belongsTo(Task, { as: 'task', foreignKey: 'taskId' });

// Relacionamentos Freelancers
Freelancer.hasMany(TimeLog, { as: 'timeLogs', foreignKey: 'freelancerId' });
TimeLog.belongsTo(Freelancer, { as: 'freelancer', foreignKey: 'freelancerId' });

// Relacionamentos Portfolio
Project.hasOne(PortfolioItem, { as: 'portfolio', foreignKey: 'projectId' });
PortfolioItem.belongsTo(Project, { as: 'project', foreignKey: 'projectId' });

// Relacionamento ProjectLog
Project.hasMany(ProjectLog, { as: 'logs', foreignKey: 'projectId', onDelete: 'CASCADE' });
ProjectLog.belongsTo(Project, { as: 'project', foreignKey: 'projectId' });

// Relacionamentos ApiKey
User.hasMany(ApiKey, { as: 'apiKeys', foreignKey: 'created_by', onDelete: 'SET NULL' });
ApiKey.belongsTo(User, { as: 'creator', foreignKey: 'created_by' });

// Relacionamento Budget -> Responsável Comercial (User)
User.hasMany(Budget, { as: 'assignedDeals', foreignKey: 'assigned_user_id' });
Budget.belongsTo(User, { as: 'assignedUser', foreignKey: 'assigned_user_id' });

// Auditoria imutável e chat exclusivo por lead
Budget.hasMany(CRMLeadLog, { as: 'logs', foreignKey: 'budgetId', onDelete: 'CASCADE' });
CRMLeadLog.belongsTo(Budget, { as: 'budget', foreignKey: 'budgetId' });

// Forecast Probability (Exclusivo CRM — previsão de vendas)
Budget.hasMany(CrmForecastProbability, { as: 'forecastProbabilities', foreignKey: 'budgetId', onDelete: 'CASCADE' });
CrmForecastProbability.belongsTo(Budget, { as: 'budget', foreignKey: 'budgetId' });

// === ERP FINANCEIRO (Fase 2) ===
// Accounts Receivable
AccountsReceivable.belongsTo(Budget, { as: 'budget', foreignKey: 'budgetId' });
AccountsReceivable.belongsTo(Project, { as: 'project', foreignKey: 'projectId' });
AccountsReceivable.belongsTo(Client, { as: 'client', foreignKey: 'clientId' });
AccountsReceivable.belongsTo(BankAccount, { as: 'bankAccount', foreignKey: 'bankAccountId' });
AccountsReceivable.belongsTo(ChartOfAccounts, { as: 'chartAccount', foreignKey: 'chartAccountId' });
AccountsReceivable.belongsTo(CostCenter, { as: 'costCenter', foreignKey: 'costCenterId' });
AccountsReceivable.hasMany(ArInstallment, { as: 'installments', foreignKey: 'receivableId', onDelete: 'CASCADE' });
ArInstallment.belongsTo(AccountsReceivable, { as: 'receivable', foreignKey: 'receivableId' });
ArInstallment.belongsTo(BankAccount, { as: 'bankAccount', foreignKey: 'bankAccountId' });

// Accounts Payable
AccountsPayable.belongsTo(Freelancer, { as: 'freelancer', foreignKey: 'freelancerId' });
AccountsPayable.belongsTo(Project, { as: 'project', foreignKey: 'projectId' });
AccountsPayable.belongsTo(BankAccount, { as: 'bankAccount', foreignKey: 'bankAccountId' });
AccountsPayable.belongsTo(ChartOfAccounts, { as: 'chartAccount', foreignKey: 'chartAccountId' });
AccountsPayable.belongsTo(CostCenter, { as: 'costCenter', foreignKey: 'costCenterId' });
AccountsPayable.hasMany(ApInstallment, { as: 'installments', foreignKey: 'payableId', onDelete: 'CASCADE' });
ApInstallment.belongsTo(AccountsPayable, { as: 'payable', foreignKey: 'payableId' });
ApInstallment.belongsTo(BankAccount, { as: 'bankAccount', foreignKey: 'bankAccountId' });

// Freelancer → Payables
Freelancer.hasMany(AccountsPayable, { as: 'payables', foreignKey: 'freelancerId' });

// Budget/Project → Receivables
Budget.hasMany(AccountsReceivable, { as: 'receivables', foreignKey: 'budgetId' });
Project.hasMany(AccountsReceivable, { as: 'receivables', foreignKey: 'projectId' });

Budget.hasMany(CRMLeadMessage, { as: 'messages', foreignKey: 'budgetId', onDelete: 'CASCADE' });
CRMLeadMessage.belongsTo(Budget, { as: 'budget', foreignKey: 'budgetId' });
CRMLeadMessage.belongsTo(User, { as: 'sender', foreignKey: 'senderId' });
CRMLeadMessage.belongsTo(User, { as: 'recipient', foreignKey: 'recipientId' });

// Relacionamentos do Módulo de Planejamento 360º
Project.hasMany(Milestone, { as: 'milestones', foreignKey: 'projectId', onDelete: 'CASCADE' });
Milestone.belongsTo(Project, { as: 'project', foreignKey: 'projectId' });

Milestone.hasMany(Task, { as: 'tasks', foreignKey: 'milestoneId', onDelete: 'CASCADE' });
Task.belongsTo(Milestone, { as: 'milestone', foreignKey: 'milestoneId' });

Task.hasMany(Task, { as: 'subTasks', foreignKey: 'parentTaskId', onDelete: 'CASCADE' });
Task.belongsTo(Task, { as: 'parentTask', foreignKey: 'parentTaskId' });

Task.hasMany(TaskFile, { as: 'files', foreignKey: 'taskId', onDelete: 'CASCADE' });
TaskFile.belongsTo(Task, { as: 'task', foreignKey: 'taskId' });

Task.hasMany(TaskHistoryComment, { as: 'comments', foreignKey: 'taskId', onDelete: 'CASCADE' });
TaskHistoryComment.belongsTo(Task, { as: 'task', foreignKey: 'taskId' });

User.hasMany(Task, { as: 'assignedTasks', foreignKey: 'assigneeId', onDelete: 'SET NULL' });
Task.belongsTo(User, { as: 'assignee', foreignKey: 'assigneeId' });

// Relacionamentos de Dependência e Template de Tarefas
Task.belongsToMany(Task, { through: TaskDependency, as: 'dependencies', foreignKey: 'taskId', otherKey: 'dependsOnTaskId' });
Task.belongsToMany(Task, { through: TaskDependency, as: 'dependentTasks', foreignKey: 'dependsOnTaskId', otherKey: 'taskId' });

// === CPQ (Configure, Price, Quote) ===
Budget.hasOne(CpqOrcamento, { as: 'cpqOrcamento', foreignKey: 'budgetId', onDelete: 'CASCADE' });
CpqOrcamento.belongsTo(Budget, { as: 'budget', foreignKey: 'budgetId' });

CpqOrcamento.hasMany(CpqFase, { as: 'fases', foreignKey: 'orcamentoId', onDelete: 'CASCADE' });
CpqFase.belongsTo(CpqOrcamento, { as: 'orcamento', foreignKey: 'orcamentoId' });

CpqFase.hasMany(CpqAmbiente, { as: 'ambientes', foreignKey: 'faseId', onDelete: 'CASCADE' });
CpqAmbiente.belongsTo(CpqFase, { as: 'fase', foreignKey: 'faseId' });

CpqAmbiente.hasMany(CpqEntregavel, { as: 'entregaveis', foreignKey: 'ambienteId', onDelete: 'CASCADE' });
CpqEntregavel.belongsTo(CpqAmbiente, { as: 'ambiente', foreignKey: 'ambienteId' });

// === LEAD (Espelhamento isolado de Project) ===
Lead.belongsTo(Client, { as: 'customer', foreignKey: 'clientId' });
Lead.belongsTo(User, { as: 'assignedUser', foreignKey: 'assignedUserId' });
Client.hasMany(Lead, { as: 'leads', foreignKey: 'clientId' });
User.hasMany(Lead, { as: 'assignedLeads', foreignKey: 'assignedUserId' });

Lead.hasMany(LeadRevision, { as: 'revisions', foreignKey: 'leadId', onDelete: 'CASCADE' });
LeadRevision.belongsTo(Lead, { as: 'lead', foreignKey: 'leadId' });

Lead.hasMany(LeadDelivery, { as: 'deliveries', foreignKey: 'leadId', onDelete: 'CASCADE' });
LeadDelivery.belongsTo(Lead, { as: 'lead', foreignKey: 'leadId' });

Lead.hasMany(LeadTask, { as: 'tasks', foreignKey: 'leadId', onDelete: 'CASCADE' });
LeadTask.belongsTo(Lead, { as: 'lead', foreignKey: 'leadId' });

Lead.hasMany(LeadLog, { as: 'logs', foreignKey: 'leadId', onDelete: 'CASCADE' });
LeadLog.belongsTo(Lead, { as: 'lead', foreignKey: 'leadId' });

Lead.hasMany(LeadMilestone, { as: 'milestones', foreignKey: 'leadId', onDelete: 'CASCADE' });
LeadMilestone.belongsTo(Lead, { as: 'lead', foreignKey: 'leadId' });

Lead.hasMany(LeadTimeLog, { as: 'timeLogs', foreignKey: 'leadId', onDelete: 'CASCADE' });
LeadTimeLog.belongsTo(Lead, { as: 'lead', foreignKey: 'leadId' });

Lead.hasMany(LeadCalendarEvent, { as: 'calendarEvents', foreignKey: 'leadId', onDelete: 'CASCADE' });
LeadCalendarEvent.belongsTo(Lead, { as: 'lead', foreignKey: 'leadId' });

Lead.hasMany(LeadFinanceTransaction, { as: 'transactions', foreignKey: 'leadId', onDelete: 'SET NULL' });
LeadFinanceTransaction.belongsTo(Lead, { as: 'lead', foreignKey: 'leadId' });

Lead.hasOne(LeadPortfolioItem, { as: 'portfolio', foreignKey: 'leadId' });
LeadPortfolioItem.belongsTo(Lead, { as: 'lead', foreignKey: 'leadId' });

Lead.hasMany(LeadAccountsReceivable, { as: 'receivables', foreignKey: 'leadId', onDelete: 'CASCADE' });
LeadAccountsReceivable.belongsTo(Lead, { as: 'lead', foreignKey: 'leadId' });

Lead.hasMany(LeadAccountsPayable, { as: 'payables', foreignKey: 'leadId', onDelete: 'CASCADE' });
LeadAccountsPayable.belongsTo(Lead, { as: 'lead', foreignKey: 'leadId' });

Lead.hasMany(LeadComment, { as: 'comments', foreignKey: 'leadId', onDelete: 'CASCADE' });
LeadComment.belongsTo(Lead, { as: 'lead', foreignKey: 'leadId' });

Lead.hasMany(LeadFocusSession, { as: 'focusSessions', foreignKey: 'leadId', onDelete: 'CASCADE' });
LeadFocusSession.belongsTo(Lead, { as: 'lead', foreignKey: 'leadId' });

// Dynamic Tenant Isolation Attribute and Hook Registration
const { registerTenantHooks } = require('../utils/tenantContext');
const modelsToIsolate = [
  Project,
  FinanceTransaction,
  Client,
  Budget,
  CalendarEvent,
  CRMNote,
  CRMTask,
  TimeLog,
  Freelancer,
  ProjectLog,
  ProjectTask,
  Milestone,
  Task,
  TaskFile,
  TaskHistoryComment,
  TaskDependency,
  TaskTemplate,
  CRMLeadLog,
  CRMLeadMessage,
  CrmForecastProbability,
  CpqOrcamento,
  UniversalTask,
  UniversalMessage,
  Lead
];

modelsToIsolate.forEach(model => {
  if (model) {
    model.$isIsolated = true;
    model.rawAttributes.userId = {
      type: Sequelize.UUID,
      allowNull: true,
      field: 'user_id',
      references: {
        model: 'users',
        key: 'id'
      }
    };
    model.refreshAttributes();
  }
});

registerTenantHooks(sequelize);

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
  ApiKey,
  ProjectLog,
  ProjectTask,
  Milestone,
  Task,
  TaskFile,
  TaskHistoryComment,
  TaskDependency,
  TaskTemplate,
  CRMLeadLog,
  CRMLeadMessage,
  CrmForecastProbability,
  BankAccount,
  ChartOfAccounts,
  CostCenter,
  AccountsReceivable,
  AccountsPayable,
  ArInstallment,
  ApInstallment,
  CategoryReceita,
  CategoryDespesa,
  CpqOrcamento,
  CpqFase,
  CpqAmbiente,
  CpqEntregavel,
  Lead,
  LeadRevision,
  LeadDelivery,
  LeadTask,
  LeadLog,
  LeadMilestone,
  LeadTimeLog,
  LeadCalendarEvent,
  LeadFinanceTransaction,
  LeadPortfolioItem,
  LeadAccountsReceivable,
  LeadAccountsPayable,
  LeadComment,
  LeadFocusSession,
  FeatureToggle,
  UniversalTask,
  UniversalMessage
};

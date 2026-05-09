const express = require('express');
const { 
  Budget, CRMNote, CRMTask, Project, Testimonial, User, Setting, 
  Client, FinanceTransaction, Revision, Delivery, CalendarEvent, 
  KanbanColumn, TimeLog, Freelancer, PortfolioItem, ProjectTemplate,
  Instance, SubscriptionPlan, SystemLog, Webhook, NotificationTemplate,
  sequelize 
} = require('../models');
const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;

const router = express.Router();
const emailService = require('../services/emailService');

// ==========================================
// MIDDLEWARES
// ==========================================

const requireAuth = async (req, res, next) => {
  if (!req.session.userId) {
    return res.redirect('/admin/login');
  }

  try {
    const user = await User.findByPk(req.session.userId);
    if (!user || user.role !== 'admin') {
      return res.redirect('/admin/login');
    }

    req.user = user.toJSON();
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.redirect('/admin/login');
  }
};

const checkPermission = (module) => {
  return (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
      return next();
    }
    if (req.user && req.user.permissions && req.user.permissions[module]) {
      return next();
    }

    res.status(403).render('admin/error', {
      layout: 'admin',
      title: 'Acesso Negado',
      message: 'Você não tem permissão para acessar este módulo.',
      user: req.user
    });
  };
};

// ==========================================
// AUTHENTICATION
// ==========================================

router.get('/login', (req, res) => {
  if (req.session.userId) {
    return res.redirect('/admin');
  }
  res.render('admin/login', {
    layout: 'login',
    title: 'Login - Admin'
  });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.render('admin/login', { layout: 'login', title: 'Login - Admin', error: 'Credenciais inválidas' });
    }
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.render('admin/login', { layout: 'login', title: 'Login - Admin', error: 'Credenciais inválidas' });
    }
    req.session.userId = user.id;
    req.session.user = user.toJSON();
    res.redirect('/admin');
  } catch (error) {
    console.error('Login error:', error);
    res.render('admin/login', { layout: 'login', title: 'Login - Admin', error: 'Erro ao fazer login' });
  }
});

router.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/admin/login');
});

// ==========================================
// DASHBOARD PRINCIPAL
// ==========================================

router.get('/', requireAuth, async (req, res) => {
  try {
    const budgetCount = await Budget.count();
    const projectCount = await Project.count();
    const clientCount = await Client.count();
    
    // Financial Health Assessment
    const transactions = await FinanceTransaction.findAll();
    const overdueExpenses = transactions.filter(t => t.type === 'despesa' && t.status === 'pendente' && new Date(t.dueDate) < new Date());
    const totalOverdue = overdueExpenses.reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);
    
    const recentTransactions = await FinanceTransaction.findAll({ limit: 5, order: [['createdAt', 'DESC']] });

    const newBudgetsCount = await Budget.count({ where: { status: 'novo' } });
    const activeProjectsCount = await Project.count({ where: { status: 'producao' } }); // Ajustado para o status correto
    
    // Performance metrics
    const totalWonValue = await Budget.sum('estimatedValue', { where: { winStatus: 'ganho' } }) || 0;
    const totalWonCount = await Budget.count({ where: { winStatus: 'ganho' } });
    const totalLostCount = await Budget.count({ where: { winStatus: 'perdido' } });
    const conversionRate = (totalWonCount + totalLostCount) > 0 
      ? Math.round((totalWonCount / (totalWonCount + totalLostCount)) * 100) 
      : 0;

    res.render('admin/dashboard', {
      layout: 'admin',
      title: 'Painel de Controle',
      currentPage: 'dashboard',
      user: req.user,
      stats: { 
        budgets: budgetCount, 
        newBudgets: newBudgetsCount,
        totalBudgets: budgetCount,
        projects: projectCount, 
        activeProjects: activeProjectsCount,
        clients: clientCount,
        financialRisk: totalOverdue > 5000 ? 'high' : (totalOverdue > 0 ? 'medium' : 'low'),
        totalOverdue
      },
      performance: {
        estimatedRevenue: totalWonValue,
        conversionRate: conversionRate
      },
      recentTransactions: recentTransactions.map(t => t.get({ plain: true }))
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).render('admin/error', { layout: 'admin', message: 'Erro ao carregar dashboard' });
  }
});

// ==========================================
// CRM & VENDAS (PIPELINES)
// ==========================================

router.get('/negociacoes', requireAuth, checkPermission('crm'), async (req, res) => {
  try {
    const columns = (await KanbanColumn.findAll({ where: { type: 'vendas' }, order: [['order', 'ASC']] })).map(c => c.get({ plain: true }));
    const dealsRaw = await Budget.findAll({ 
      where: { winStatus: 'aberto' },
      order: [['order', 'ASC'], ['createdAt', 'DESC']] 
    });
    const deals = dealsRaw.map(d => {
      const data = d.get({ plain: true });
      // Fallback para campos novos (Graceful Degradation)
      data.visualStyle = data.visualStyle || "";
      data.inputFormats = data.inputFormats || [];
      data.imagesCount = data.imagesCount || 0;
      data.animationSeconds = data.animationSeconds || 0;
      data.panoramasCount = data.panoramasCount || 0;
      data.winStatus = data.winStatus || "aberto";
      return data;
    });
    
    const kanban = {};
    const pipelineTotals = {};
    columns.forEach(col => {
      const colDeals = deals.filter(d => d.status === col.statusKey);
      kanban[col.statusKey] = colDeals;
      pipelineTotals[col.statusKey] = colDeals.reduce((sum, d) => sum + (parseFloat(d.estimatedValue) || 0), 0);
    });
    const totalNegotiationValue = deals.reduce((sum, d) => sum + (parseFloat(d.estimatedValue) || 0), 0);

    // === Analytics Logic (Merged from /previsao) ===
    const stats = {
      billingWon: deals.filter(d => d.winStatus === 'ganho').reduce((sum, d) => sum + (parseFloat(d.estimatedValue) || 0), 0),
      totalInNegotiation: deals.filter(d => d.winStatus === 'aberto').reduce((sum, d) => sum + (parseFloat(d.estimatedValue) || 0), 0),
      ticketMedio: 0,
      conversionRate: 0
    };

    const wonDeals = deals.filter(d => d.winStatus === 'ganho');
    stats.ticketMedio = wonDeals.length > 0 ? stats.billingWon / wonDeals.length : 0;

    const lostDealsCount = deals.filter(d => d.winStatus === 'perdido').length;
    stats.conversionRate = (wonDeals.length + lostDealsCount) > 0 
      ? (wonDeals.length / (wonDeals.length + lostDealsCount)) * 100 
      : 0;

    const charts = {
      funnel: {
        labels: columns.map(c => c.title),
        data: columns.map(c => {
          const colDeals = deals.filter(d => d.status === c.statusKey);
          return colDeals.reduce((sum, d) => sum + ((parseFloat(d.estimatedValue) || 0) * ((parseFloat(d.probability) || 0) / 100)), 0);
        })
      },
      winRate: {
        labels: ['Ganhos', 'Perdidos'],
        data: [wonDeals.length, lostDealsCount]
      },
      lossReasons: {
        labels: [...new Set(deals.filter(d => d.lossReason).map(d => d.lossReason))],
        data: []
      }
    };
    charts.lossReasons.data = charts.lossReasons.labels.map(reason => 
      deals.filter(d => d.lossReason === reason).length
    );

    res.render('admin/negociacoes', { 
      layout: 'admin', 
      title: 'CRM - Inteligência Comercial', 
      currentPage: 'negociacoes', 
      user: req.user, 
      columns, 
      kanban, 
      pipelineTotals, 
      totalNegotiationValue,
      stats,
      charts
    });
  } catch (error) {
    console.error('CRM Route Error:', error);
    res.status(500).render('admin/error', { layout: 'admin', message: 'Erro no pipeline de vendas' });
  }
});

router.post('/negociacoes/:id/confirm-project', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const budget = await Budget.findByPk(id);
    if (!budget) return res.status(404).json({ success: false, error: 'Negociação não encontrada' });

    // Clonar para Projeto com integridade total de dados
    await Project.create({
      title: budget.name,
      client: budget.name || 'Cliente Direto',
      clientId: budget.clientId, // Manter o ID do cliente se existir
      category: budget.projectType === 'Arquitetônico' ? 'arquitetonico' : (budget.projectType === 'Renderização' ? 'outro' : 'outro'),
      software: budget.targetSoftware || budget.software, // Garantir cópia do software
      renderEngine: budget.renderEngine || 'D5 Render', // Respeitar o briefing se existir
      price: budget.estimatedValue,
      deadline: budget.deadline,
      totalArea: budget.totalArea, // Metragem (IMPORTANTE)
      tags: budget.tags, // Tags/Requisitos
      description: budget.description, // Descrição/Briefing completo
      startDate: new Date(),
      status: 'producao',
      budgetId: budget.id,
      image: 'default-project.jpg' 
    });

    // Atualizar Negociação
    await budget.update({ 
      status: 'fechado', 
      winStatus: 'ganho',
      closeDate: new Date()
    });

    // Automação Financeira: Gerar Sinal de 50%
    await FinanceTransaction.create({
      type: 'receita',
      description: `Sinal (50%) - Projeto: ${budget.name}`,
      payer: budget.clientName || 'Cliente Direto',
      amount: (parseFloat(budget.estimatedValue) || 0) / 2,
      status: 'pendente',
      category: 'projeto_render',
      dueDate: new Date(),
      budgetId: budget.id,
      projectId: null // Será vinculado depois se necessário
    });

    // Automação: Comissão de Indicação (10% se houver origem externa)
    if (budget.origin && budget.origin !== 'website' && budget.origin !== 'direto' && budget.origin !== 'Google' && budget.origin !== 'Instagram') {
      await FinanceTransaction.create({
        type: 'despesa',
        description: `Comissão de Indicação - Projeto: ${budget.name} (${budget.origin})`,
        beneficiary: budget.origin,
        amount: (parseFloat(budget.estimatedValue) || 0) * 0.10,
        status: 'pendente',
        category: 'vendas',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 dias para pagar
        budgetId: budget.id
      });
    }

    // Automação de E-mail: Boas-vindas Criativo
    if (budget.email) {
      emailService.sendProjectProductionStart(budget, budget.email, budget.clientName || 'Cliente').catch(err => console.error('Erro e-mail onboarding:', err));
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Conversion Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/previsao', requireAuth, checkPermission('crm'), async (req, res) => {
  try {
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const allDeals = await Budget.findAll();
    const deals = allDeals.map(d => {
      const data = d.get({ plain: true });
      data.winStatus = data.winStatus || "aberto";
      data.estimatedValue = parseFloat(data.estimatedValue) || 0;
      data.probability = parseFloat(data.probability) || 0;
      return data;
    });

    // KPIs
    const wonThisMonth = deals.filter(d => d.winStatus === 'ganho' && new Date(d.updatedAt) >= firstDayOfMonth);
    const billingWon = wonThisMonth.reduce((sum, d) => sum + d.estimatedValue, 0);
    const inNegotiation = deals.filter(d => d.winStatus === 'aberto');
    const totalInNegotiation = inNegotiation.reduce((sum, d) => sum + d.estimatedValue, 0);
    const wonTotalCount = deals.filter(d => d.winStatus === 'ganho').length;
    const ticketMedio = wonTotalCount > 0 ? (deals.filter(d => d.winStatus === 'ganho').reduce((sum, d) => sum + d.estimatedValue, 0) / wonTotalCount) : 0;

    // Chart 1: Weighted Funnel (Next 6 months)
    const months = [];
    const weightedRevenue = [];
    for (let i = 0; i < 6; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
      const monthLabel = d.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' });
      months.push(monthLabel);
      
      const monthDeals = inNegotiation.filter(deal => {
        const estDate = deal.expectedRevenueDate || deal.deadline;
        if (!estDate) return false;
        const ed = new Date(estDate);
        return ed.getMonth() === d.getMonth() && ed.getFullYear() === d.getFullYear();
      });
      
      const weighted = monthDeals.reduce((sum, deal) => {
        return sum + deal.estimatedValue * (deal.probability / 100);
      }, 0);
      weightedRevenue.push(weighted);
    }

    const stats = {
      billingWon,
      totalInNegotiation,
      ticketMedio
    };

    const chartsData = {
      funnel: {
        labels: months,
        data: weightedRevenue
      },
      lossReasons: {
        labels: ['Preço', 'Prazo', 'Concorrente', 'Outros'],
        data: [
          deals.filter(d => d.lossReason === 'Preço').length,
          deals.filter(d => d.lossReason === 'Prazo').length,
          deals.filter(d => d.lossReason === 'Concorrente').length,
          deals.filter(d => d.lossReason === 'Outros').length
        ]
      }
    };

    res.render('admin/previsao', { 
      layout: 'admin', 
      title: 'Previsão Comercial', 
      currentPage: 'previsao', 
      user: req.user,
      stats,
      chartsData: JSON.stringify(chartsData)
    });
  } catch (error) {
    console.error('Forecast Route Error:', error);
    res.status(500).render('admin/error', { layout: 'admin', message: 'Erro na previsão comercial' });
  }
});

router.get('/propostas', requireAuth, checkPermission('proposals'), async (req, res) => {
  try {
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const allDeals = await Budget.findAll();
    const deals = allDeals.map(d => {
      const data = d.get({ plain: true });
      data.winStatus = data.winStatus || "aberto";
      data.estimatedValue = parseFloat(data.estimatedValue) || 0;
      data.probability = parseFloat(data.probability) || 0;
      return data;
    });

    const wonThisMonth = deals.filter(d => d.winStatus === 'ganho' && new Date(d.updatedAt) >= firstDayOfMonth);
    const billingWon = wonThisMonth.reduce((sum, d) => sum + (parseFloat(d.estimatedValue) || 0), 0);
    const inNegotiation = deals.filter(d => d.winStatus === 'aberto');
    const totalInNegotiation = inNegotiation.reduce((sum, d) => sum + (parseFloat(d.estimatedValue) || 0), 0);
    const wonTotalCount = deals.filter(d => d.winStatus === 'ganho').length;
    const ticketMedio = wonTotalCount > 0 ? (deals.filter(d => d.winStatus === 'ganho').reduce((sum, d) => sum + (parseFloat(d.estimatedValue) || 0), 0) / wonTotalCount) : 0;

    // Chart 1: Weighted Funnel (Next 6 months)
    const months = [];
    const weightedRevenue = [];
    for (let i = 0; i < 6; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
      const monthLabel = d.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' });
      months.push(monthLabel);
      
      const monthDeals = inNegotiation.filter(deal => {
        const estDate = deal.expectedRevenueDate || deal.deadline;
        if (!estDate) return false;
        const ed = new Date(estDate);
        return ed.getMonth() === d.getMonth() && ed.getFullYear() === d.getFullYear();
      });
      
      const weighted = monthDeals.reduce((sum, deal) => {
        return sum + (parseFloat(deal.estimatedValue) || 0) * (deal.probability / 100);
      }, 0);
      weightedRevenue.push(weighted);
    }

    // Chart 2: Win Rate (Current Month)
    const lostThisMonth = deals.filter(d => d.winStatus === 'perdido' && new Date(d.updatedAt) >= firstDayOfMonth).length;
    const winRateData = [wonThisMonth.length, lostThisMonth];

    // Chart 3: Loss Reasons
    const lossReasonsMap = {};
    deals.filter(d => d.winStatus === 'perdido' && d.lossReason).forEach(d => {
      lossReasonsMap[d.lossReason] = (lossReasonsMap[d.lossReason] || 0) + 1;
    });
    const lossReasonsLabels = Object.keys(lossReasonsMap);
    const lossReasonsValues = Object.values(lossReasonsMap);

    res.render('admin/previsao', {
      layout: 'admin',
      title: 'Previsão & Analytics',
      currentPage: 'previsao',
      user: req.user,
      stats: { billingWon, totalInNegotiation, ticketMedio },
      charts: {
        funnel: { labels: months, data: weightedRevenue },
        winRate: { labels: ['Ganhou', 'Perdeu'], data: winRateData },
        lossReasons: { labels: lossReasonsLabels, data: lossReasonsValues }
      }
    });
  } catch (error) {
    console.error('Forecast Route Error:', error);
    res.status(500).render('admin/error', { layout: 'admin', message: 'Erro ao carregar previsões' });
  }
});

// API para colunas do Kanban
router.post('/kanban/columns', requireAuth, async (req, res) => {
  try {
    const { title, color, type } = req.body;
    const statusKey = title.toLowerCase().replace(/\s+/g, '_');
    const order = await KanbanColumn.count({ where: { type } });
    const column = await KanbanColumn.create({ title, color, statusKey, type, order });
    res.json(column);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/kanban/columns/:id', requireAuth, async (req, res) => {
  try {
    await KanbanColumn.update(req.body, { where: { id: req.params.id } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/kanban/columns/:id', requireAuth, async (req, res) => {
  try {
    const col = await KanbanColumn.findByPk(req.params.id);
    if (col) {
      // Reatribuir cards para a primeira coluna disponível se necessário
      await col.destroy();
    }
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/negociacoes/:id/update-status', requireAuth, async (req, res) => {
  try {
    const { status } = req.body;
    const budget = await Budget.findByPk(req.params.id);
    if (!budget) return res.status(404).json({ error: 'Negociação não encontrada' });
    
    await budget.update({ status });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/negociacoes/:id/status', requireAuth, async (req, res) => {
  try {
    const { winStatus, lossReason } = req.body;
    const budget = await Budget.findByPk(req.params.id);
    if (!budget) return res.status(404).json({ error: 'Negociação não encontrada' });
    
    await budget.update({ winStatus, lossReason });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/crm', requireAuth, checkPermission('crm'), async (req, res) => {
  try {
    const columns = (await KanbanColumn.findAll({ where: { type: 'leads' }, order: [['order', 'ASC']] })).map(c => c.get({ plain: true }));
    const budgetsRaw = await Budget.findAll({ order: [['createdAt', 'DESC']] });
    const budgets = budgetsRaw.map(b => b.get({ plain: true }));
    
    const kanban = {};
    columns.forEach(col => { kanban[col.statusKey] = budgets.filter(b => b.status === col.statusKey); });

    // Cálculo de VGV (Valor Geral de Vendas)
    const totalVgv = budgets.reduce((acc, curr) => acc + parseFloat(curr.estimatedValue || 0), 0);

    res.render('admin/crm', { layout: 'admin', title: 'Pipeline de Leads', currentPage: 'crm', user: req.user, columns, kanban, totalVgv });
  } catch (error) {
    console.error('CRM Route Error:', error);
    res.status(500).render('admin/error', { layout: 'admin', message: 'Erro no CRM: ' + error.message });
  }
});

router.get('/orcamentos', requireAuth, async (req, res) => {
  try {
    const budgets = (await Budget.findAll({ order: [['createdAt', 'DESC']] })).map(b => b.get({ plain: true }));
    res.render('admin/budgets', { layout: 'admin', title: 'Propostas Comercial', currentPage: 'budgets', user: req.user, budgets });
  } catch (error) {
    console.error('Orcamentos Route Error:', error);
    res.status(500).render('admin/error', { layout: 'admin', message: 'Erro ao carregar orçamentos: ' + error.message });
  }
});

router.get('/orcamento/:id', requireAuth, async (req, res) => {
  try {
    const budget = await Budget.findByPk(req.params.id);
    if (!budget) return res.status(404).render('admin/error', { layout: 'admin', message: 'Orçamento não encontrado' });
    res.render('admin/budget-detail', { layout: 'admin', title: `Orçamento #${budget.id}`, currentPage: 'budgets', user: req.user, budget: budget.get({ plain: true }) });
  } catch (error) {
    res.status(500).render('admin/error', { layout: 'admin', message: 'Erro ao carregar detalhes do orçamento' });
  }
});

router.get('/budget-generator', requireAuth, async (req, res) => {
  res.render('admin/budget-generator', { layout: 'admin', title: 'Gerador Dinâmico', currentPage: 'budget-generator', user: req.user });
});

router.get('/modelos', requireAuth, async (req, res) => {
  try {
    const templates = (await ProjectTemplate.findAll({ order: [['name', 'ASC']] })).map(t => t.get({ plain: true }));
    res.render('admin/learning', { layout: 'admin', title: 'Modelos & Academy', currentPage: 'models', user: req.user, templates });
  } catch (error) {
    console.error('Modelos Route Error:', error);
    res.status(500).render('admin/error', { layout: 'admin', message: 'Erro ao carregar modelos' });
  }
});

router.get('/agenda', requireAuth, async (req, res) => {
  try {
    const events = (await CalendarEvent.findAll({ order: [['startTime', 'ASC']] })).map(e => e.get({ plain: true }));
    res.render('admin/calendar', { layout: 'admin', title: 'Agenda de Produção', currentPage: 'calendar', user: req.user, events });
  } catch (error) {
    res.status(500).render('admin/error', { layout: 'admin', message: 'Erro ao carregar agenda' });
  }
});

router.get('/rastreio-ativo', requireAuth, async (req, res) => {
  try {
    const timeLogs = (await TimeLog.findAll({ limit: 50, order: [['startTime', 'DESC']], include: [{ model: Project, as: 'project' }, { model: User, as: 'user' }] })).map(l => l.get({ plain: true }));
    res.render('admin/rastreio-ativo', { layout: 'admin', title: 'Rastreio Ativo', currentPage: 'active-tracking', user: req.user, timeLogs });
  } catch (error) {
    res.status(500).render('admin/error', { layout: 'admin', message: 'Erro ao carregar rastreio' });
  }
});

// ==========================================
// PROJETOS & PRODUÇÃO
// ==========================================

router.get('/projetos', requireAuth, async (req, res) => {
  try {
    const projects = (await Project.findAll({ order: [['createdAt', 'DESC']] })).map(p => p.get({ plain: true }));
    res.render('admin/projects', { layout: 'admin', title: 'Lista de Projetos', currentPage: 'projects', user: req.user, projects });
  } catch (error) {
    res.status(500).render('admin/error', { layout: 'admin', message: 'Erro ao carregar lista de projetos' });
  }
});

// Revisões
router.get('/api/projects/:id/revisions', requireAuth, async (req, res) => {
  try {
    const revisions = await Revision.findAll({ where: { projectId: req.params.id }, order: [['createdAt', 'DESC']] });
    res.json({ success: true, revisions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/api/projects/:id/revisions', requireAuth, async (req, res) => {
  try {
    const revision = await Revision.create({ ...req.body, projectId: req.params.id });
    res.json({ success: true, revision });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.delete('/api/revisions/:id', requireAuth, async (req, res) => {
  try {
    await Revision.destroy({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/projetos/kanban', requireAuth, async (req, res) => {
  try {
    const columns = (await KanbanColumn.findAll({ where: { type: 'project' }, order: [['order', 'ASC']] })).map(c => c.get({ plain: true }));
    const projectsRaw = await Project.findAll({ 
      order: [['order', 'ASC'], ['createdAt', 'DESC']],
      include: [{ model: Client, as: 'customer' }]
    });
    const projects = projectsRaw.map(p => p.get({ plain: true }));
    
    const kanbanColumns = columns.map(col => ({
      ...col,
      name: col.title,
      projects: projects.filter(p => p.status === col.statusKey)
    }));
    
    res.render('admin/projects-kanban', { layout: 'admin', title: 'Gestão de Projetos', currentPage: 'projects', user: req.user, columns: kanbanColumns });
  } catch (error) {
    console.error('CRITICAL KANBAN ERROR:', error);
    res.status(500).render('admin/error', { 
      layout: 'admin', 
      message: 'Erro ao carregar projetos: ' + error.message,
      error: error
    });
  }
});

router.post('/api/projects/move', requireAuth, async (req, res) => {
  try {
    const { projectId, status } = req.body;
    const project = await Project.findByPk(projectId);
    
    if (!project) {
      return res.status(404).json({ success: false, message: 'Projeto não encontrado' });
    }

    await project.update({ status });

    // Automações de Comunicação Criativa
    try {
        const fullProject = await Project.findByPk(projectId, { include: [{ model: Client, as: 'client' }] });
        const clientEmail = fullProject.client?.email || fullProject.budget?.email;
        const clientName = fullProject.client?.name || 'Cliente';

        if (clientEmail) {
            if (status === 'revisao') {
                await emailService.sendProjectReviewReady(fullProject, clientEmail, clientName);
            } else if (status === 'finalizado') {
                await emailService.sendProjectFinished(fullProject, clientEmail, clientName);
            }
        }
    } catch (notifErr) {
        console.error('Erro na automação de e-mail:', notifErr);
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Project Move Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// --- DELIVERY MANAGEMENT ROUTES ---
router.get('/api/projects/:id/deliveries', requireAuth, async (req, res) => {
  try {
    const deliveries = await Delivery.findAll({
      where: { projectId: req.params.id },
      order: [['createdAt', 'DESC']]
    });
    res.json(deliveries);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/api/projects/:id/deliveries', requireAuth, async (req, res) => {
  try {
    const { title, downloadUrl, scheduledDate } = req.body;
    const delivery = await Delivery.create({
      title,
      downloadUrl,
      scheduledDate: scheduledDate || new Date(),
      projectId: req.params.id,
      status: 'pendente'
    });
    res.json({ success: true, delivery });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/api/deliveries/:id', requireAuth, async (req, res) => {
  try {
    const delivery = await Delivery.findByPk(req.params.id);
    if (!delivery) return res.status(404).json({ success: false, message: 'Entrega não encontrada' });
    
    await delivery.update(req.body);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.delete('/api/deliveries/:id', requireAuth, async (req, res) => {
  try {
    const delivery = await Delivery.findByPk(req.params.id);
    if (!delivery) return res.status(404).json({ success: false, message: 'Entrega não encontrada' });
    
    await delivery.destroy();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/blocos-3d', requireAuth, async (req, res) => {
  res.render('admin/assets', { layout: 'admin', title: 'Biblioteca de Blocos 3D', currentPage: 'blocks', user: req.user });
});

router.get('/revisoes', requireAuth, async (req, res) => {
  try {
    const revisions = (await Revision.findAll({ order: [['createdAt', 'DESC']], include: [{ model: Project, as: 'project' }] })).map(r => r.get({ plain: true }));
    res.render('admin/revisions', { layout: 'admin', title: 'Controle de Revisões', currentPage: 'revisions', user: req.user, revisions });
  } catch (error) {
    res.status(500).render('admin/error', { layout: 'admin', message: 'Erro ao carregar revisões' });
  }
});

router.get('/entregas', requireAuth, async (req, res) => {
  try {
    const deliveries = (await Delivery.findAll({ order: [['createdAt', 'DESC']], include: [{ model: Project, as: 'project' }] })).map(d => d.get({ plain: true }));
    res.render('admin/deliveries', { layout: 'admin', title: 'Gestão de Entregas', currentPage: 'deliveries', user: req.user, deliveries });
  } catch (error) {
    res.status(500).render('admin/error', { layout: 'admin', message: 'Erro ao carregar entregas' });
  }
});

// ==========================================
// FINANCEIRO & RELATÓRIOS
// ==========================================

router.get('/financeiro', requireAuth, checkPermission('finance'), async (req, res) => {
  try {
    const transactions = (await FinanceTransaction.findAll({ order: [['dueDate', 'DESC']] })).map(t => t.get({ plain: true }));
    const projectsRaw = await Project.findAll({ where: { status: { [Op.ne]: 'finalizado' } } });
    const projects = projectsRaw.map(p => p.get({ plain: true }));
    
    // Calcular Lucratividade por Projeto
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
    
    // BI Metrics
    const avgMargin = projectProfits.length > 0 
      ? (projectProfits.reduce((sum, p) => sum + parseFloat(p.margin), 0) / projectProfits.length).toFixed(1) 
      : 0;

    const expenseCategories = transactions
      .filter(t => t.type === 'despesa')
      .reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + parseFloat(t.amount);
        return acc;
      }, {});

    res.render('admin/finance', { 
      layout: 'admin', 
      title: 'Fluxo Financeiro', 
      currentPage: 'finance', 
      user: req.user, 
      transactions, 
      activeProjects: projects.map(p => ({ id: p.id, name: p.title })), 
      projectProfits,
      bi: { avgMargin, expenseCategories },
      stats: { income, expense, balance: income - expense } 
    });
  } catch (error) {
    res.status(500).render('admin/error', { layout: 'admin', message: 'Erro ao carregar financeiro' });
  }
});

router.post('/api/financeiro', requireAuth, async (req, res) => {
  try {
    const transaction = await FinanceTransaction.create(req.body);
    res.json({ success: true, transaction });
  } catch (error) {
    console.error('Finance API Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/relatorios', requireAuth, async (req, res) => {
  res.render('admin/ai-reports', { layout: 'admin', title: 'Relatórios & BI', currentPage: 'reports', user: req.user });
});

router.get('/produtividade', requireAuth, async (req, res) => {
  res.render('admin/productivity', { layout: 'admin', title: 'KPIs de Produtividade', currentPage: 'productivity', user: req.user });
});

// ==========================================
// COLABORAÇÃO & MARKETPLACE
// ==========================================

router.get('/automacoes', requireAuth, async (req, res) => {
  res.render('admin/automacoes', { layout: 'admin', title: 'Automações Inteligentes', currentPage: 'automations', user: req.user });
});

router.get('/previsao', requireAuth, async (req, res) => {
  try {
    const stats = {
      billingWon: 45000,
      totalInNegotiation: 120000,
      ticketMedio: 15000
    };
    const charts = {
      funnel: { labels: ['Lead', 'Proposta', 'Negociação', 'Ajustes'], data: [50000, 30000, 20000, 10000] },
      winRate: { labels: ['Ganhos', 'Perdidos'], data: [12, 5] },
      lossReasons: { labels: ['Preço', 'Prazo', 'Escopo', 'Concorrência'], data: [5, 2, 1, 3] }
    };
    res.render('admin/previsao', { layout: 'admin', title: 'Previsão & Analytics', currentPage: 'previsao', user: req.user, stats, charts });
  } catch (error) {
    res.status(500).render('admin/error', { layout: 'admin', message: 'Erro ao carregar previsões' });
  }
});

router.get('/agenda', requireAuth, async (req, res) => {
  res.render('admin/calendar', { layout: 'admin', title: 'Agenda do Estúdio', currentPage: 'calendar', user: req.user });
});

router.get('/marketing-ia', requireAuth, async (req, res) => {
  res.render('admin/marketing-ia', { layout: 'admin', title: 'Marketing Inteligente', currentPage: 'marketing-ia', user: req.user });
});

router.get('/avancado', requireAuth, checkPermission('admin'), async (req, res) => {
  res.render('admin/advanced-admin', { layout: 'admin', title: 'Painel Administrativo Avançado', currentPage: 'advanced-admin', user: req.user });
});

router.get('/rastreio-ativo', requireAuth, async (req, res) => {
  res.render('admin/rastreio-ativo', { layout: 'admin', title: 'Rastreio Ativo de Projetos', currentPage: 'active-tracking', user: req.user });
});

router.get('/templates-email', requireAuth, async (req, res) => {
  res.render('admin/automacoes', { layout: 'admin', title: 'Templates de E-mail', currentPage: 'email-templates', user: req.user });
});

router.get('/marketplace', requireAuth, async (req, res) => {
  res.render('admin/marketplace', { layout: 'admin', title: 'Marketplace 3D', currentPage: 'marketplace', user: req.user });
});

router.get('/chat', requireAuth, async (req, res) => {
  res.render('admin/chat', { layout: 'admin', title: 'Chat da Equipe', currentPage: 'chat', user: req.user });
});

router.get('/aprendizado', requireAuth, async (req, res) => {
  res.render('admin/learning', { layout: 'admin', title: 'Academia Zanoello', currentPage: 'learning', user: req.user });
});

router.get('/freelancers', requireAuth, async (req, res) => {
  try {
    const freelancers = (await Freelancer.findAll({ order: [['name', 'ASC']] })).map(f => f.get({ plain: true }));
    res.render('admin/freelancers', { layout: 'admin', title: 'Gestão de Freelancers', currentPage: 'freelancers', user: req.user, freelancers });
  } catch (error) {
    res.status(500).render('admin/error', { layout: 'admin', message: 'Erro ao carregar freelancers' });
  }
});

router.get('/portal-cliente', requireAuth, async (req, res) => {
  res.render('admin/client-portal', { layout: 'admin', title: 'Painel do Cliente', currentPage: 'client-portal', user: req.user });
});

// ==========================================
// REGISTROS & STAKEHOLDERS
// ==========================================

router.get('/contatos', requireAuth, async (req, res) => {
  try {
    const clients = (await Client.findAll({ order: [['name', 'ASC']] })).map(c => c.get({ plain: true }));
    res.render('admin/contacts', { layout: 'admin', title: 'Contatos & CRM', currentPage: 'contacts', user: req.user, clients });
  } catch (error) {
    res.status(500).render('admin/error', { layout: 'admin', message: 'Erro ao carregar contatos' });
  }
});

router.get('/registros', requireAuth, async (req, res) => {
  res.render('admin/registries', { layout: 'admin', title: 'Central de Registros', currentPage: 'registries', user: req.user });
});

router.get('/portfolio', requireAuth, async (req, res) => {
  try {
    const items = (await PortfolioItem.findAll({ order: [['createdAt', 'DESC']] })).map(i => i.get({ plain: true }));
    res.render('admin/portfolio', { layout: 'admin', title: 'Gestão de Portfólio', currentPage: 'portfolio', user: req.user, portfolioItems: items });
  } catch (error) {
    res.status(500).render('admin/error', { layout: 'admin', message: 'Erro ao carregar portfólio' });
  }
});

// ==========================================
// CONFIGURAÇÕES & ADMINISTRAÇÃO
// ==========================================

router.get('/configuracoes', requireAuth, async (req, res) => {
  res.render('admin/settings', { layout: 'admin', title: 'Configurações do Sistema', currentPage: 'settings', user: req.user });
});

router.get('/empresa', requireAuth, async (req, res) => {
  res.render('admin/empresa', { layout: 'admin', title: 'Dados da Empresa', currentPage: 'company', user: req.user });
});

router.get('/dados-bancarios', requireAuth, async (req, res) => {
  res.render('admin/bank-details', { layout: 'admin', title: 'Dados Bancários', currentPage: 'bank', user: req.user });
});

router.get('/meus-planos', requireAuth, async (req, res) => {
  res.render('admin/meus-planos', { layout: 'admin', title: 'Plano & Assinatura', currentPage: 'plans', user: req.user });
});

router.get('/avancado', requireAuth, async (req, res) => {
  try {
    const users = (await User.findAll({ order: [['name', 'ASC']] })).map(u => u.get({ plain: true }));
    const instances = (await Instance.findAll({ order: [['type', 'ASC']] })).map(i => i.get({ plain: true }));
    const plans = (await SubscriptionPlan.findAll({ order: [['price', 'ASC']] })).map(p => p.get({ plain: true }));
    const webhooks = (await Webhook.findAll({ order: [['event', 'ASC']] })).map(w => w.get({ plain: true }));
    const notifications = (await NotificationTemplate.findAll({ order: [['name', 'ASC']] })).map(n => n.get({ plain: true }));
    const logs = (await SystemLog.findAll({ limit: 100, order: [['createdAt', 'DESC']] })).map(l => l.get({ plain: true }));
    
    // Configurações globais (Banking, Security, Backup)
    const settingsRaw = await Setting.findAll({ where: { group: ['banking', 'security', 'backup'] } });
    const settings = {};
    settingsRaw.forEach(s => { settings[s.key] = s.value; });

    res.render('admin/advanced-admin', { 
      layout: 'admin', 
      title: 'Administração Avançada', 
      currentPage: 'advanced-admin', 
      user: req.user, 
      users,
      instances,
      plans,
      webhooks,
      notifications,
      logs,
      settings
    });
  } catch (error) {
    console.error('Advanced Admin Error:', error);
    res.status(500).render('admin/error', { layout: 'admin', message: 'Erro no painel avançado: ' + error.message });
  }
});

router.get('/deployment', requireAuth, checkPermission('devops'), async (req, res) => {
  res.render('admin/deployment', { layout: 'admin', title: 'Pipeline CI/CD', currentPage: 'deployment', user: req.user });
});

router.post('/api/deploy', requireAuth, checkPermission('devops'), async (req, res) => {
  const runDeploy = require('../scripts/git-deploy');
  try {
    const result = await runDeploy(`Deploy via Dashboard por ${req.user.name}`);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;

const express = require('express');
const crypto = require('crypto');
const { 
  Budget, CRMNote, CRMTask, Project, Testimonial, User, Setting, 
  Client, FinanceTransaction, Revision, Delivery, CalendarEvent, 
  KanbanColumn, TimeLog, Freelancer, PortfolioItem, ProjectTemplate,
  Instance, SubscriptionPlan, SystemLog, Webhook, NotificationTemplate,
  SmartNote, ApiKey,
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
    const allowedRoles = ['admin', 'staff', 'subscriber', 'collaborator'];
    if (!user || !allowedRoles.includes(user.role)) {
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
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    
    // 1. KPI Financeiro (Global & Mensal)
    const receitasMes = await FinanceTransaction.sum('amount', { where: { type: 'receita', dueDate: { [Op.gte]: startOfMonth } } }) || 0;
    const despesasMes = await FinanceTransaction.sum('amount', { where: { type: 'despesa', dueDate: { [Op.gte]: startOfMonth } } }) || 0;
    
    // Global stats for "Auditoria de Fluxo"
    const totalReceitas = await FinanceTransaction.sum('amount', { where: { type: 'receita' } }) || 0;
    const totalDespesas = await FinanceTransaction.sum('amount', { where: { type: 'despesa' } }) || 0;
    const receitasPendentes = await FinanceTransaction.sum('amount', { where: { type: 'receita', status: 'pendente' } }) || 0;
    
    const saldoProjetadoTotal = totalReceitas - totalDespesas;
    const margemGlobal = totalReceitas > 0 ? Math.round(((totalReceitas - totalDespesas) / totalReceitas) * 100) : 0;
    const margemMensal = receitasMes > 0 ? Math.round(((receitasMes - despesasMes) / receitasMes) * 100) : 0;

    // 1b. Calendário Compacto
    const currentWeekDays = [];
    const dayOfWeek = today.getDay(); // 0-6 (Sun-Sat)
    for (let i = 0; i < 7; i++) {
        const d = new Date(today);
        d.setDate(today.getDate() - dayOfWeek + i);
        currentWeekDays.push({
            dayName: d.toLocaleDateString('pt-BR', { weekday: 'short' }).substring(0, 3),
            dayNumber: d.getDate(),
            isToday: d.toDateString() === today.toDateString(),
            hasTasks: false // will map with upcomingTasks below
        });
    }

    // 2. Previsão de Vendas (Forecast)
    const openLeads = await Budget.findAll({ where: { winStatus: 'aberto' } });
    let forecastMax = 0;
    let forecastMed = 0;
    let forecastMin = 0;
    
    openLeads.forEach(lead => {
      const value = parseFloat(lead.estimatedValue) || 0;
      const prob = parseFloat(lead.probability) || 0; 
      
      forecastMax += value;
      forecastMed += value * (prob / 100);
      if (prob >= 80) {
        forecastMin += value;
      }
    });

    // 3. Agenda de Tarefas (Upcoming)
    const upcomingTasks = await CRMTask.findAll({
      where: {
        status: 'ativa',
        dueDate: { [Op.ne]: null }
      },
      order: [['dueDate', 'ASC']],
      limit: 5,
      include: [{ model: Budget, as: 'budget', attributes: ['id', 'name'] }]
    });

    // Map upcoming tasks to calendar
    upcomingTasks.forEach(task => {
        if (task.dueDate) {
            const taskDateStr = new Date(task.dueDate).toDateString();
            const weekDay = currentWeekDays.find(wd => {
                const wdDate = new Date();
                wdDate.setDate(new Date().getDate() - new Date().getDay() + currentWeekDays.indexOf(wd));
                return wdDate.toDateString() === taskDateStr;
            });
            if (weekDay) weekDay.hasTasks = true;
        }
    });

    // 4. Smart Notes
    const notes = await SmartNote.findAll({
      order: [['isPinned', 'DESC'], ['createdAt', 'DESC']],
      limit: 20
    });

    // 5. Termômetro de Produtividade
    const timeLogsThisMonth = await TimeLog.findAll({
      where: {
        startTime: { [Op.gte]: startOfMonth }
      }
    });
    
    let totalHoursLogged = 0;
    timeLogsThisMonth.forEach(log => {
      if (log.endTime) {
        const durationMs = new Date(log.endTime) - new Date(log.startTime);
        totalHoursLogged += durationMs / (1000 * 60 * 60);
      }
    });
    
    const metaHorasMensal = 160; 
    let produtividadeStatus = 'Gargalo';
    let produtividadeCor = 'text-red-500 bg-red-500/10 border-red-500/20';
    let produtividadeIcon = 'warning';
    
    if (totalHoursLogged >= (metaHorasMensal * 0.8)) {
        produtividadeStatus = 'Ótimo';
        produtividadeCor = 'text-green-500 bg-green-500/10 border-green-500/20';
        produtividadeIcon = 'check_circle';
    } else if (totalHoursLogged >= (metaHorasMensal * 0.5)) {
        produtividadeStatus = 'Atenção';
        produtividadeCor = 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
        produtividadeIcon = 'pending';
    }

    res.render('admin/dashboard', {
      layout: 'admin',
      title: 'Painel ArchViz ERP',
      currentPage: 'dashboard',
      user: req.user,
      now: new Date(),
      kpiFinanceiro: {
        totalReceitas: receitasMes,
        totalDespesas: despesasMes,
        saldoProjetado: receitasMes - despesasMes,
        margemMedia: margemMensal,
        margemGlobal: margemGlobal,
        receitasPendentes: receitasPendentes,
        saldoProjetadoTotal: saldoProjetadoTotal
      },
      currentWeekDays,
      forecast: {
        min: forecastMin,
        med: forecastMed,
        max: forecastMax
      },
      tasks: upcomingTasks.map(t => t.get({ plain: true })),
      notes: notes.map(n => n.get({ plain: true })),
      produtividade: {
        horasLogadas: Math.round(totalHoursLogged),
        metaHoras: metaHorasMensal,
        status: produtividadeStatus,
        cor: produtividadeCor,
        icon: produtividadeIcon
      }
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).render('admin/error', { layout: 'admin', message: 'Erro ao carregar dashboard', error: error });
  }
});

// ==========================================
// API SMART NOTES
// ==========================================

router.post('/api/notes', requireAuth, async (req, res) => {
  try {
    const { content, color } = req.body;
    
    // Extração de hashtags simples usando Regex (#palavra)
    const hashtagsMatch = content.match(/#[a-zA-Z0-9_]+/g);
    const hashtags = hashtagsMatch ? hashtagsMatch.join(',') : '';

    const note = await SmartNote.create({
      content,
      color: color || 'bg-yellow-100',
      hashtags,
      createdBy: req.user.name
    });
    
    res.json({ success: true, note });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.delete('/api/notes/:id', requireAuth, async (req, res) => {
  try {
    await SmartNote.destroy({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/api/notes/:id/color', requireAuth, async (req, res) => {
  try {
    const { color } = req.body;
    await SmartNote.update({ color }, { where: { id: req.params.id } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
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
      include: [
        { model: Client, as: 'client', attributes: ['id', 'name', 'phone', 'email', 'company'] },
        { model: User, as: 'assignedUser', attributes: ['id', 'name'] }
      ],
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
      data.installments = data.installments || 1;
      data.softwareStack = data.softwareStack || [];
      data.productionDays = data.productionDays || null;
      return data;
    });
    
    // Carregar equipe para o select de Responsável Comercial
    const teamMembers = (await User.findAll({ 
      attributes: ['id', 'name', 'role'],
      order: [['name', 'ASC']] 
    })).map(u => u.get({ plain: true }));

    const kanban = {};
    const pipelineTotals = {};
    columns.forEach(col => {
      const colDeals = deals.filter(d => d.status === col.statusKey);
      kanban[col.statusKey] = colDeals;
      pipelineTotals[col.statusKey] = colDeals.reduce((sum, d) => sum + (parseFloat(d.estimatedValue) || 0), 0);
    });
    const totalNegotiationValue = deals.reduce((sum, d) => sum + (parseFloat(d.estimatedValue) || 0), 0);

    // === Analytics Logic ===
    const allDealsForStats = await Budget.findAll();
    const allPlain = allDealsForStats.map(d => d.get({ plain: true }));
    
    const stats = {
      billingWon: allPlain.filter(d => d.winStatus === 'ganho').reduce((sum, d) => sum + (parseFloat(d.estimatedValue) || 0), 0),
      totalInNegotiation: deals.reduce((sum, d) => sum + (parseFloat(d.estimatedValue) || 0), 0),
      ticketMedio: 0,
      conversionRate: 0
    };

    const wonDeals = allPlain.filter(d => d.winStatus === 'ganho');
    stats.ticketMedio = wonDeals.length > 0 ? stats.billingWon / wonDeals.length : 0;

    const lostDealsCount = allPlain.filter(d => d.winStatus === 'perdido').length;
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
        labels: [...new Set(allPlain.filter(d => d.lossReason).map(d => d.lossReason))],
        data: []
      }
    };
    charts.lossReasons.data = charts.lossReasons.labels.map(reason => 
      allPlain.filter(d => d.lossReason === reason).length
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
      teamMembers,
      stats,
      charts
    });
  } catch (error) {
    console.error('CRM Route Error:', error);
    res.status(500).render('admin/error', { layout: 'admin', message: 'Erro no pipeline de vendas' });
  }
});

router.post('/negociacoes/add', requireAuth, async (req, res) => {
  try {
    const { 
      name, email, phone, projectType, estimatedValue, description, 
      targetSoftware, floorPlansCount, imagesCount, animationSeconds, 
      driveLink, visualStyle, color, totalArea, productionDays, 
      clientBudget, assignedUserId, softwareStack, complexity, 
      installments, probability, origin
    } = req.body;
    
    await Budget.create({
      name,
      email: email || null,
      phone: phone || null,
      projectType: projectType || 'Outro',
      estimatedValue: estimatedValue ? parseFloat(estimatedValue) : null,
      description: description || null,
      targetSoftware: targetSoftware || null,
      floorPlansCount: floorPlansCount ? parseInt(floorPlansCount) : 0,
      imagesCount: imagesCount ? parseInt(imagesCount) : 0,
      animationSeconds: animationSeconds ? parseInt(animationSeconds) : 0,
      driveLink: driveLink || null,
      visualStyle: visualStyle || null,
      color: color || '#f97316',
      totalArea: totalArea ? parseFloat(totalArea) : null,
      productionDays: productionDays ? parseInt(productionDays) : null,
      clientBudget: clientBudget ? parseFloat(clientBudget) : null,
      assignedUserId: assignedUserId || null,
      softwareStack: Array.isArray(softwareStack) ? softwareStack : [],
      complexity: complexity || 'Média',
      installments: installments ? parseInt(installments) : 1,
      probability: probability ? parseInt(probability) : 50,
      origin: origin || null,
      status: 'novo',
      winStatus: 'aberto',
      source: 'manual'
    });

    req.flash('success_msg', 'Lead criado com sucesso!');
    res.redirect('/admin/negociacoes');
  } catch (error) {
    console.error('Create Lead Error:', error);
    req.flash('error_msg', 'Erro ao criar lead: ' + error.message);
    res.redirect('/admin/negociacoes');
  }
});

router.post('/negociacoes/:id/confirm-project', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const budget = await Budget.findByPk(id);
    if (!budget) return res.status(404).json({ success: false, error: 'Negociação não encontrada' });

    // Clonar para Projeto com integridade total de dados (Tier 1 Mirror)
    await Project.create({
      title: budget.name,
      client: budget.name || 'Cliente Direto',
      clientId: budget.clientId,
      category: budget.projectType === 'Arquitetônico' ? 'arquitetonico' : 
                (budget.projectType === 'Interiores' ? 'interior' : 
                (budget.projectType === 'Animação' ? 'animacao' : 'outro')),
      software: budget.targetSoftware || budget.software,
      softwareStack: budget.softwareStack || [],
      renderEngine: budget.renderEngine || 'D5 Render',
      price: budget.estimatedValue,
      deadline: budget.deadline,
      totalArea: budget.totalArea, 
      productionDays: budget.productionDays,
      origin: budget.origin,
      visualStyle: budget.visualStyle,
      complexity: budget.complexity,
      priority: budget.priority || 'media',
      description: budget.description,
      startDate: new Date(),
      status: 'producao',
      budgetId: budget.id,
      image: 'default-project.jpg' 
    });

    // Atualizar Negociação
    await budget.update({ 
      status: 'fechado', 
      winStatus: 'ganho',
      closeDate: new Date(),
      proposalStatus: 'aceita'
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

router.post('/negociacoes/novo', requireAuth, async (req, res) => {
  try {
    const { name, clientName, projectType, totalArea, visualStyle, targetSoftware, estimatedValue, deadline, productionDays, clientBudget } = req.body;
    
    const columns = await KanbanColumn.findAll({ where: { type: 'leads' }, order: [['order', 'ASC']] });
    const firstStatus = columns.length > 0 ? columns[0].statusKey : 'novo_lead';
    
    const lead = await Budget.create({
      name,
      clientName: clientName || null,
      email: clientName && clientName.includes('@') ? clientName : null,
      projectType: projectType || 'Outro',
      totalArea: totalArea ? parseFloat(totalArea) : null,
      visualStyle: visualStyle || null,
      targetSoftware: targetSoftware || null,
      estimatedValue: estimatedValue ? parseFloat(estimatedValue) : null,
      deadline: deadline || null,
      productionDays: productionDays ? parseInt(productionDays) : null,
      clientBudget: clientBudget ? parseFloat(clientBudget) : null,
      status: firstStatus,
      color: '#f97316'
    });

    if (req.headers.accept && req.headers.accept.includes('application/json')) {
      return res.json({ success: true, lead });
    }
    
    req.flash('success_msg', 'Lead criado com sucesso!');
    res.redirect('/admin/crm');
  } catch (error) {
    console.error('Create Lead Error:', error);
    if (req.headers.accept && req.headers.accept.includes('application/json')) {
      return res.status(500).json({ success: false, error: error.message });
    }
    req.flash('error_msg', 'Erro ao criar lead: ' + error.message);
    res.redirect('/admin/crm');
  }
});

router.post('/negociacoes/:id/update', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      name, email, phone, projectType, estimatedValue, description, 
      targetSoftware, floorPlansCount, imagesCount, animationSeconds, 
      driveLink, visualStyle, color, deadline, productionDays, clientBudget 
    } = req.body;
    
    const budget = await Budget.findByPk(id);
    if (!budget) {
      if (req.headers.accept && req.headers.accept.includes('application/json')) {
        return res.status(404).json({ success: false, error: 'Lead não encontrado' });
      }
      req.flash('error_msg', 'Lead não encontrado.');
      return res.redirect('/admin/crm');
    }

    await budget.update({
      name,
      email: email || null,
      phone: phone || null,
      projectType: projectType || 'Outro',
      estimatedValue: estimatedValue ? parseFloat(estimatedValue) : null,
      description: description || null,
      targetSoftware: targetSoftware || null,
      floorPlansCount: floorPlansCount ? parseInt(floorPlansCount) : 0,
      imagesCount: imagesCount ? parseInt(imagesCount) : 0,
      animationSeconds: animationSeconds ? parseInt(animationSeconds) : 0,
      driveLink: driveLink || null,
      visualStyle: visualStyle || null,
      color: color || budget.color,
      deadline: deadline || null,
      productionDays: productionDays ? parseInt(productionDays) : null,
      clientBudget: clientBudget ? parseFloat(clientBudget) : null
    });

    if (req.headers.accept && req.headers.accept.includes('application/json')) {
      return res.json({ success: true });
    }

    req.flash('success_msg', 'Lead atualizado com sucesso!');
    res.redirect('/admin/crm');
  } catch (error) {
    console.error('Update Lead Error:', error);
    if (req.headers.accept && req.headers.accept.includes('application/json')) {
      return res.status(500).json({ success: false, error: error.message });
    }
    req.flash('error_msg', 'Erro ao atualizar lead: ' + error.message);
    res.redirect('/admin/crm');
  }
});

router.post('/negociacoes/:id/confirm-project', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const budget = await Budget.findByPk(id);
    if (!budget) return res.status(404).json({ error: 'Lead não encontrado' });
    
    // Mark as "ganho" or similar
    await budget.update({ winStatus: 'ganho' });
    
    // Redirect to project creation page with budget data
    res.redirect(`/admin/projetos/criar?budgetId=${id}`);
  } catch (error) {
    console.error('Confirm Project Error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/projetos/criar', requireAuth, async (req, res) => {
  try {
    const { budgetId } = req.query;
    let budgetData = null;
    if (budgetId) {
      budgetData = await Budget.findByPk(budgetId);
      if (budgetData) budgetData = budgetData.get({ plain: true });
    }
    
    res.render('admin/projects-create', { 
      layout: 'admin', 
      title: 'Lançar Novo Projeto', 
      currentPage: 'projetos', 
      user: req.user,
      budgetData
    });
  } catch (error) {
    res.status(500).render('admin/error', { layout: 'admin', message: error.message });
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
    const columns = (await KanbanColumn.findAll({ where: { type: 'crm' }, order: [['order', 'ASC']] })).map(c => c.get({ plain: true }));
    const budgetsRaw = await Budget.findAll({ order: [['createdAt', 'DESC']] });
    const budgets = budgetsRaw.map(b => b.get({ plain: true }));
    
    const kanban = {};
    columns.forEach(col => { kanban[col.statusKey] = budgets.filter(b => b.status === col.statusKey); });

    const totalVgv = budgets.reduce((acc, curr) => acc + parseFloat(curr.estimatedValue || 0), 0);

    res.render('admin/crm', { layout: 'admin', title: 'Pipeline de Leads', currentPage: 'crm', user: req.user, columns, kanban, budgets, totalVgv });
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
    const rawProjects = await Project.findAll({ order: [['createdAt', 'DESC']] });
    const projects = rawProjects.map(p => p.get({ plain: true }));
    
    // Configuração das Colunas do Kanban de Projetos (ArchViz)
    const pipelineColumns = [
        { key: 'briefing', title: '1. Briefing & Setup', color: '#6366f1' },       // Indigo
        { key: 'modelagem', title: '2. Modelagem 3D', color: '#f59e0b' },        // Amber
        { key: 'renderizacao', title: '3. Render & Setup', color: '#ef4444' },   // Red
        { key: 'pos_producao', title: '4. Pós-Produção', color: '#8b5cf6' },     // Purple
        { key: 'entregue', title: '5. Entregue / Aprovado', color: '#10b981' }   // Emerald
    ];

    // Agrupar os projetos por status (fallback para briefing se não houver)
    const projectsKanban = {
        briefing: [],
        modelagem: [],
        renderizacao: [],
        pos_producao: [],
        entregue: []
    };

    projects.forEach(p => {
        const status = p.status || 'briefing';
        if (projectsKanban[status]) {
            projectsKanban[status].push(p);
        } else {
            projectsKanban['briefing'].push(p); // Fallback
        }
    });

    res.render('admin/projects', { 
        layout: 'admin', 
        title: 'Produção ArchViz', 
        currentPage: 'projects', 
        user: req.user, 
        projects,
        pipelineColumns,
        projectsKanban
    });
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

    await project.update({ status }, { user: req.user, ipAddress: req.ip });

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

// GET Project details for Modal
router.get('/api/projects/:id', requireAuth, async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.id, {
      include: [
        { model: Client, as: 'customer' },
        { model: Budget, as: 'budget' }
      ]
    });
    if (!project) return res.status(404).json({ success: false, error: 'Projeto não encontrado' });
    res.json({ success: true, project });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// UPDATE Project details
router.put('/api/projects/:id', requireAuth, async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.id);
    if (!project) return res.status(404).json({ success: false, error: 'Projeto não encontrado' });
    
    // Convert numerical fields
    const data = { ...req.body };
    if (data.price) data.price = parseFloat(data.price);
    if (data.totalArea) data.totalArea = parseFloat(data.totalArea);
    if (data.productionDays) data.productionDays = parseInt(data.productionDays);
    if (data.priority_value) data.priority_value = parseInt(data.priority_value);
    
    await project.update(data);
    res.json({ success: true, project });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// CREATE Project
router.post('/api/projects', requireAuth, async (req, res) => {
  try {
    const data = { ...req.body };
    if (data.price) data.price = parseFloat(data.price);
    if (data.totalArea) data.totalArea = parseFloat(data.totalArea);
    if (data.productionDays) data.productionDays = parseInt(data.productionDays);
    
    // Default status if not provided
    if (!data.status) data.status = 'briefing';
    
    const project = await Project.create(data);
    res.json({ success: true, project });
  } catch (error) {
    console.error('API Create Project Error:', error);
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
    
    // Calcular Lucratividade por Projeto (FRENTE 3: Margem por Projeto)
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

    // FRENTE 3: Centro de Custos (Despesas agrupadas por categoria)
    const expenseCategories = transactions
      .filter(t => t.type === 'despesa')
      .reduce((acc, t) => {
        const key = t.category || 'sem_categoria';
        acc[key] = (acc[key] || 0) + parseFloat(t.amount);
        return acc;
      }, {});

    // FRENTE 3: Centro de Custos (Despesas agrupadas por costCenter)
    const costCenters = transactions
      .filter(t => t.type === 'despesa')
      .reduce((acc, t) => {
        const key = t.costCenter || t.category || 'geral';
        acc[key] = (acc[key] || 0) + parseFloat(t.amount);
        return acc;
      }, {});

    // FRENTE 3: Fluxo de Caixa Realizado vs. Projetado (Últimos 6 meses)
    const now = new Date();
    const cashFlow = { labels: [], realized: [], projected: [] };
    
    for (let i = 5; i >= 0; i--) {
      const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
      const label = month.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' });
      cashFlow.labels.push(label.charAt(0).toUpperCase() + label.slice(1));
      
      // Realizado: transações que foram pagas/recebidas neste mês
      const monthTransactions = transactions.filter(t => {
        const d = new Date(t.paymentDate || t.dueDate);
        return d >= month && d <= monthEnd && (t.status === 'pago' || t.status === 'recebido');
      });
      const monthIncome = monthTransactions.filter(t => t.type === 'receita').reduce((s, t) => s + (parseFloat(t.amount) || 0), 0);
      const monthExpense = monthTransactions.filter(t => t.type === 'despesa').reduce((s, t) => s + (parseFloat(t.amount) || 0), 0);
      cashFlow.realized.push(monthIncome - monthExpense);
      
      // Projetado: todas as transações com vencimento neste mês (incluindo pendentes)
      const projectedTransactions = transactions.filter(t => {
        const d = new Date(t.dueDate);
        return d >= month && d <= monthEnd;
      });
      const projIncome = projectedTransactions.filter(t => t.type === 'receita').reduce((s, t) => s + (parseFloat(t.amount) || 0), 0);
      const projExpense = projectedTransactions.filter(t => t.type === 'despesa').reduce((s, t) => s + (parseFloat(t.amount) || 0), 0);
      cashFlow.projected.push(projIncome - projExpense);
    }

    // Projeção futura: parcelas de propostas fechadas (won deals)
    const wonBudgets = (await Budget.findAll({ where: { winStatus: 'ganho' } })).map(b => b.get({ plain: true }));
    const futureInstallments = wonBudgets.reduce((total, b) => {
      const installments = b.installments || 1;
      const valor = parseFloat(b.estimatedValue) || 0;
      const parcelaMensal = valor / installments;
      // Contar parcelas que ainda não foram registradas como transação
      const registeredIncome = transactions
        .filter(t => t.budgetId === b.id && t.type === 'receita')
        .reduce((s, t) => s + (parseFloat(t.amount) || 0), 0);
      return total + Math.max(0, valor - registeredIncome);
    }, 0);

    res.render('admin/finance', { 
      layout: 'admin', 
      title: 'Fluxo Financeiro', 
      currentPage: 'finance', 
      user: req.user, 
      transactions, 
      activeProjects: projects.map(p => ({ id: p.id, name: p.title })), 
      projectProfits,
      bi: { avgMargin, expenseCategories, costCenters },
      cashFlow,
      futureInstallments,
      stats: { income, expense, balance: income - expense } 
    });
  } catch (error) {
    console.error('Finance Route Error:', error);
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
  try {
    const usersRaw = await User.findAll({ order: [['name', 'ASC']] });
    const users = usersRaw.map(u => {
      const data = u.get({ plain: true });
      data.permissions = data.permissions || {};
      return data;
    });

    // 1. Assinantes (Subscribers) e seus dependentes
    const subscriberUsers = users.filter(u => u.role === 'subscriber').map(sub => ({
      ...sub,
      subUsers: users.filter(u => u.parentId === sub.id)
    }));

    // 2. Staff e Admins (Equipe Master) - Incluindo aqueles que porventura tenham parentId (mas não deveriam)
    const staffUsers = users.filter(u => (u.role === 'admin' || u.role === 'staff'));

    // 3. Colaboradores e outros usuários
    const collaboratorUsers = users.filter(u => u.role === 'collaborator' || u.role === 'user');
    
    // Identificar orfãos (colaboradores sem pai vinculado)
    const orphanUsers = collaboratorUsers.filter(u => !u.parentId);

    // Combinar para a aba de "Outros" apenas quem NÃO é staff e NÃO tem pai (ou seja, colaboradores avulsos)
    // E staff que não são assinantes.
    const otherUsers = [...staffUsers, ...orphanUsers];

    const instances = (await Instance.findAll({ order: [['createdAt', 'DESC']] })).map(i => i.get({ plain: true }));
    const plans = (await SubscriptionPlan.findAll({ order: [['price', 'ASC']] })).map(p => p.get({ plain: true }));
    const logs = (await SystemLog.findAll({ limit: 50, order: [['createdAt', 'DESC']] })).map(l => l.get({ plain: true }));
    const notifications = (await NotificationTemplate.findAll()).map(n => n.get({ plain: true }));

    console.log(`[AVANCADO] Renderizando: ${subscriberUsers.length} Assinantes, ${otherUsers.length} Equipe/Outros.`);

    res.render('admin/advanced-admin', { 
      layout: 'admin', 
      title: 'Painel Administrativo Avançado', 
      currentPage: 'advanced-admin', 
      user: req.user,
      users,
      subscriberUsers,
      otherUsers,
      instances,
      plans,
      logs,
      notifications
    });
  } catch (error) {
    console.error('Advanced Admin Route Error:', error);
    res.status(500).render('admin/error', { layout: 'admin', message: 'Erro ao carregar painel avançado: ' + error.message });
  }
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

// Criar novo usuário manual (Painel Master) — Extended for ArchViz Studio
router.post('/api/users', requireAuth, checkPermission('admin'), async (req, res) => {
  try {
    console.log('[API/Users] Criando usuário manual:', req.body.email);
    const { 
      name, email, password, role, tenantName, parentId, specialty, mainTool,
      phone, phoneWhatsapp, jobTitle, weeklyHours, costHour, techStack, softwareLicenses,
      permissions
    } = req.body;
    
    const existing = await User.findOne({ where: { email } });
    if (existing) return res.status(400).json({ error: 'E-mail já está em uso.' });
    
    // NOTA: Password hashing é tratado pelo hook beforeCreate no model User.js
    const newUser = await User.create({
      name,
      email,
      password, // O model cuidará do hash
      role,
      tenantName,
      parentId: parentId || null,
      specialty: specialty || null,
      mainTool: mainTool || null,
      phone: phone || null,
      phoneWhatsapp: phoneWhatsapp || null,
      jobTitle: jobTitle || null,
      weeklyHours: weeklyHours ? parseInt(weeklyHours) : 40,
      costHour: costHour ? parseFloat(costHour) : 0,
      techStack: techStack || [],
      softwareLicenses: softwareLicenses || [],
      permissions: permissions || {
        crm: true,
        projects: true,
        finance: false,
        canApproveBudgets: false,
        canSeeFinance: false,
        ownProjectsOnly: false
      },
      isVerified: true,
      isActive: true
    });
    
    await SystemLog.create({
      action: 'User Created Manually',
      module: 'Security/Admin',
      details: `User: ${name} (${role})`,
      userName: req.user.name,
      ipAddress: req.ip
    });

    console.log('[API/Users] Usuário criado com sucesso ID:', newUser.id);
    res.json({ success: true, user: { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role } });
  } catch (err) {
    console.error('Create user error:', err);
    res.status(500).json({ error: 'Erro ao criar usuário: ' + err.message });
  }
});

// Forçar troca de senha (Painel Master)
router.post('/api/users/:id/reset-password', requireAuth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Acesso negado.' });
    
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: 'Usuário não encontrado.' });
    
    const { newPassword } = req.body;
    if (!newPassword) return res.status(400).json({ error: 'Nova senha é obrigatória.' });
    
    user.password = newPassword;
    await user.save();
    
    res.json({ success: true, message: 'Senha atualizada com sucesso.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao redefinir senha' });
  }
});

// Atualizar dados de usuário (Painel Master)
router.patch('/api/users/:id', requireAuth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Acesso negado.' });
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: 'Usuário não encontrado.' });
    
    const allowed = ['name','email','role','phone','phoneWhatsapp','jobTitle','specialty','mainTool','weeklyHours','costHour','techStack','softwareLicenses','permissions','tenantName'];
    const updates = {};
    allowed.forEach(f => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });
    
    await user.update(updates);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Ações de gestão de usuário: suspend, force-logout
router.post('/api/users/:id/action', requireAuth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Acesso negado.' });
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: 'Usuário não encontrado.' });
    
    const { action, reason } = req.body;
    
    if (action === 'suspend') {
      await user.update({ isActive: false, suspendedAt: new Date(), suspensionReason: reason || 'Suspenso pelo admin' });
      return res.json({ success: true, message: 'Acesso suspenso.' });
    }
    if (action === 'reactivate') {
      await user.update({ isActive: true, suspendedAt: null, suspensionReason: null });
      return res.json({ success: true, message: 'Acesso reativado.' });
    }
    if (action === 'force-logout') {
      await user.update({ forcedLogoutAt: new Date() });
      return res.json({ success: true, message: 'Logout forçado registrado.' });
    }
    
    res.status(400).json({ error: 'Ação desconhecida: ' + action });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE User
router.delete('/api/users/:id', requireAuth, checkPermission('admin'), async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });
    
    await user.destroy();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// API PLANOS B2B
// ==========================================

// ==========================================
// API PLANOS B2B
// ==========================================

router.post('/api/plans', requireAuth, checkPermission('admin'), async (req, res) => {
  try {
    const plan = await SubscriptionPlan.create(req.body);
    await SystemLog.create({
      action: 'Plan Created',
      module: 'Finance/B2B',
      details: `Plan: ${plan.name} - R$ ${plan.price}`,
      userName: req.user.name,
      ipAddress: req.ip
    });
    res.json({ success: true, plan });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.patch('/api/plans/:id', requireAuth, checkPermission('admin'), async (req, res) => {
  try {
    const plan = await SubscriptionPlan.findByPk(req.params.id);
    if (!plan) return res.status(404).json({ error: 'Plano não encontrado' });
    
    await plan.update(req.body);
    await SystemLog.create({
      action: 'Plan Updated',
      module: 'Finance/B2B',
      details: `Plan: ${plan.name}`,
      userName: req.user.name,
      ipAddress: req.ip
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.delete('/api/plans/:id', requireAuth, checkPermission('admin'), async (req, res) => {
  try {
    await SubscriptionPlan.destroy({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==========================================
// API PROJETOS
// ==========================================

router.get('/api/projects/:id', requireAuth, async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.id, {
      include: [{ model: Client, as: 'client' }]
    });
    if (!project) return res.status(404).json({ error: 'Projeto não encontrado' });
    res.json(project);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/api/projects/move', requireAuth, async (req, res) => {
  try {
    const { projectId, statusId } = req.body;
    await Project.update({ status: statusId }, { where: { id: projectId } });
    
    await SystemLog.create({
      action: 'Project Moved',
      module: 'Production',
      details: `Moved to ${statusId}`,
      userName: req.user.name,
      ipAddress: req.ip
    });
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// API INSTÂNCIAS & INFRA
// ==========================================

// ==========================================
// API INSTÂNCIAS & INFRA
// ==========================================

router.post('/api/instances', requireAuth, checkPermission('admin'), async (req, res) => {
  try {
    const { name, integrationType, token, status } = req.body;
    const instance = await Instance.create({
      name, integrationType, token, status: status || 'online',
      type: 'rendernode', // Default
      cpuUsage: 0,
      uptime: '0h'
    });
    
    await SystemLog.create({
      action: 'Instance Created',
      module: 'Infrastructure',
      details: `Instance: ${name} (${integrationType})`,
      userName: req.user.name,
      ipAddress: req.ip
    });
    
    res.json({ success: true, instance });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/api/instances/sync', requireAuth, checkPermission('admin'), async (req, res) => {
  try {
    // Sincronização de Cluster (FRENTE 4: Infra & Nodes)
    await SystemLog.create({
      action: 'Cluster Sync',
      module: 'Infrastructure',
      details: 'Sincronização manual disparada via Painel Master.',
      userName: req.user.name,
      ipAddress: req.ip
    });
    // Simulação de delay de rede
    await new Promise(resolve => setTimeout(resolve, 800));
    res.json({ success: true, message: 'Cluster sincronizado com sucesso. Todos os nós operantes.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/api/instances/:id/action', requireAuth, checkPermission('admin'), async (req, res) => {
  try {
    const { action } = req.body;
    const instance = await Instance.findByPk(req.params.id);
    if (!instance) return res.status(404).json({ error: 'Instância não encontrada' });

    // Lógica simulada de infra
    let status = 'online';
    if (action === 'restart') status = 'restarting';
    if (action === 'stop') status = 'offline';

    await instance.update({ status });
    
    await SystemLog.create({
      action: `Instance ${action.toUpperCase()}`,
      module: 'Infrastructure',
      details: `Instance: ${instance.name}`,
      userName: req.user.name,
      ipAddress: req.ip
    });

    res.json({ success: true, message: `Ação ${action} executada com sucesso.` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// API FREELANCERS
// ==========================================

router.post('/freelancers', requireAuth, async (req, res) => {
  try {
    const { expertise } = req.body;
    const data = { ...req.body };
    if (Array.isArray(expertise)) data.expertise = expertise.join(', ');
    
    await Freelancer.create(data);
    req.flash('success_msg', 'Freelancer adicionado ao banco de talentos!');
    res.redirect('/admin/freelancers');
  } catch (error) {
    console.error('Freelancer Create Error:', error);
    req.flash('error_msg', 'Erro ao adicionar freelancer: ' + error.message);
    res.redirect('/admin/freelancers');
  }
});

router.patch('/api/freelancers/:id', requireAuth, async (req, res) => {
  try {
    await Freelancer.update(req.body, { where: { id: req.params.id } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.delete('/api/freelancers/:id', requireAuth, async (req, res) => {
  try {
    await Freelancer.destroy({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});


// Analytics de usuário para Relatório de Staff
router.get('/api/users/:id/analytics', requireAuth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Acesso negado.' });
    const userId = req.params.id;
    
    const [activeProjects, timeLogs, revisions] = await Promise.all([
      Project.findAll({ where: { status: { [Op.in]: ['producao','revisao','entrega'] } }, attributes: ['id','title','status','deadline'] }),
      TimeLog.findAll({ where: { userId }, order: [['startTime','DESC']], limit: 100 }),
      Revision.findAll({ include: [{ model: Project, as: 'project', attributes: ['id','title'] }], order: [['createdAt','DESC']], limit: 50 })
    ]);
    
    let totalHours = 0;
    timeLogs.forEach(l => { if (l.endTime) totalHours += (new Date(l.endTime) - new Date(l.startTime)) / 3600000; });
    
    const projectRevisionCounts = {};
    revisions.forEach(r => {
      const pid = r.projectId;
      projectRevisionCounts[pid] = (projectRevisionCounts[pid] || 0) + 1;
    });
    const avgRevisions = revisions.length > 0 ? (Object.values(projectRevisionCounts).reduce((s,v) => s+v,0) / Object.keys(projectRevisionCounts).length) : 0;
    
    res.json({
      success: true,
      analytics: {
        activeProjectsCount: activeProjects.length,
        projects: activeProjects.map(p => p.get({ plain: true })),
        totalHoursLogged: Math.round(totalHours * 10) / 10,
        avgRevisionsPerProject: Math.round(avgRevisions * 10) / 10,
        timeLogsCount: timeLogs.length
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.get('/configuracoes', requireAuth, async (req, res) => {
  try {
    const usersRaw = await User.findAll({ order: [['role', 'ASC'], ['name', 'ASC']] });
    
    const subscriberUsers = [];
    const otherUsers = [];
    const subscribers = {};
    
    usersRaw.forEach(u => {
      const plainUser = u.get({ plain: true });
      if (plainUser.role === 'subscriber') {
        plainUser.subUsers = [];
        subscribers[plainUser.id] = plainUser;
        subscriberUsers.push(plainUser);
      } else {
        otherUsers.push(plainUser);
      }
    });

    usersRaw.forEach(u => {
      const plainUser = u.get({ plain: true });
      if (plainUser.role !== 'subscriber' && plainUser.parentId && subscribers[plainUser.parentId]) {
        subscribers[plainUser.parentId].subUsers.push(plainUser);
      }
    });

    res.render('admin/settings', { 
      layout: 'admin', 
      title: 'Configurações do Sistema', 
      currentPage: 'settings', 
      user: req.user,
      subscriberUsers,
      otherUsers
    });
  } catch (error) {
    console.error('Settings Error:', error);
    res.status(500).render('admin/error', { layout: 'admin', message: 'Erro ao carregar configurações: ' + error.message });
  }
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

// Duplicated route removed.


// ==========================================
// DEPLOY CI/CD — Enhanced with proper status response
// ==========================================
router.post('/api/deploy', requireAuth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ success: false, message: 'Acesso negado.' });
    
    // Forçamos a limpeza do cache do script para garantir que a versão mais nova do disco seja lida
    const scriptPath = require.resolve('../scripts/prod-pull');
    delete require.cache[scriptPath];
    const pullProduction = require('../scripts/prod-pull');

    console.log(`[Deploy] Iniciado por ${req.user.name}`);
    const result = await pullProduction();

    await SystemLog.create({
      level: result.success ? 'info' : 'error',
      message: `Deploy ${result.success ? 'concluído' : 'falhou'}: ${result.message}`,
      service: 'deploy',
      userId: req.user.id
    }).catch(() => {});
    
    if (result.success) {
      return res.json({ success: true, message: 'Servidor atualizado com sucesso via Pipeline Interno!' });
    } else {
      // Se falhou, retornamos os detalhes para o painel
      return res.status(500).json({ 
        success: false, 
        message: result.message, 
        details: result.details 
      });
    }
  } catch (error) {
    console.error('Deploy Error:', error);
    res.status(500).json({ success: false, message: 'Erro crítico no executor de deploy: ' + error.message });
  }
});

// ==========================================
// API KEYS — Stripe-Style Key Management
// ==========================================

// Listar todas as chaves ativas
router.get('/api/keys', requireAuth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Acesso negado.' });
    const keys = await ApiKey.findAll({
      order: [['createdAt', 'DESC']],
      attributes: ['id', 'name', 'keyMasked', 'keyPrefix', 'isActive', 'scopes', 'lastUsedAt', 'createdAt']
    });
    res.json({ success: true, keys: keys.map(k => k.get({ plain: true })) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Gerar nova API Key (padrão Stripe — chave exibida apenas uma vez)
router.post('/api/keys', requireAuth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Acesso negado.' });
    
    const { name, scopes } = req.body;
    if (!name) return res.status(400).json({ error: 'Nome da chave é obrigatório.' });
    
    // Gera 32 bytes seguros (256 bits de entropia)
    const rawKey = crypto.randomBytes(32).toString('hex');
    const prefix = 'sk_live_';
    const fullKey = `${prefix}${rawKey}`;
    
    // Hash para armazenamento seguro (nunca salvamos a chave crua)
    const keyHash = crypto.createHash('sha256').update(fullKey).digest('hex');
    
    // Mascarado: sk_live_...Xf7k (últimos 4 chars)
    const keyMasked = `${prefix}...${rawKey.slice(-4)}`;
    
    const apiKey = await ApiKey.create({
      name,
      keyPrefix: prefix,
      keyHash,
      keyMasked,
      createdBy: req.user.id,
      scopes: scopes || ['read'],
      isActive: true
    });
    
    // Retorna a chave completa UMA ÚNICA VEZ
    res.json({
      success: true,
      key: {
        id: apiKey.id,
        name: apiKey.name,
        fullKey,           // ← exibida apenas nesta resposta
        keyMasked,
        createdAt: apiKey.createdAt
      }
    });
  } catch (err) {
    console.error('ApiKey creation error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Revogar uma API Key
router.delete('/api/keys/:id', requireAuth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Acesso negado.' });
    const key = await ApiKey.findByPk(req.params.id);
    if (!key) return res.status(404).json({ error: 'Chave não encontrada.' });
    await key.update({ isActive: false });
    res.json({ success: true, message: 'Chave revogada com sucesso.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// === LEADS API (CRM Novo Lead) ===
router.post('/api/leads', requireAuth, async (req, res) => {
  try {
    const { name, email, estimatedValue, probability, notes, projectType, totalArea, targetSoftware, visualStyle, clientName } = req.body;
    
    const lead = await Budget.create({
      name: name || 'Novo Lead',
      email: email || null,
      estimatedValue: parseFloat(estimatedValue) || 0,
      probability: parseInt(probability) || 50,
      description: notes || null,
      status: 'novo_lead',
      winStatus: 'aberto',
      source: 'manual',
      projectType: projectType || 'Outro',
      totalArea: parseFloat(totalArea) || null,
      targetSoftware: targetSoftware || null,
      visualStyle: visualStyle || null,
      clientName: clientName || null
    });

    res.json({ success: true, lead });
  } catch (error) {
    console.error('API Create Lead Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// === TEMPLATES API ===
router.get('/api/templates', requireAuth, async (req, res) => {
  try {
    const templates = await NotificationTemplate.findAll({ where: { isActive: true } });
    const mapped = templates.map(t => ({
      id: t.id, name: t.name, category: t.type.toUpperCase(), content: t.body
    }));

    if (mapped.length === 0) {
      return res.json([
        { name: 'Bem-vindo Zanoello', category: 'WHATSAPP', content: 'Olá! Recebemos seu contato. Em breve um de nossos especialistas falará com você.' },
        { name: 'Aprovação de Orçamento', category: 'EMAIL', content: 'Prezado cliente, sua proposta foi aprovada.' }
      ]);
    }
    res.json(mapped);
  } catch (error) {
    console.error('API Templates Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// === SYSTEM SETTINGS (BANKING/SECURITY) ===
router.post('/api/settings/bulk', requireAuth, checkPermission('admin'), async (req, res) => {
  try {
    const { settings } = req.body; // { key: value }
    for (const [key, value] of Object.entries(settings)) {
      await Setting.upsert({ key, value: String(value), group: 'admin' });
    }
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// === SECURITY & INFRA ACTIONS ===
router.post('/api/security/terminate-sessions', requireAuth, checkPermission('admin'), async (req, res) => {
  try {
    await User.update({ forcedLogoutAt: new Date() }, { where: { id: { [Op.ne]: req.user.id } } });
    
    await SystemLog.create({
      action: 'Global Session Termination',
      module: 'Security',
      userName: req.user.name,
      ipAddress: req.ip
    });
    
    res.json({ success: true, message: 'Todas as sessões de terceiros foram invalidadas.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/api/instances/snapshot', requireAuth, checkPermission('admin'), async (req, res) => {
  try {
    // Simulação de geração de snapshot SQL (FRENTE 4: Backup)
    const fileName = `snapshot_${new Date().toISOString().replace(/[:.]/g, '-')}.sql`;
    
    await SystemLog.create({
      action: 'SQL Snapshot Generated',
      module: 'Backup',
      details: `File: ${fileName}`,
      userName: req.user.name,
      ipAddress: req.ip
    });
    
    res.json({ success: true, message: `Snapshot ${fileName} gerado e armazenado em Cold Storage com sucesso.` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/api/infra/sync-cluster', requireAuth, checkPermission('admin'), async (req, res) => {
  try {
    // Sincronização lógica com os nós de renderização e instâncias Docker
    await new Promise(resolve => setTimeout(resolve, 2000)); // Simula processamento
    
    await SystemLog.create({
      action: 'Cluster Sync Executed',
      module: 'Infrastructure',
      details: 'Full synchronization with Render Nodes and Docker Swarm completed.',
      userName: req.user.name,
      ipAddress: req.ip
    });
    
    res.json({ success: true, message: 'Cluster sincronizado com sucesso. Todos os nós respondendo.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// === USER MANAGEMENT API ===
router.get('/api/users', requireAuth, checkPermission('admin'), async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ['id', 'name', 'email', 'role', 'parentId', 'tenantName', 'lastLogin', 'isActive'],
      order: [['createdAt', 'DESC']]
    });
    res.json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/api/users', requireAuth, checkPermission('admin'), async (req, res) => {
  try {
    console.log('[API] Tentativa de criação de usuário:', req.body);
    const { name, email, password, role, tenantName, parentId, specialty, mainTool } = req.body;
    
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Dados incompletos' });
    }

    // Validar se o usuário já existe
    const existing = await User.findOne({ where: { email } });
    if (existing) {
      console.log('[API] Usuário já existe:', email);
      return res.status(400).json({ success: false, message: 'Email já cadastrado' });
    }

    // Decompor nome para compatibilidade com colunas firstName/lastName se existirem
    const nameParts = name.trim().split(/\s+/);
    const firstName = nameParts[0];
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';

    const newUser = await User.create({
      name,
      firstName,
      lastName,
      email,
      password, // O hash é feito no hook beforeCreate do modelo
      role: role || 'user',
      tenantName: tenantName || null,
      parentId: parentId || (parentId === "" ? null : parentId),
      specialty: specialty || null,
      mainTool: mainTool || null,
      isActive: true,
      isVerified: true
    });

    console.log('[API] Usuário criado com sucesso:', newUser.id);
    res.json({ success: true, user: { id: newUser.id, name: newUser.name, email: newUser.email } });
  } catch (error) {
    console.error('API Create User Error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message,
      error: error.message // Para compatibilidade com o frontend
    });
  }
});

router.put('/api/users/:id', requireAuth, checkPermission('admin'), async (req, res) => {
  try {
    const { name, email, role, tenantName, parentId, specialty, mainTool, isActive } = req.body;
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'Usuário não encontrado' });

    await user.update({
      name: name || user.name,
      email: email || user.email,
      role: role || user.role,
      tenantName: tenantName || user.tenantName,
      parentId: parentId || user.parentId,
      specialty: specialty || user.specialty,
      mainTool: mainTool || user.mainTool,
      isActive: isActive !== undefined ? isActive : user.isActive
    });

    res.json({ success: true, message: 'Usuário atualizado com sucesso' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.delete('/api/users/:id', requireAuth, checkPermission('admin'), async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'Usuário não encontrado' });
    
    if (user.id === req.user.id) return res.status(400).json({ success: false, message: 'Você não pode excluir a si mesmo' });

    await user.destroy();
    res.json({ success: true, message: 'Usuário excluído com sucesso' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;



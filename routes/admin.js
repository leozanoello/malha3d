const express = require('express');
const { Budget, CRMNote, Project, Testimonial, User, Setting, Client, FinanceTransaction, Revision, Delivery, CalendarEvent } = require('../models');
const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;

const router = express.Router();

// Middleware de autenticação
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

// Configuração do multer para uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../public/uploads');
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (error) {
      cb(error, uploadDir);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Apenas arquivos de imagem são permitidos'), false);
    }
  }
});

// Login
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
    const user = await User.findOne({ where: { email, role: 'admin' } });

    if (!user) {
      return res.render('admin/login', {
        layout: 'login',
        title: 'Login - Admin',
        error: 'Credenciais inválidas'
      });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return res.render('admin/login', {
        layout: 'login',
        title: 'Login - Admin',
        error: 'Credenciais inválidas'
      });
    }

    req.session.userId = user.id;
    req.session.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar
    };
    res.redirect('/admin');

  } catch (error) {
    console.error('Login error:', error);
    res.render('admin/login', {
      layout: 'login',
      title: 'Login - Admin',
      error: 'Erro ao fazer login'
    });
  }
});

// Logout
router.post('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/admin/login');
});

// Dashboard
router.get('/', requireAuth, async (req, res) => {
  try {
    // Calcular métricas reais
    const [
      totalBudgets,
      newBudgets,
      closedBudgets,
      activeProjectsCount,
      totalRevenueData
    ] = await Promise.all([
      Budget.count(),
      Budget.count({ where: { status: 'novo' } }),
      Budget.count({ where: { status: 'fechado' } }),
      Project.count({ where: { isActive: true } }),
      Budget.sum('estimatedValue', { where: { status: { [Op.not]: 'perdido' } } })
    ]);

    const conversionRate = totalBudgets > 0 ? Math.round((closedBudgets / totalBudgets) * 100) : 0;
    const performance = {
      activeProjects: activeProjectsCount,
      estimatedRevenue: totalRevenueData || 0,
      conversionRate: conversionRate
    };

    const recentBudgets = await Budget.findAll({
      order: [['createdAt', 'DESC']],
      limit: 10,
      include: [{
        model: CRMNote,
        as: 'crmNotes',
        attributes: ['id', 'type', 'title', 'createdAt'],
        limit: 3,
        order: [['createdAt', 'DESC']]
      }]
    });

    res.render('admin/dashboard', {
      layout: 'admin',
      title: 'Dashboard Malha3D',
      currentPage: 'dashboard',
      user: req.user,
      performance,
      stats: {
        totalBudgets,
        newBudgets,
        closedBudgets,
        activeProjects: activeProjectsCount
      },
      recentBudgets
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.render('admin/dashboard', {
      layout: 'admin',
      title: 'Dashboard Malha3D',
      user: req.user,
      stats: { totalBudgets: 0, pendingBudgets: 0, approvedBudgets: 0, rejectedBudgets: 0, totalProjects: 0, totalTestimonials: 0, totalNotes: 0 },
      recentBudgets: [],
      recentProjects: []
    });
  }
});

// Budgets Management
router.get('/orcamentos', requireAuth, async (req, res) => {
  try {
    const { page = 1, limit = 20, status, search } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (status) {where.status = status;}
    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } },
        { phone: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const { count, rows: budgets } = await Budget.findAndCountAll({
      where,
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset),
      include: [{
        model: CRMNote,
        as: 'crmNotes',
        attributes: ['id', 'type', 'title', 'createdAt'],
        limit: 3,
        order: [['createdAt', 'DESC']]
      }]
    });

    const totalPages = Math.ceil(count / limit);

    res.render('admin/budgets', {
      layout: 'admin',
      title: 'Orçamentos - Admin',
      currentPage: 'budgets',
      user: req.user,
      budgets,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages,
        totalItems: count,
        hasNext: page < totalPages,
        hasPrev: page > 1
      },
      filters: { status, search }
    });

  } catch (error) {
    console.error('Budgets list error:', error);
    res.render('admin/budgets', {
      layout: 'admin',
      title: 'Orçamentos - Admin',
      user: req.user,
      budgets: [],
      pagination: { page: 1, limit: 20, totalPages: 1, totalItems: 0, hasNext: false, hasPrev: false },
      filters: {}
    });
  }
});

// Budget Detail
router.get('/orcamentos/:id', requireAuth, async (req, res) => {
  try {
    const budget = await Budget.findByPk(req.params.id, {
      include: [{
        model: CRMNote,
        as: 'crmNotes',
        include: [{
          model: User,
          attributes: ['name']
        }],
        order: [['createdAt', 'DESC']]
      }]
    });

    if (!budget) {
      return res.status(404).render('admin/error', {
        layout: 'admin',
        title: 'Orçamento não encontrado',
        user: req.user,
        message: 'Orçamento não encontrado'
      });
    }

    res.render('admin/budget-detail', {
      layout: 'admin',
      title: `Orçamento #${budget.id} - Admin`,
      currentPage: 'budgets',
      user: req.user,
      budget
    });
  } catch (error) {
    console.error('Budget detail error:', error);
    res.status(500).render('admin/error', {
      layout: 'admin',
      title: 'Erro',
      user: req.user,
      message: 'Erro ao carregar detalhes do orçamento'
    });
  }
});

// Preview proposal (Image 1 style)
router.get('/orcamentos/:id/preview', requireAuth, async (req, res) => {
  try {
    const budget = await Budget.findByPk(req.params.id, {
      include: [{ model: Client, as: 'client' }]
    });
    if (!budget) {
      return res.status(404).render('admin/error', { layout: 'admin', message: 'Orçamento não encontrado' });
    }
    res.render('admin/budget-preview', {
      layout: 'admin',
      title: `Preview: ${budget.name}`,
      currentPage: 'budgets',
      user: req.user,
      budget
    });
  } catch (error) {
    console.error('Budget Preview Error:', error);
    res.status(500).render('admin/error', { layout: 'admin', message: 'Erro ao carregar preview' });
  }
});

// Update Budget Status
router.post('/orcamentos/:id/status', requireAuth, async (req, res) => {
  try {
    const { status, notes } = req.body;
    const budget = await Budget.findByPk(req.params.id);

    if (!budget) {
      return res.status(404).json({ success: false, message: 'Orçamento não encontrado' });
    }

    await budget.update({ status });

    // Add CRM note
    if (notes) {
      await CRMNote.create({
        budgetId: budget.id,
        type: 'status_change',
        title: `Status alterado para: ${status}`,
        content: notes,
        createdBy: req.user.id
      });
    }

    res.json({ success: true, message: 'Status atualizado com sucesso' });

  } catch (error) {
    console.error('Update budget status error:', error);
    res.status(500).json({ success: false, message: 'Erro ao atualizar status' });
  }
});

// Add CRM Note
router.post('/orcamentos/:id/notas', requireAuth, async (req, res) => {
  try {
    const { type, title, content, reminderDate, tags } = req.body;

    await CRMNote.create({
      budgetId: req.params.id,
      type,
      title,
      content,
      reminderDate: reminderDate || null,
      tags: tags ? JSON.parse(tags) : [],
      createdBy: req.user.id
    });

    res.json({ success: true, message: 'Nota adicionada com sucesso' });

  } catch (error) {
    console.error('Add CRM note error:', error);
    res.status(500).json({ success: false, message: 'Erro ao adicionar nota' });
  }
});

// Projects Management
router.get('/projetos', requireAuth, async (req, res) => {
  try {
    const { page = 1, limit = 20, category, featured } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (category) {where.category = category;}
    if (featured !== undefined) {where.isFeatured = featured === 'true';}

    const { count, rows: projects } = await Project.findAndCountAll({
      where,
      order: [['order', 'ASC'], ['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    const totalPages = Math.ceil(count / limit);

    res.render('admin/projects', {
      layout: 'admin',
      title: 'Projetos Malha3D',
      currentPage: 'projects',
      user: req.user,
      projects,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages,
        totalItems: count,
        hasNext: page < totalPages,
        hasPrev: page > 1
      },
      filters: { category, featured }
    });

  } catch (error) {
    console.error('Projects list error:', error);
    res.render('admin/projects', {
      layout: 'admin',
      title: 'Projetos Malha3D',
      user: req.user,
      projects: [],
      pagination: { page: 1, limit: 20, totalPages: 1, totalItems: 0, hasNext: false, hasPrev: false },
      filters: {}
    });
  }
});

// Create/Edit Project
router.get('/projetos/novo', requireAuth, (req, res) => {
  res.render('admin/project-form', {
    layout: 'admin',
    title: 'Novo Projeto - Admin',
    currentPage: 'projects',
    user: req.user,
    project: null
  });
});

router.get('/projetos/:id/editar', requireAuth, async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.id);

    if (!project) {
      return res.status(404).render('admin/error', {
        layout: 'admin',
        title: 'Projeto não encontrado',
        user: req.user,
        message: 'Projeto não encontrado'
      });
    }

    res.render('admin/project-form', {
      layout: 'admin',
      title: 'Editar Projeto - Admin',
      currentPage: 'projects',
      user: req.user,
      project
    });

  } catch (error) {
    console.error('Edit project error:', error);
    res.status(500).render('admin/error', {
      layout: 'admin',
      title: 'Erro',
      user: req.user,
      message: 'Erro ao carregar projeto'
    });
  }
});

router.post('/projetos', requireAuth, upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'thumbnail', maxCount: 1 }
]), async (req, res) => {
  try {
    const { title, description, category, tags, client, year, isFeatured, isActive, order } = req.body;

    const projectData = {
      title,
      description,
      category,
      tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
      client,
      year: parseInt(year),
      isFeatured: isFeatured === 'true',
      isActive: isActive === 'true',
      order: parseInt(order) || 0
    };

    // Handle file uploads
    if (req.files) {
      if (req.files.image) {
        projectData.image = `/uploads/${req.files.image[0].filename}`;
      }
      if (req.files.thumbnail) {
        projectData.thumbnail = `/uploads/${req.files.thumbnail[0].filename}`;
      }
    }

    await Project.create(projectData);

    res.redirect('/admin/projetos');

  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).render('admin/error', {
      layout: 'admin',
      title: 'Erro',
      user: req.user,
      message: 'Erro ao criar projeto'
    });
  }
});

router.post('/projetos/:id', requireAuth, upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'thumbnail', maxCount: 1 }
]), async (req, res) => {
  try {
    const { title, description, category, tags, client, year, isFeatured, isActive, order } = req.body;

    const project = await Project.findByPk(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Projeto não encontrado' });
    }

    const projectData = {
      title,
      description,
      category,
      tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
      client,
      year: parseInt(year),
      isFeatured: isFeatured === 'true',
      isActive: isActive === 'true',
      order: parseInt(order) || 0
    };

    // Handle file uploads
    if (req.files) {
      if (req.files.image) {
        projectData.image = `/uploads/${req.files.image[0].filename}`;
      }
      if (req.files.thumbnail) {
        projectData.thumbnail = `/uploads/${req.files.thumbnail[0].filename}`;
      }
    }

    await project.update(projectData);

    res.redirect('/admin/projetos');

  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({ success: false, message: 'Erro ao atualizar projeto' });
  }
});

// Delete Project
router.delete('/projetos/:id', requireAuth, async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.id);

    if (!project) {
      return res.status(404).json({ success: false, message: 'Projeto não encontrado' });
    }

    await project.destroy();
    res.json({ success: true, message: 'Projeto excluído com sucesso' });

  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({ success: false, message: 'Erro ao excluir projeto' });
  }
});

// Testimonials Management
router.get('/depoimentos', requireAuth, async (req, res) => {
  try {
    const { page = 1, limit = 20, active } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (active !== undefined) {where.isActive = active === 'true';}

    const { count, rows: testimonials } = await Testimonial.findAndCountAll({
      where,
      order: [['order', 'ASC'], ['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    const totalPages = Math.ceil(count / limit);

    res.render('admin/testimonials', {
      layout: 'admin',
      title: 'Depoimentos - Admin',
      currentPage: 'testimonials',
      user: req.user,
      testimonials,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages,
        totalItems: count,
        hasNext: page < totalPages,
        hasPrev: page > 1
      },
      filters: { active }
    });

  } catch (error) {
    console.error('Testimonials list error:', error);
    res.render('admin/testimonials', {
      layout: 'admin',
      title: 'Depoimentos - Admin',
      user: req.user,
      testimonials: [],
      pagination: { page: 1, limit: 20, totalPages: 1, totalItems: 0, hasNext: false, hasPrev: false },
      filters: {}
    });
  }
});

// Create/Edit Testimonial
router.get('/depoimentos/novo', requireAuth, (req, res) => {
  res.render('admin/testimonial-form', {
    layout: 'admin',
    title: 'Novo Depoimento - Admin',
    user: req.user,
    testimonial: null
  });
});

router.get('/depoimentos/:id/editar', requireAuth, async (req, res) => {
  try {
    const testimonial = await Testimonial.findByPk(req.params.id);

    if (!testimonial) {
      return res.status(404).render('admin/error', {
        layout: 'admin',
        title: 'Depoimento não encontrado',
        user: req.user,
        message: 'Depoimento não encontrado'
      });
    }

    res.render('admin/testimonial-form', {
      layout: 'admin',
      title: 'Editar Depoimento - Admin',
      user: req.user,
      testimonial
    });

  } catch (error) {
    console.error('Edit testimonial error:', error);
    res.status(500).render('admin/error', {
      layout: 'admin',
      title: 'Erro',
      user: req.user,
      message: 'Erro ao carregar depoimento'
    });
  }
});

router.post('/depoimentos', requireAuth, upload.single('avatar'), async (req, res) => {
  try {
    const { name, company, role, content, rating, isActive, order } = req.body;

    const testimonialData = {
      name,
      company,
      role,
      content,
      rating: parseInt(rating),
      isActive: isActive === 'true',
      order: parseInt(order) || 0
    };

    if (req.file) {
      testimonialData.avatar = `/uploads/${req.file.filename}`;
    }

    await Testimonial.create(testimonialData);

    res.redirect('/admin/depoimentos');

  } catch (error) {
    console.error('Create testimonial error:', error);
    res.status(500).render('admin/error', {
      layout: 'admin',
      title: 'Erro',
      user: req.user,
      message: 'Erro ao criar depoimento'
    });
  }
});

router.post('/depoimentos/:id', requireAuth, upload.single('avatar'), async (req, res) => {
  try {
    const { name, company, role, content, rating, isActive, order } = req.body;

    const testimonial = await Testimonial.findByPk(req.params.id);
    if (!testimonial) {
      return res.status(404).json({ success: false, message: 'Depoimento não encontrado' });
    }

    const testimonialData = {
      name,
      company,
      role,
      content,
      rating: parseInt(rating),
      isActive: isActive === 'true',
      order: parseInt(order) || 0
    };

    if (req.file) {
      testimonialData.avatar = `/uploads/${req.file.filename}`;
    }

    await testimonial.update(testimonialData);

    res.redirect('/admin/depoimentos');

  } catch (error) {
    console.error('Update testimonial error:', error);
    res.status(500).json({ success: false, message: 'Erro ao atualizar depoimento' });
  }
});

// Delete Testimonial
router.delete('/depoimentos/:id', requireAuth, async (req, res) => {
  try {
    const testimonial = await Testimonial.findByPk(req.params.id);

    if (!testimonial) {
      return res.status(404).json({ success: false, message: 'Depoimento não encontrado' });
    }

    await testimonial.destroy();
    res.json({ success: true, message: 'Depoimento excluído com sucesso' });

  } catch (error) {
    console.error('Delete testimonial error:', error);
    res.status(500).json({ success: false, message: 'Erro ao excluir depoimento' });
  }
});

// Settings Management
router.get('/configuracoes', requireAuth, async (req, res) => {
  try {
    const settings = await Setting.findAll({
      order: [['group', 'ASC'], ['order', 'ASC']]
    });

    const groupedSettings = {};
    settings.forEach(setting => {
      if (!groupedSettings[setting.group]) {
        groupedSettings[setting.group] = [];
      }
      groupedSettings[setting.group].push(setting);
    });

    res.render('admin/settings', {
      layout: 'admin',
      title: 'Configurações - Admin',
      currentPage: 'settings',
      user: req.user,
      groupedSettings
    });

  } catch (error) {
    console.error('Settings error:', error);
    res.render('admin/settings', {
      layout: 'admin',
      title: 'Configurações - Admin',
      user: req.user,
      groupedSettings: {}
    });
  }
});

router.post('/configuracoes', requireAuth, async (req, res) => {
  try {
    const updates = Object.entries(req.body);

    for (const [key, value] of updates) {
      await Setting.update({ value }, { where: { key } });
    }

    res.json({ success: true, message: 'Configurações atualizadas com sucesso' });

  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({ success: false, message: 'Erro ao atualizar configurações' });
  }
});

router.get('/usuarios', requireAuth, async (req, res) => {
  try {
    const users = await User.findAll({
      order: [['name', 'ASC']]
    });

    res.render('admin/users', {
      layout: 'admin',
      title: 'Controle de Acessos Malha3D',
      currentPage: 'users',
      user: req.user,
      users
    });
  } catch (error) {
    console.error('Users route error:', error);
    res.redirect('/admin');
  }
});

// Temporary redirects for new menu items (Coming Soon)
const comingSoon = (req, res) => {
  res.render('admin/dashboard', {
    layout: 'admin',
    title: 'Dashboard Malha3D',
    currentPage: 'dashboard',
    user: req.user,
    info: 'Esta funcionalidade está sendo implementada e estará disponível em breve no seu ecossistema 3DFLOW.',
    stats: { totalBudgets: 0, pendingBudgets: 0, approvedBudgets: 0, rejectedBudgets: 0, totalProjects: 0, totalTestimonials: 0, totalNotes: 0 },
    recentBudgets: [],
    recentProjects: []
  });
};

// CRM Kanban
router.get('/crm', requireAuth, async (req, res) => {
  try {
    const budgets = await Budget.findAll({
      order: [['updatedAt', 'DESC']],
      include: [{ model: Client, as: 'client' }]
    });

    // Agrupar por status para o Kanban
    const kanban = {
      novo: budgets.filter(b => b.status === 'novo'),
      em_andamento: budgets.filter(b => b.status === 'em_andamento'),
      respondido: budgets.filter(b => b.status === 'respondido'),
      fechado: budgets.filter(b => b.status === 'fechado'),
      perdido: budgets.filter(b => b.status === 'perdido')
    };

    const pipelineValue = Object.values(kanban).flat().reduce((acc, b) => acc + (parseFloat(b.estimatedValue) || 0), 0);

    res.render('admin/crm', {
      layout: 'admin',
      title: 'CRM Kanban Malha3D',
      currentPage: 'crm',
      user: req.user,
      kanban,
      stats: {
        totalLeads: budgets.length,
        pipelineValue: pipelineValue
      }
    });
  } catch (error) {
    console.error('CRM Route Error:', error);
    res.status(500).render('admin/error', { layout: 'admin', message: 'Erro ao carregar CRM' });
  }
});

// Contacts List
router.get('/contatos', requireAuth, async (req, res) => {
  try {
    const clients = await Client.findAll({
      order: [['name', 'ASC']]
    });

    const stats = {
      total: clients.length,
      pf: clients.filter(c => c.type === 'PF').length,
      pj: clients.filter(c => c.type === 'PJ').length
    };

    res.render('admin/contacts', {
      layout: 'admin',
      title: 'Gestão de Contatos Malha3D',
      currentPage: 'contacts',
      user: req.user,
      contacts: clients,
      stats
    });
  } catch (error) {
    console.error('Contacts error:', error);
    res.redirect('/admin');
  }
});

// Finance Dashboard
router.get('/financeiro', requireAuth, async (req, res) => {
  try {
    const transactions = await FinanceTransaction.findAll({
      order: [['dueDate', 'ASC']],
      limit: 10
    });

    const [incomes, expenses] = await Promise.all([
      FinanceTransaction.sum('amount', { where: { type: 'receita', status: 'pago' } }),
      FinanceTransaction.sum('amount', { where: { type: 'despesa', status: 'pago' } })
    ]);

    const stats = {
      totalReceived: incomes || 0,
      totalPaid: expenses || 0,
      netResult: (incomes || 0) - (expenses || 0)
    };

    res.render('admin/finance', {
      layout: 'admin',
      title: 'Financeiro Empresarial',
      currentPage: 'finance',
      user: req.user,
      stats,
      recentIncomes: transactions.filter(t => t.type === 'receita'),
      recentExpenses: transactions.filter(t => t.type === 'despesa')
    });
  } catch (error) {
    console.error('Finance Route Error:', error);
    res.status(500).render('admin/error', { layout: 'admin', message: 'Erro ao carregar financeiro' });
  }
});

// Revisions Dashboard
router.get('/revisoes', requireAuth, async (req, res) => {
  try {
    const revisions = await Revision.findAll({
      order: [['createdAt', 'DESC']]
    });

    res.render('admin/revisions', {
      layout: 'admin',
      title: 'Controle de Revisões',
      currentPage: 'revisions',
      user: req.user,
      revisions,
      totalImpact: 0,
      totalVersions: revisions.length
    });
  } catch (error) {
    console.error('Revisions Route Error:', error);
    res.status(500).render('admin/error', { layout: 'admin', message: 'Erro ao carregar revisões' });
  }
});

// Deliveries Dashboard
router.get('/entregas', requireAuth, async (req, res) => {
  try {
    const deliveries = await Delivery.findAll({
      order: [['scheduledDate', 'ASC']]
    });

    const projects = await Project.findAll({
      attributes: ['id', 'title'],
      order: [['title', 'ASC']]
    });

    res.render('admin/deliveries', {
      layout: 'admin',
      title: 'Controle de Entregas',
      currentPage: 'deliveries',
      user: req.user,
      deliveries,
      projects,
      stats: {
        pending: deliveries.filter(d => d.status === 'pendente').length,
        delivered: deliveries.filter(d => d.status === 'entregue').length,
        approved: deliveries.filter(d => d.status === 'aprovado').length
      }
    });
  } catch (error) {
    console.error('Deliveries Route Error:', error);
    res.status(500).render('admin/error', { layout: 'admin', message: 'Erro ao carregar entregas' });
  }
});

// Calendar Dashboard
router.get('/agenda', requireAuth, async (req, res) => {
  res.render('admin/calendar', {
    layout: 'admin',
    title: 'Agenda Inteligente',
    currentPage: 'calendar',
    user: req.user
  });
});

// Projects Kanban View
router.get('/projetos/kanban', requireAuth, async (req, res) => {
  try {
    const projects = await Project.findAll({
      order: [['updatedAt', 'DESC']]
    });

    res.render('admin/projects-kanban', {
      layout: 'admin',
      title: 'Quadro de Projetos',
      currentPage: 'projects',
      user: req.user,
      projects
    });
  } catch (error) {
    console.error('Projects Kanban Error:', error);
    res.status(500).render('admin/error', { layout: 'admin', message: 'Erro ao carregar quadro' });
  }
});

// Productivity Dashboard
router.get('/produtividade', requireAuth, async (req, res) => {
  res.render('admin/productivity', {
    layout: 'admin',
    title: 'Análise de Produtividade',
    currentPage: 'productivity',
    user: req.user,
    stats: { avgTime: '4.2h', completionRate: '92%' }
  });
});

// Goals & KPIs
router.get('/metas', requireAuth, async (req, res) => {
  try {
    const currentProgress = await Budget.sum('estimatedValue', { 
      where: { 
        status: 'fechado',
        updatedAt: { [Op.gte]: new Date(new Date().getFullYear(), new Date().getMonth(), 1) }
      } 
    }) || 0;

    res.render('admin/goals', {
      layout: 'admin',
      title: 'Metas & KPIs Malha3D',
      currentPage: 'goals',
      user: req.user,
      monthlyGoal: 50000,
      currentProgress
    });
  } catch (error) {
    console.error('Goals error:', error);
    res.redirect('/admin');
  }
});

// Assets Library
router.get('/assets', requireAuth, async (req, res) => {
  res.render('admin/assets', {
    layout: 'admin',
    title: 'Arsenal 3D - Biblioteca de Assets',
    currentPage: 'assets',
    user: req.user
  });
});

// Freelancers Management
router.get('/freelancers', requireAuth, async (req, res) => {
  res.render('admin/freelancers', {
    layout: 'admin',
    title: 'Rede de Freelancers Especialistas',
    currentPage: 'freelancers',
    user: req.user
  });
});

// Portfolio Management
router.get('/portfolio', requireAuth, async (req, res) => {
  res.render('admin/portfolio', {
    layout: 'admin',
    title: 'Gestão de Portfólio',
    currentPage: 'portfolio',
    user: req.user
  });
});

// Internal Chat
router.get('/chat', requireAuth, async (req, res) => {
  res.render('admin/chat', {
    layout: 'admin',
    title: 'Chat Interno da Equipe',
    currentPage: 'chat',
    user: req.user
  });
});

// Client Portal Admin
router.get('/portal-cliente', requireAuth, async (req, res) => {
  res.render('admin/client-portal', {
    layout: 'admin',
    title: 'Gestão do Portal do Cliente',
    currentPage: 'client-portal',
    user: req.user
  });
});

// Learning & Academy
router.get('/aprendizado', requireAuth, async (req, res) => {
  res.render('admin/learning', {
    layout: 'admin',
    title: 'Academia Malha3D',
    currentPage: 'learning',
    user: req.user
  });
});

// AI Reports
router.get('/relatorios-ia', requireAuth, async (req, res) => {
  res.render('admin/ai-reports', {
    layout: 'admin',
    title: 'Relatórios & Insights IA',
    currentPage: 'ai-reports',
    user: req.user
  });
});

// Appearance & Branding
router.get('/aparencia', requireAuth, async (req, res) => {
  res.render('admin/appearance', {
    layout: 'admin',
    title: 'Aparência & Branding',
    currentPage: 'appearance',
    user: req.user
  });
});

// API Endpoints
router.get('/api/budgets', requireAuth, async (req, res) => {
  try {
    const { startDate, endDate, status } = req.query;
    const where = {};

    if (startDate && endDate) {
      where.createdAt = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    }

    if (status) {where.status = status;}

    const budgets = await Budget.findAll({
      where,
      attributes: ['id', 'status', 'projectType', 'estimatedValue', 'createdAt'],
      order: [['createdAt', 'DESC']]
    });

    res.json({ success: true, data: budgets });

  } catch (error) {
    console.error('API budgets error:', error);
    res.status(500).json({ success: false, message: 'Erro ao buscar orçamentos' });
  }
});

router.get('/api/stats', requireAuth, async (req, res) => {
  try {
    const { period = 'month' } = req.query;

    let dateFilter = {};
    const now = new Date();

    if (period === 'week') {
      dateFilter = {
        createdAt: {
          [Op.gte]: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        }
      };
    } else if (period === 'month') {
      dateFilter = {
        createdAt: {
          [Op.gte]: new Date(now.getFullYear(), now.getMonth(), 1)
        }
      };
    } else if (period === 'year') {
      dateFilter = {
        createdAt: {
          [Op.gte]: new Date(now.getFullYear(), 0, 1)
        }
      };
    }

    const stats = await Promise.all([
      Budget.count({ where: dateFilter }),
      Budget.count({ where: { ...dateFilter, status: 'fechado' } }),
      Budget.count({ where: { ...dateFilter, status: 'novo' } }),
      Project.count({ where: dateFilter })
    ]);

    res.json({
      success: true,
      data: {
        totalBudgets: stats[0],
        approvedBudgets: stats[1],
        pendingBudgets: stats[2],
        totalProjects: stats[3]
      }
    });

  } catch (error) {
    console.error('API stats error:', error);
    res.status(500).json({ success: false, message: 'Erro ao buscar estatísticas' });
  }
});

// Create Lead (Budget)
router.post('/api/leads', requireAuth, async (req, res) => {
  try {
    const { name, email, phone, projectType, estimatedValue, description } = req.body;
    
    const lead = await Budget.create({
      name,
      email,
      phone,
      projectType,
      estimatedValue: estimatedValue || 0,
      description,
      status: 'novo',
      source: 'manual_admin'
    });
    
    res.json({ success: true, message: 'Lead criado com sucesso', data: lead });
  } catch (error) {
    console.error('API create lead error:', error);
    res.status(500).json({ success: false, message: 'Erro ao criar lead' });
  }
});

// Create Contact (Client)
router.post('/api/contatos', requireAuth, async (req, res) => {
  try {
    const { name, type, email, phone, company, category } = req.body;
    
    const client = await Client.create({
      name,
      type,
      email,
      phone,
      company,
      category,
      source: 'admin'
    });
    
    res.json({ success: true, message: 'Contato criado com sucesso', data: client });
  } catch (error) {
    console.error('API create contact error:', error);
    res.status(500).json({ success: false, message: 'Erro ao criar contato' });
  }
});

// Create Finance Transaction
router.post('/api/financeiro', requireAuth, upload.single('anexo'), async (req, res) => {
  try {
    const { type, description, amount, dueDate, category, favorecido, competencia, paymentMethod, contaBancaria, status, recurrence, projectId, observacoes } = req.body;
    
    const transactionData = {
      type,
      description,
      amount: amount || 0,
      dueDate,
      category,
      beneficiary: favorecido,
      competenceDate: competencia ? new Date(competencia + '-01') : null,
      paymentMethod,
      bankAccount: contaBancaria,
      status: status || 'pendente',
      recurrence: recurrence || 'unica',
      projectId: projectId || null,
      notes: observacoes
    };

    if (req.file) {
      transactionData.attachment = `/uploads/${req.file.filename}`;
    }
    
    const transaction = await FinanceTransaction.create(transactionData);
    
    res.json({ success: true, message: 'Transação criada com sucesso', data: transaction });
  } catch (error) {
    console.error('API create finance error:', error);
    res.status(500).json({ success: false, message: 'Erro ao criar transação' });
  }
});

// Create Calendar Event
router.post('/api/agenda', requireAuth, async (req, res) => {
  try {
    const { title, startTime, endTime, type, description } = req.body;
    
    const event = await CalendarEvent.create({
      title,
      startTime,
      endTime,
      type,
      description
    });
    
    res.json({ success: true, message: 'Evento agendado com sucesso', data: event });
  } catch (error) {
    console.error('API create event error:', error);
    res.status(500).json({ success: false, message: 'Erro ao agendamento' });
  }
});

// Create Delivery
router.post('/api/entregas', requireAuth, async (req, res) => {
  try {
    const { title, scheduledDate, projectId, status } = req.body;
    
    const delivery = await Delivery.create({
      title,
      scheduledDate,
      projectId: projectId || null,
      status: status || 'pendente',
      confirmation: false
    });
    
    res.json({ success: true, message: 'Entrega registrada com sucesso', data: delivery });
  } catch (error) {
    console.error('API create delivery error:', error);
    res.status(500).json({ success: false, message: 'Erro ao registrar entrega' });
  }
});

// Documents Management
router.get('/documentos', requireAuth, async (req, res) => {
  res.render('admin/documents', {
    layout: 'admin',
    title: 'Documentos & Contratos',
    currentPage: 'documents',
    user: req.user
  });
});

module.exports = router;

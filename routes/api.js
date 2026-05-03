const express = require('express');
const router = express.Router();
const { Project, Testimonial, Setting, Budget, CRMNote, sequelize } = require('../models');
const { v4: uuidv4 } = require('uuid');

// Rota para buscar projetos
router.get('/projects', async (req, res, next) => {
  try {
    const projects = await Project.findAll({
      where: { isActive: true },
      order: [['order', 'ASC'], ['createdAt', 'DESC']]
    });
    res.json(projects);
  } catch (error) {
    next(error);
  }
});

// Rota para buscar depoimentos
router.get('/testimonials', async (req, res, next) => {
  try {
    const testimonials = await Testimonial.findAll({
      where: { isActive: true },
      order: [['order', 'ASC'], ['createdAt', 'DESC']]
    });
    res.json(testimonials);
  } catch (error) {
    next(error);
  }
});

// Rota para buscar configurações
router.get('/settings', async (req, res, next) => {
  try {
    const settings = await Setting.findAll({
      order: [['group', 'ASC'], ['order', 'ASC']]
    });

    const settingsObj = {};
    settings.forEach(setting => {
      if (!settingsObj[setting.group]) {
        settingsObj[setting.group] = {};
      }
      settingsObj[setting.group][setting.key] = setting.value;
    });

    res.json(settingsObj);
  } catch (error) {
    next(error);
  }
});

// Rota para buscar configurações específicas de cálculo
router.get('/calculator-settings', async (req, res, next) => {
  try {
    const calculatorSettings = await Setting.findAll({
      where: {
        group: 'calculator'
      },
      order: [['order', 'ASC']]
    });

    const settingsObj = {};
    calculatorSettings.forEach(setting => {
      settingsObj[setting.key] = setting.value;
    });

    res.json(settingsObj);
  } catch (error) {
    next(error);
  }
});

// Rota para buscar orçamentos
router.get('/budgets', async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const status = req.query.status;

    const whereClause = {};
    if (status) {
      whereClause.status = status;
    }

    const { count, rows: budgets } = await Budget.findAndCountAll({
      where: whereClause,
      order: [['createdAt', 'DESC']],
      limit: limit,
      offset: offset
    });

    res.json({
      budgets,
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    next(error);
  }
});

// Rota para buscar estatísticas de orçamentos
router.get('/budgets/stats', async (req, res, next) => {
  try {
    const total = await Budget.count();
    const byStatus = await Budget.findAll({
      attributes: ['status', [sequelize.fn('count', sequelize.col('status')), 'count']],
      group: ['status']
    });

    res.json({
      stats: {
        total,
        byStatus,
        monthly: [] // Simplificado
      }
    });
  } catch (error) {
    next(error);
  }
});

// Rota para buscar orçamento específico
router.get('/budgets/:id', async (req, res, next) => {
  try {
    const budget = await Budget.findByPk(req.params.id, {
      include: [{ model: CRMNote, as: 'crmNotes' }]
    });
    if (!budget) {
      return res.status(404).json({ error: 'Orçamento não encontrado' });
    }
    res.json({ budget });
  } catch (error) {
    next(error);
  }
});

// Rota para criar orçamento
router.post('/budgets', async (req, res, next) => {
  try {
    const data = {
      name: req.body.name || req.body.clientName,
      email: req.body.email || req.body.clientEmail,
      phone: req.body.phone || req.body.clientPhone,
      projectType: req.body.projectType || 'Outro',
      description: req.body.description || '',
      trackingCode: `TZ-${uuidv4().substring(0, 8).toUpperCase()}`,
      status: 'novo'
    };

    const budget = await Budget.create(data);
    res.status(201).json({ budget });
  } catch (error) {
    next(error);
  }
});

// Rota para atualizar orçamento
router.put('/budgets/:id', async (req, res, next) => {
  try {
    const budget = await Budget.findByPk(req.params.id);
    if (!budget) {
      return res.status(404).json({ error: 'Orçamento não encontrado' });
    }
    await budget.update(req.body);
    res.json({ budget });
  } catch (error) {
    next(error);
  }
});

// Rota para excluir orçamento
router.delete('/budgets/:id', async (req, res, next) => {
  try {
    const budget = await Budget.findByPk(req.params.id);
    if (!budget) {
      return res.status(404).json({ error: 'Orçamento não encontrado' });
    }
    await budget.destroy();
    res.json({ message: 'Orçamento excluído com sucesso' });
  } catch (error) {
    next(error);
  }
});

// Rota para adicionar nota
router.post('/budgets/:id/notes', async (req, res, next) => {
  try {
    const budget = await Budget.findByPk(req.params.id);
    if (!budget) {
      return res.status(404).json({ error: 'Orçamento não encontrado' });
    }
    
    const note = await CRMNote.create({
      budgetId: budget.id,
      title: req.body.title || 'Observação',
      content: req.body.note || req.body.content,
      type: 'note'
    });
    res.status(201).json({ note });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

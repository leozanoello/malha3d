const express = require('express');
const router = express.Router();
const { Project, Testimonial, Setting, Budget, CRMNote, Client, BudgetContact, CRMTask, sequelize } = require('../models');
const { Op } = require('sequelize');
const { v4: uuidv4 } = require('uuid');
const { getAutomatedFieldsForStatus } = require('../services/crmAutomation');

// Rota para pesquisa global
router.get('/global-search', async (req, res, next) => {
  try {
    const query = req.query.q;
    if (!query) return res.json({ deals: [], projects: [], contacts: [] });

    const [budgets, projects, clients] = await Promise.all([
      Budget.findAll({
        where: { name: { [Op.iLike]: `%${query}%` } },
        limit: 5,
        attributes: ['id', 'name']
      }),
      Project.findAll({
        where: { title: { [Op.iLike]: `%${query}%` } },
        limit: 5,
        attributes: ['id', 'title']
      }),
      Client.findAll({
        where: { name: { [Op.iLike]: `%${query}%` } },
        limit: 5,
        attributes: ['id', 'name']
      })
    ]);

    res.json({
      budgets,
      projects: projects.map(p => ({ id: p.id, name: p.title })),
      clients
    });
  } catch (error) {
    next(error);
  }
});

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
      ...req.body,
      trackingCode: `TZ-${uuidv4().substring(0, 8).toUpperCase()}`,
      status: req.body.status || 'leads'
    };

    if (!data.name && data.clientName) data.name = data.clientName;
    if (!data.email && data.clientEmail) data.email = data.clientEmail;
    if (!data.phone && data.clientPhone) data.phone = data.clientPhone;
    
    // Default values to prevent not-null constraints
    data.projectType = data.projectType || 'Outro';

    // Garantir que campos numéricos sejam números
    if (data.estimatedValue) data.estimatedValue = parseFloat(data.estimatedValue);
    if (data.probability) data.probability = parseInt(data.probability);
    if (data.imagesCount) data.imagesCount = parseInt(data.imagesCount);
    if (data.animationSeconds) data.animationSeconds = parseInt(data.animationSeconds);
    if (data.panoramasCount) data.panoramasCount = parseInt(data.panoramasCount);
    if (data.totalArea) data.totalArea = parseFloat(data.totalArea);
    if (data.installments) data.installments = parseInt(data.installments);
    if (data.productionDays) data.productionDays = parseInt(data.productionDays);
    if (data.clientBudget) data.clientBudget = parseFloat(data.clientBudget);
    
    // Garantir softwareStack como array
    if (data.softwareStack && !Array.isArray(data.softwareStack)) {
      data.softwareStack = [data.softwareStack];
    }
    
    // Limpar UUIDs vazios para evitar FK violation
    if (!data.assignedUserId || data.assignedUserId === '') delete data.assignedUserId;
    if (!data.clientId || data.clientId === '') delete data.clientId;

    // Parse installmentsData if string
    if (typeof data.installmentsData === 'string') {
        try {
            data.installmentsData = JSON.parse(data.installmentsData);
        } catch (e) {
            data.installmentsData = null;
        }
    }

    const budget = await Budget.create(data);
    res.status(201).json({ budget });
  } catch (error) {
    console.error('API Create Budget Error:', error.message);
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
    
    let updateData = { ...req.body };
    if (req.body.status && req.body.status !== budget.status) {
      const hasManualScheduling = req.body.nextActionDate || req.body.nextActionNote || req.body.priority;
      if (!hasManualScheduling) {
        const automatedFields = getAutomatedFieldsForStatus(req.body.status, budget);
        updateData = { ...automatedFields, ...updateData };
      }
    }
    // Parse installmentsData if string
    if (typeof updateData.installmentsData === 'string') {
        try {
            updateData.installmentsData = JSON.parse(updateData.installmentsData);
        } catch (e) {
            updateData.installmentsData = null;
        }
    }

    await budget.update(updateData);
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

// === CLIENTS & CONTACTS ===

// Rota para buscar clientes (Autocomplete)
router.get('/clients/search', async (req, res, next) => {
  try {
    const query = req.query.q || '';
    const clients = await Client.findAll({
      where: {
        [Op.or]: [
          { name: { [Op.iLike]: `%${query}%` } },
          { email: { [Op.iLike]: `%${query}%` } },
          { company: { [Op.iLike]: `%${query}%` } }
        ]
      },
      limit: 10
    });
    res.json(clients);
  } catch (error) {
    next(error);
  }
});

// Criar novo cliente/contato (Cadastro Rápido)
router.post('/clients', async (req, res, next) => {
  try {
    const { name, type, document, email, phone, company, city, state, paymentMethods, notes, category, status } = req.body;
    
    // Validar tipo (PF ou PJ)
    const clientType = type || 'PF';
    
    // Validar CPF/CNPJ se fornecido
    const { validateCPF, validateCNPJ } = require('../utils/validators');
    if (document) {
      const cleanDoc = document.replace(/\D/g, '');
      if (cleanDoc.length > 0) {
        if (clientType === 'PF') {
          if (!validateCPF(cleanDoc)) {
            return res.status(400).json({ error: 'CPF inválido.' });
          }
        } else {
          if (!validateCNPJ(cleanDoc)) {
            return res.status(400).json({ error: 'CNPJ inválido.' });
          }
        }
      }
    }

    const newClient = await Client.create({
      name,
      type: clientType,
      document: document || null,
      email: email || null,
      phone: phone || null,
      company: company || null,
      city: city || null,
      state: state || null,
      paymentMethods: paymentMethods || [],
      notes: notes || null,
      category: category || 'Lead',
      status: status || 'active'
    });

    res.status(201).json(newClient);
  } catch (error) {
    console.error('Error creating client in API:', error);
    res.status(500).json({ error: error.message });
  }
});

// Buscar contatos vinculados a uma negociação
router.get('/budgets/:id/contacts', async (req, res, next) => {
  try {
    const budget = await Budget.findByPk(req.params.id, {
      include: [{
        model: Client,
        as: 'contacts',
        through: { attributes: ['responsibilityLevel', 'isPrimary'] }
      }]
    });
    if (!budget) return res.status(404).json({ error: 'Negociação não encontrada' });
    res.json(budget.contacts);
  } catch (error) {
    next(error);
  }
});

// Vincular contato a uma negociação
router.post('/budgets/:id/contacts', async (req, res, next) => {
  try {
    const { clientId, responsibilityLevel, isPrimary } = req.body;
    
    // Se for primário, remover primário dos outros
    if (isPrimary) {
      await BudgetContact.update({ isPrimary: false }, { where: { budgetId: req.params.id } });
    }

    const [link, created] = await BudgetContact.findOrCreate({
      where: { budgetId: req.params.id, clientId },
      defaults: { responsibilityLevel, isPrimary }
    });

    if (!created) {
      await link.update({ responsibilityLevel, isPrimary });
    }

    res.json({ success: true, link });
  } catch (error) {
    next(error);
  }
});

// Remover vínculo de contato
router.delete('/budgets/:id/contacts/:clientId', async (req, res, next) => {
  try {
    await BudgetContact.destroy({
      where: { budgetId: req.params.id, clientId: req.params.clientId }
    });
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

// Buscar tarefas de uma negociação
router.get('/budgets/:id/tasks', async (req, res, next) => {
  try {
    const tasks = await CRMTask.findAll({
      where: { budgetId: req.params.id },
      order: [['createdAt', 'DESC']]
    });
    res.json({ success: true, tasks });
  } catch (error) {
    next(error);
  }
});

// Converter negociação em projeto
router.post('/budgets/:id/convert', async (req, res, next) => {
  const transaction = await sequelize.transaction();
  try {
    const budget = await Budget.findByPk(req.params.id);
    if (!budget) {
      return res.status(404).json({ error: 'Negociação não encontrada' });
    }

    let clientCity = null;
    let clientState = null;
    if (budget.clientId) {
      const client = await Client.findByPk(budget.clientId);
      if (client) {
        clientCity = client.city;
        clientState = client.state;
      }
    }

    // Criar projeto
    const project = await Project.create({
      title: budget.name,
      category: 'outro', // Default
      image: 'https://placehold.co/600x400/003559/ffffff?text=Projeto+Convertido',
      budgetId: budget.id,
      clientId: budget.clientId,
      city: clientCity,
      state: clientState,
      price: budget.estimatedValue,
      totalArea: budget.totalArea,
      softwareStack: budget.softwareStack,
      status: 'briefing'
    }, { transaction });

    // Atualizar status da negociação
    await budget.update({ status: 'ganho' }, { transaction });

    await transaction.commit();
    res.json({ success: true, project });
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
});

// Rota de Precificação Inteligente Avançada
router.post('/calcularOrcamentoAvancado', async (req, res, next) => {
  try {
    const {
      metragemTotal,
      tipoCliente,
      estiloPredominante,
      formatoBase,
      qtdImagens,
      segundosAnimacao,
      softwareRender,
      rodadasAlteracao,
      prazoDias
    } = req.body;

    // Validação de campos obrigatórios
    if (metragemTotal === undefined || metragemTotal === null || metragemTotal === '') {
      return res.status(400).json({ success: false, error: 'A metragem total é obrigatória para calcular o orçamento.' });
    }

    const metragem = parseFloat(metragemTotal) || 0;
    const imagens = parseInt(qtdImagens) || 0;
    const segundos = parseInt(segundosAnimacao) || 0;
    const rodadas = parseInt(rodadasAlteracao) || 1;
    const prazo = parseInt(prazoDias) || 30; // prazo padrão de 30 dias se não informado

    // A. Cálculo Base
    const valorBaseModelagem = metragem * 25.00;
    const valorBaseImagens = imagens * 350.00;
    const valorBaseAnimacao = segundos * 120.00;
    const subtotalBase = valorBaseModelagem + valorBaseImagens + valorBaseAnimacao;

    // B. Multiplicadores de Complexidade
    // Estilo: Clássico/Neoclássico +30%. Outros estilos +0%
    const estiloMultiplicador = (estiloPredominante === 'Clássico/Neoclássico' || estiloPredominante === 'Clássico') ? 0.30 : 0.00;
    const valorEstilo = subtotalBase * estiloMultiplicador;

    // Base Recebida: AutoCAD 2D ou Do Zero +40%. Sketchup Sujo +20%. BIM/Revit Limpo +0%
    const baseMultiplicador = (formatoBase === 'AutoCAD 2D' || formatoBase === 'Do Zero' || formatoBase === 'AutoCAD' || formatoBase === 'PDF/Imagens' || formatoBase === 'Precisa Modelar Zero') ? 0.40 : ((formatoBase === 'Sketchup Sujo' || formatoBase === 'SketchUp' || formatoBase === 'Desorganizado') ? 0.20 : 0.00);
    const valorBaseRecebida = subtotalBase * baseMultiplicador;

    // Software: 3ds Max/Corona +R$ 150 por imagem. D5 Render +R$ 0
    const renderFarmCusto = (softwareRender === '3ds Max/Corona' || softwareRender === '3ds Max' || softwareRender === 'Corona') ? (imagens * 150.00) : 0.00;

    const subtotalComplexidade = subtotalBase + valorEstilo + valorBaseRecebida + renderFarmCusto;

    // C. Acréscimos de Escopo e Risco
    // Refações: R$ 250 adicionais por rodada acima de 1
    const adicionalRefacoes = Math.max(0, rodadas - 1) * 250.00;
    const subtotalComRefacoes = subtotalComplexidade + adicionalRefacoes;

    // Taxa Construtora: tipoCliente === 'Construtora' +15%
    const construtoraMultiplicador = (tipoCliente === 'Construtora') ? 0.15 : 0.00;
    const valorConstrutora = subtotalComRefacoes * construtoraMultiplicador;
    const subtotalComCliente = subtotalComRefacoes + valorConstrutora;

    // Taxa de Urgência: prazoDias <= 5 +35%
    const urgenciaMultiplicador = (prazo <= 5) ? 0.35 : 0.00;
    const valorUrgencia = subtotalComCliente * urgenciaMultiplicador;

    const valorTotalSugerido = subtotalComCliente + valorUrgencia;

    res.json({
      success: true,
      valorTotalSugerido: parseFloat(valorTotalSugerido.toFixed(2)),
      breakdown: {
        modelagemBase: parseFloat(valorBaseModelagem.toFixed(2)),
        imagensBase: parseFloat(valorBaseImagens.toFixed(2)),
        animacaoBase: parseFloat(valorBaseAnimacao.toFixed(2)),
        estiloExtra: parseFloat(valorEstilo.toFixed(2)),
        workflowExtra: parseFloat(valorBaseRecebida.toFixed(2)),
        renderFarmExtra: parseFloat(renderFarmCusto.toFixed(2)),
        refacoesExtra: parseFloat(adicionalRefacoes.toFixed(2)),
        construtoraExtra: parseFloat(valorConstrutora.toFixed(2)),
        urgenciaExtra: parseFloat(valorUrgencia.toFixed(2)),
        subtotalBase: parseFloat(subtotalBase.toFixed(2)),
        subtotalComplexidade: parseFloat(subtotalComplexidade.toFixed(2)),
        subtotalComRefacoes: parseFloat(subtotalComRefacoes.toFixed(2)),
        subtotalComCliente: parseFloat(subtotalComCliente.toFixed(2))
      }
    });

  } catch (error) {
    console.error('calcularOrcamentoAvancado error:', error);
    res.status(500).json({ success: false, error: 'Erro interno ao calcular orçamento: ' + error.message });
  }
});

module.exports = router;

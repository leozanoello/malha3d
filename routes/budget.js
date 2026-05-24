const express = require('express');
const router = express.Router();
const { Budget } = require('../models');
const emailService = require('../services/emailService');

// Página de orçamento
router.get('/', (req, res) => {
  res.render('orcamento', {
    title: 'Solicitar Orçamento - Malha 3D',
    projectTypes: [
      'Renderização de Interiores',
      'Renderização de Exteriores',
      'Modelagem 3D',
      'Animação 3D',
      'Visualização de Produtos',
      'Arquitetônico',
      'Outro'
    ]
  });
});

// Processar formulário de orçamento
router.post('/solicitar', async (req, res) => {
  try {
    const { name, email, phone, projectType, description } = req.body;

    // Validação básica
    if (!name || !email || !phone || !projectType || !description) {
      return res.status(400).json({
        success: false,
        message: 'Por favor, preencha todos os campos obrigatórios.'
      });
    }

    // Criar novo orçamento
    const budget = await Budget.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      projectType,
      description: description.trim(),
      source: 'website',
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    // Enviar emails de forma assíncrona
    emailService.sendBudgetNotification(budget);
    emailService.sendConfirmationEmail(budget);

    res.json({
      success: true,
      message: 'Orçamento enviado com sucesso! Entraremos em contato em breve.',
      budgetId: budget.id
    });

  } catch (error) {
    console.error('Erro ao processar orçamento:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao processar sua solicitação. Por favor, tente novamente.'
    });
  }
});
// Verificar status do orçamento
router.get('/status/:id', async (req, res) => {
  try {
    const budget = await Budget.findByPk(req.params.id, {
      attributes: ['id', 'name', 'status', 'createdAt', 'updatedAt']
    });

    if (!budget) {
      return res.status(404).json({
        success: false,
        message: 'Orçamento não encontrado.'
      });
    }

    res.json({
      success: true,
      budget: budget
    });
  } catch (error) {
    console.error('Erro ao buscar status:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar status do orçamento.'
    });
  }
});

module.exports = router;

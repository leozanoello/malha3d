const express = require('express');
const router = express.Router();
const { Project, Testimonial, Setting, Client, Budget } = require('../models');

// Página inicial
router.get('/', async (req, res) => {
  try {


    // Buscar projetos em destaque
    const featuredProjects = await Project.findAll({
      where: { isActive: true, isFeatured: true },
      order: [['order', 'ASC'], ['createdAt', 'DESC']],
      limit: 6
    });

    // Buscar depoimentos ativos
    const testimonials = await Testimonial.findAll({
      where: { isActive: true },
      order: [['order', 'ASC'], ['createdAt', 'DESC']],
      limit: 6
    });

    // Buscar configurações da página
    const settings = await Setting.findAll({
      where: {
        group: ['about', 'contact', 'videos', 'faq', 'footer']
      }
    });

    // Organizar configurações por grupo
    const settingsByGroup = {};
    settings.forEach(setting => {
      if (!settingsByGroup[setting.group]) {
        settingsByGroup[setting.group] = {};
      }
      settingsByGroup[setting.group][setting.key] = setting.value;
    });

    res.render('home', {

      title: 'Malha 3D - Renderização e Modelagem 3D Profissional',
      banner: settingsByGroup.banner || {},
      projects: featuredProjects,
      testimonials: testimonials,
      about: settingsByGroup.about || {},
      contact: settingsByGroup.contact || {},
      videos: settingsByGroup.videos || {},
      faq: settingsByGroup.faq || {},
      footer: settingsByGroup.footer || {}
    });
  } catch (error) {
    console.error('Erro ao carregar página inicial:', error);
    res.status(500).render('error/500', {
      title: 'Erro ao carregar página',
      error: process.env.NODE_ENV === 'development' ? error : {}
    });
  }
});

// Página de contato
router.get('/contato', (req, res) => {
  res.render('contato', {
    title: 'Contato - Malha 3D'
  });
});

// Portal do Cliente - Rota Pública Segura
router.get('/portal/c/:id', async (req, res) => {
  try {
    const client = await Client.findByPk(req.params.id);
    if (!client) {
      return res.status(404).render('error/500', {
        title: 'Portal não encontrado',
        error: { message: 'O link de acesso do portal é inválido ou expirou.' }
      });
    }

    const budgets = await Budget.findAll({
      where: { clientId: client.id },
      order: [['createdAt', 'DESC']]
    });

    const projects = await Project.findAll({
      where: { clientId: client.id },
      order: [['createdAt', 'DESC']]
    });

    const activeBudgets = budgets.filter(b => b.winStatus === 'aberto');
    const executedBudgets = budgets.filter(b => b.winStatus === 'ganho');

    const activeProjects = projects.filter(p => p.status !== 'concluido');
    const completedProjects = projects.filter(p => p.status === 'concluido');

    // Load Global Settings from DB
    const cpSettingsRaw = await Setting.findAll({ where: { group: 'portal_cliente' } });
    const cpSettings = {};
    cpSettingsRaw.forEach(s => {
      cpSettings[s.key] = s.value;
    });

    const defaults = {
      'cp_domain': 'portal.malha3d.com',
      'cp_expiry': 'never',
      'cp_watermark': 'true',
      'cp_wm_text': 'MALHA 3D - PREVIEW',
      'cp_wm_opacity': '30',
      'cp_wm_pos': 'diagonal',
      'cp_require_sig': 'true',
      'cp_allow_4k': 'true',
      'cp_color_accent': '#ff6f00',
      'cp_color_bg': '#030712'
    };

    // Set defaults if they are missing
    for (const key in defaults) {
      if (cpSettings[key] === undefined) {
        cpSettings[key] = defaults[key];
      }
    }

    res.render('client/portal-view', {
      layout: false, // Standalone Layout Customizado
      title: `Portal do Cliente - ${client.name} | Malha 3D`,
      client: client.toJSON ? client.toJSON() : client,
      activeBudgets: activeBudgets.map(b => b.toJSON ? b.toJSON() : b),
      executedBudgets: executedBudgets.map(b => b.toJSON ? b.toJSON() : b),
      activeProjects: activeProjects.map(p => p.toJSON ? p.toJSON() : p),
      completedProjects: completedProjects.map(p => p.toJSON ? p.toJSON() : p),
      cpSettings
    });
  } catch (error) {
    console.error('Erro ao carregar Portal do Cliente:', error);
    res.status(500).render('error/500', {
      title: 'Erro no Portal',
      error: process.env.NODE_ENV === 'development' ? error : {}
    });
  }
});

module.exports = router;

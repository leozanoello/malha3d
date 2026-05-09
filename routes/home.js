const express = require('express');
const router = express.Router();
const { Project, Testimonial, Setting } = require('../models');

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

      title: 'Zanoello 3D - Renderização e Modelagem 3D Profissional',
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
    title: 'Contato - Zanoello 3D'
  });
});

module.exports = router;

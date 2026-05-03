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

// Página de galeria completa
router.get('/galeria', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 9;
    const offset = (page - 1) * limit;
    const category = req.query.categoria || 'all';

    const whereClause = { isActive: true };
    if (category !== 'all') {
      whereClause.category = category;
    }

    const { count, rows: projects } = await Project.findAndCountAll({
      where: whereClause,
      order: [['order', 'ASC'], ['createdAt', 'DESC']],
      limit: limit,
      offset: offset
    });

    const totalPages = Math.ceil(count / limit);

    res.render('galeria', {
      title: 'Galeria de Projetos - Zanoello 3D',
      projects: projects,
      currentPage: page,
      totalPages: totalPages,
      totalProjects: count,
      currentCategory: category,
      categories: [
        { value: 'all', label: 'Todos' },
        { value: 'interior', label: 'Interiores' },
        { value: 'exterior', label: 'Exteriores' },
        { value: 'produto', label: 'Produtos' },
        { value: 'arquitetonico', label: 'Arquitetônico' },
        { value: 'animacao', label: 'Animação' },
        { value: 'outro', label: 'Outros' }
      ]
    });
  } catch (error) {
    console.error('Erro ao carregar galeria:', error);
    res.render('galeria', {
      title: 'Erro ao carregar galeria',
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

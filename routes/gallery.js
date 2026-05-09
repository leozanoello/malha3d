const express = require('express');
const router = express.Router();
const { Project } = require('../models');

// Página da galeria
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 12;
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
      projects: projects.map(p => p.get({ plain: true })) || [],
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
    console.error('Erro ao buscar projetos:', error);
    res.render('galeria', {
      title: 'Galeria de Projetos - Zanoello 3D',
      projects: [],
      categories: []
    });
  }
});

// Filtro por categoria
router.get('/categoria/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const projects = await Project.findAll({
      where: {
        isActive: true,
        category: category
      },
      order: [['order', 'ASC'], ['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      projects: projects || []
    });
  } catch (error) {
    console.error('Erro ao buscar projetos por categoria:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao buscar projetos'
    });
  }
});

module.exports = router;

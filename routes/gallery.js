const express = require('express');
const router = express.Router();
const { Project } = require('../models');

// Página da galeria
router.get('/', async (req, res) => {
  try {
    const projects = await Project.findAll({
      where: { isActive: true },
      order: [['order', 'ASC'], ['createdAt', 'DESC']]
    });

    res.render('galeria', {
      title: 'Galeria de Projetos - Zanoello 3D',
      projects: projects || []
    });
  } catch (error) {
    console.error('Erro ao buscar projetos:', error);
    res.render('galeria', {
      title: 'Galeria de Projetos - Zanoello 3D',
      projects: []
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

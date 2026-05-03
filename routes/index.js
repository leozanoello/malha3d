const express = require('express');
const router = express.Router();

// Rotas principais
const homeRoutes = require('./home');
const budgetRoutes = require('./budget');
const adminRoutes = require('./admin');
const apiRoutes = require('./api');
const authRoutes = require('./auth');
const galleryRoutes = require('./gallery');

// Rotas públicas
router.use('/', homeRoutes);
router.use('/orcamento', budgetRoutes);
router.use('/galeria', galleryRoutes);

// Rotas de API
router.use('/api', apiRoutes);
router.use('/api/auth', authRoutes);

// Rotas administrativas
router.use('/admin', adminRoutes);

module.exports = router;

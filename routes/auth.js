const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { User } = require('../models');
const { authMiddleware } = require('../middleware/auth');

// Secret key for JWT
const JWT_SECRET = process.env.JWT_SECRET || 'zanoello_jwt_secret';
const JWT_EXPIRES_IN = '24h';

/**
 * @route   POST /api/auth/register
 * @desc    Registrar novo usuário
 */
router.post('/register', async (req, res, next) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'E-mail e senha são obrigatórios.' });
    }

    // Verificar se o usuário já existe
    const userExists = await User.findOne({ where: { email } });
    if (userExists) {
      return res.status(400).json({ error: 'Usuário já existe com este e-mail.' });
    }

    // Criar usuário
    const user = await User.create({
      name,
      email,
      password, // Deixar o model hashear via hook
      phone,
      role: 'user' // Default role
    });

    // Gerar token
    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    const userResponse = user.toJSON();
    delete userResponse.password;

    res.status(201).json({
      user: userResponse,
      token
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/auth/login
 * @desc    Autenticar usuário e obter token
 */
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Por favor, forneça e-mail e senha.' });
    }

    // Buscar usuário
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Credenciais inválidas.' });
    }

    // Verificar senha
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Credenciais inválidas.' });
    }

    // Atualizar último login
    user.lastLogin = new Date();
    await user.save();

    // Gerar token
    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    const userResponse = user.toJSON();
    delete userResponse.password;

    res.json({
      user: userResponse,
      token
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/auth/logout
 * @desc    Logout do usuário (no cliente, apenas removemos o token)
 */
router.post('/logout', (req, res) => {
  res.json({ message: 'Logout realizado com sucesso.' });
});

/**
 * @route   GET /api/auth/profile
 * @desc    Obter perfil do usuário autenticado
 */
router.get('/profile', authMiddleware, async (req, res, next) => {
  try {
    const userResponse = req.user.toJSON();
    delete userResponse.password;
    res.json({ user: userResponse });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   PUT /api/auth/profile
 * @desc    Atualizar perfil do usuário autenticado
 */
router.put('/profile', authMiddleware, async (req, res) => {
  try {
    const { name, phone, email } = req.body;
    const user = req.user;

    if (email && email !== user.email) {
      const emailExists = await User.findOne({ where: { email } });
      if (emailExists) {
        return res.status(400).json({ error: 'E-mail já está em uso.' });
      }
      user.email = email;
    }

    if (name) {user.name = name;}
    if (phone) {user.phone = phone;}

    await user.save();

    const userResponse = user.toJSON();
    delete userResponse.password;

    res.json({ user: userResponse });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar perfil.' });
  }
});

/**
 * @route   POST /api/auth/change-password
 * @desc    Alterar senha do usuário autenticado
 */
router.post('/change-password', authMiddleware, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = req.user;

    // Verificar senha atual
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Senha atual incorreta.' });
    }

    // Atualizar senha (o hook do model irá hashear)
    user.password = newPassword;

    await user.save();

    res.json({ message: 'Senha alterada com sucesso.' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao alterar senha.' });
  }
});

module.exports = router;

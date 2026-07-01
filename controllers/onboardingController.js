const jwt = require('jsonwebtoken');
const { User } = require('../models');
const emailService = require('../services/emailService');

const JWT_SECRET = process.env.JWT_SECRET || 'zanoello_jwt_secret';
const APP_URL = process.env.APP_URL || 'http://localhost:3000';

exports.onboardNewRootTenant = async (req, res, next) => {
  try {
    const { email, name } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'E-mail é obrigatório para o cadastro Root.' });
    }

    // Verifica se o usuário já existe
    const userExists = await User.findOne({ where: { email } });
    if (userExists) {
      return res.status(400).json({ error: 'Já existe uma conta associada a este e-mail.' });
    }

    // Gera o Magic Link via JWT (expira em 30 min)
    const magicToken = jwt.sign({ email, name, isRoot: true }, JWT_SECRET, { expiresIn: '30m' });

    const magicLink = `${APP_URL}/api/auth/verify-magic-link?token=${magicToken}`;

    // Tenta enviar o e-mail, se o serviço falhar (ex: SMTP inválido no dev), loga o link no console
    try {
      await emailService.sendWelcomeEmail({ email, name: name || 'Novo Assinante' }, { loginUrl: magicLink });
    } catch (e) {
      console.warn('Falha ao enviar e-mail real. Simulando envio. Magic link gerado:', magicLink);
    }

    res.json({ success: true, message: 'Magic link enviado com sucesso.', magicLink });
  } catch (error) {
    next(error);
  }
};

exports.verifyMagicLink = async (req, res, next) => {
  try {
    const { token } = req.query;
    if (!token) {return res.status(400).send('Token ausente.');}

    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (e) {
      return res.status(401).send('Token inválido ou expirado.');
    }

    const { email, name, isRoot } = decoded;

    let user = await User.findOne({ where: { email } });

    if (!user && isRoot) {
      // Criação do Tenant Root - Zero-State garantido pelo novo ID
      user = await User.create({
        name: name || 'Dono do Estúdio',
        email,
        password: Math.random().toString(36).slice(-10), // Senha aleatória
        role: 'subscriber',
        parentId: null, // Isolamento Root: ele é o seu próprio parent
        tenantName: 'Novo Estúdio',
        isActive: true,
        permissions: {
          allowed_menus: ['dashboard', 'crm', 'projetos', 'propostas', 'financeiro', 'configuracoes', 'equipe']
        }
      });
    } else if (!user) {
      return res.status(404).send('Usuário não encontrado.');
    }

    // Ativa a sessão para o admin (session_token)
    req.session.userId = user.id;
    req.session.save((err) => {
      if (err) {return next(err);}
      // Redirecionamento para o dashboard limpo
      res.redirect('/admin');
    });
  } catch (error) {
    next(error);
  }
};

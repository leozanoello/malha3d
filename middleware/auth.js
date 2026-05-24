const jwt = require('jsonwebtoken');
const { User } = require('../models');

/**
 * Middleware para validar o token JWT nas rotas de API
 */
const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token não fornecido' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'zanoello_jwt_secret');
    
    // Testes esperam userId no payload
    const userId = decoded.userId || decoded.id;
    const user = await User.findByPk(userId);
    
    if (!user) {
      return res.status(401).json({ error: 'Usuário não encontrado' });
    }
    
    if (user.isActive === false || user.status === 'inactive' || user.status === 'suspended') {
      return res.status(401).json({ error: 'Usuário inativo' });
    }

    req.user = user;
    
    // Injeta o contexto de isolamento de tenant
    const { runWithTenant } = require('../utils/tenantContext');
    const isMasterAdmin = user.email === 'admin@zanoello.com' || user.email === 'admin@malha3d.com';
    
    if (!isMasterAdmin) {
      const tenantId = user.parentId || user.id;
      return runWithTenant(tenantId, next);
    } else {
      next();
    }
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expirado' });
    }
    return res.status(401).json({ error: 'Token inválido' });
  }
};

/**
 * Middleware para restringir acesso por roles específicos
 */
const requireRole = (roles) => {
  const allowedRoles = Array.isArray(roles) ? roles : [roles];
  
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Autenticação necessária' });
    }
    
    if (allowedRoles.includes(req.user.role)) {
      next();
    } else {
      res.status(403).json({ error: 'Acesso negado. Permissão insuficiente.' });
    }
  };
};

/**
 * Middleware de autenticação opcional
 */
const optionalAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  req.user = null;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'zanoello_jwt_secret');
      const userId = decoded.userId || decoded.id;
      const user = await User.findByPk(userId);
      if (user && user.isActive !== false) {
        req.user = user;
      }
    } catch (error) {
      // Ignorar erros na auth opcional
    }
  }
  next();
};

/**
 * Middleware de rate limit simplificado para testes
 */
const rateLimit = ({ windowMs, max, store }) => {
  return async (req, res, next) => {
    const key = req.ip;
    const now = Date.now();
    const requestData = store.get(key) || { count: 0, resetTime: now + windowMs };

    if (now > requestData.resetTime) {
      requestData.count = 1;
      requestData.resetTime = now + windowMs;
    } else {
      requestData.count++;
    }

    store.set(key, requestData);

    if (requestData.count > max) {
      return res.status(429).json({ error: 'Muitas requisições, tente novamente mais tarde' });
    }

    next();
  };
};

/**
 * Middleware para restringir acesso a administradores
 */
const adminMiddleware = requireRole('admin');

/**
 * Middleware para exigir autenticação (alias para authMiddleware ou verificação simples se já autenticado)
 */
const requireAuth = async (req, res, next) => {
  if (req.user) {
    return next();
  }
  
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Autenticação necessária' });
  }

  return authMiddleware(req, res, next);
};

// Alias para compatibilidade com testes
const authenticate = authMiddleware;

module.exports = {
  authMiddleware,
  adminMiddleware,
  requireRole,
  optionalAuth,
  rateLimit,
  authenticate,
  requireAuth
};

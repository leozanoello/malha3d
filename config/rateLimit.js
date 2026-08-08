const rateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis');
const Redis = require('ioredis');

// Configuração do Redis
const redisClient = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
  db: process.env.REDIS_DB || 0,
  retryDelayOnFailover: 100,
  maxRetriesPerRequest: 3,
  lazyConnect: true,
  keepAlive: 30000,
  family: 4,
  connectTimeout: 10000,
  commandTimeout: 5000,
  autoResubscribe: true,
  autoResendUnfulfilledCommands: true,
  reconnectOnError: (err) => {
    const targetError = 'READONLY';
    if (err.message.includes(targetError)) {
      return true;
    }
    return false;
  },
  enableOfflineQueue: true
});

// Rate limit geral
const generalLimiter = rateLimit({
  store: new RedisStore({
    client: redisClient,
    prefix: 'rl:general:'
  }),
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 10000, // limite de 10000 requisições por IP (desenvolvimento)
  message: {
    error: 'Muitas requisições. Por favor, tente novamente mais tarde.',
    code: 'RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      error: 'Muitas requisições. Por favor, tente novamente mais tarde.',
      code: 'RATE_LIMIT_EXCEEDED',
      retryAfter: res.getHeader('Retry-After')
    });
  },
  onLimitReached: (req) => {
    console.warn(`Rate limit excedido para IP: ${req.ip}`);
  }
});

// Rate limit para API
const apiLimiter = rateLimit({
  store: new RedisStore({
    client: redisClient,
    prefix: 'rl:api:'
  }),
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 10000, // limite de 10000 requisições por IP (desenvolvimento)
  message: {
    error: 'Muitas requisições à API. Por favor, tente novamente mais tarde.',
    code: 'API_RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Ignora rate limit para IPs confiáveis
    const trustedIPs = process.env.TRUSTED_IPS ? process.env.TRUSTED_IPS.split(',') : [];
    return trustedIPs.includes(req.ip);
  }
});

// Rate limit para autenticação
const authLimiter = rateLimit({
  store: new RedisStore({
    client: redisClient,
    prefix: 'rl:auth:'
  }),
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // limite de 5 tentativas por IP
  message: {
    error: 'Muitas tentativas de autenticação. Por favor, tente novamente mais tarde.',
    code: 'AUTH_RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Não conta requisições bem-sucedidas
  handler: (req, res) => {
    res.status(429).json({
      error: 'Muitas tentativas de autenticação. Por favor, tente novamente em 15 minutos.',
      code: 'AUTH_RATE_LIMIT_EXCEEDED',
      retryAfter: res.getHeader('Retry-After')
    });
  }
});

// Rate limit para registro
const registerLimiter = rateLimit({
  store: new RedisStore({
    client: redisClient,
    prefix: 'rl:register:'
  }),
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 3, // limite de 3 registros por IP
  message: {
    error: 'Muitas tentativas de registro. Por favor, tente novamente mais tarde.',
    code: 'REGISTER_RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Rate limit para recuperação de senha
const passwordResetLimiter = rateLimit({
  store: new RedisStore({
    client: redisClient,
    prefix: 'rl:password_reset:'
  }),
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 3, // limite de 3 tentativas por IP
  message: {
    error: 'Muitas tentativas de recuperação de senha. Por favor, tente novamente mais tarde.',
    code: 'PASSWORD_RESET_RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Rate limit para orçamentos
const budgetLimiter = rateLimit({
  store: new RedisStore({
    client: redisClient,
    prefix: 'rl:budget:'
  }),
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 10, // limite de 10 orçamentos por IP
  message: {
    error: 'Muitas solicitações de orçamento. Por favor, tente novamente mais tarde.',
    code: 'BUDGET_RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    // Usa email do usuário se estiver autenticado, senão usa IP
    return req.user?.email || req.ip;
  }
});

// Rate limit para upload de arquivos
const uploadLimiter = rateLimit({
  store: new RedisStore({
    client: redisClient,
    prefix: 'rl:upload:'
  }),
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 20, // limite de 20 uploads por IP
  message: {
    error: 'Muitos uploads. Por favor, tente novamente mais tarde.',
    code: 'UPLOAD_RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Rate limit para admin
const adminLimiter = rateLimit({
  store: new RedisStore({
    client: redisClient,
    prefix: 'rl:admin:'
  }),
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 10000, // limite de 10000 requisições por IP (desenvolvimento)
  message: {
    error: 'Muitas requisições ao painel administrativo.',
    code: 'ADMIN_RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Verifica se o usuário é admin
    return req.user?.role === 'admin';
  }
});

// Rate limit por usuário (se autenticado)
const userLimiter = rateLimit({
  store: new RedisStore({
    client: redisClient,
    prefix: 'rl:user:'
  }),
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 1000, // limite de 1000 requisições por usuário
  message: {
    error: 'Muitas requisições. Por favor, tente novamente mais tarde.',
    code: 'USER_RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    // Usa ID do usuário se estiver autenticado, senão usa IP
    return req.user?.id?.toString() || req.ip;
  },
  skip: (req) => {
    // Não aplica rate limit se não estiver autenticado
    return !req.user;
  }
});

// Rate limit para endpoints críticos
const criticalLimiter = rateLimit({
  store: new RedisStore({
    client: redisClient,
    prefix: 'rl:critical:'
  }),
  windowMs: 5 * 60 * 1000, // 5 minutos
  max: 10, // limite de 10 requisições por IP
  message: {
    error: 'Muitas requisições a endpoints críticos. Por favor, tente novamente mais tarde.',
    code: 'CRITICAL_RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Rate limit dinâmico baseado em IP
const dynamicLimiter = rateLimit({
  store: new RedisStore({
    client: redisClient,
    prefix: 'rl:dynamic:'
  }),
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: async (req) => {
    // Define limite baseado no IP
    const ip = req.ip;

    // Verifica se é um IP suspeito (ex: muitas requisições recentes)
    const key = `suspicious:${ip}`;
    const suspiciousCount = await redisClient.get(key);

    if (suspiciousCount && parseInt(suspiciousCount) > 100) {
      return 50; // Limite reduzido para IPs suspeitos
    }

    // Verifica se é um IP de datacenter/cloud
    const datacenterIPs = [
      '173.245', '103.21', '103.22', '103.31', '141.101',
      '108.162', '190.93', '190.115', '188.114', '197.234',
      '198.41', '162.158', '104.16', '104.24', '172.64',
      '131.0', '2400:cb00', '2606:4700', '2803:f800', '2405:b500',
      '2405:8100', '2a06:98c0', '2c0f:f248'
    ];

    const isDatacenter = datacenterIPs.some(prefix => ip.startsWith(prefix));
    if (isDatacenter) {
      return 100; // Limite reduzido para datacenters
    }

    return 1000; // Limite padrão
  },
  message: {
    error: 'Muitas requisições. Por favor, tente novamente mais tarde.',
    code: 'DYNAMIC_RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Função para criar rate limit customizado
const createCustomLimiter = (options) => {
  const {
    windowMs = 15 * 60 * 1000,
    max = 100,
    message = 'Muitas requisições. Por favor, tente novamente mais tarde.',
    keyGenerator = (req) => req.ip,
    skip = () => false,
    prefix = 'rl:custom:'
  } = options;

  return rateLimit({
    store: new RedisStore({
      client: redisClient,
      prefix: prefix
    }),
    windowMs,
    max,
    message: {
      error: message,
      code: 'CUSTOM_RATE_LIMIT_EXCEEDED'
    },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator,
    skip
  });
};

// Middleware para marcar IP como suspeito
const markSuspicious = async (ip) => {
  const key = `suspicious:${ip}`;
  await redisClient.incr(key);
  await redisClient.expire(key, 3600); // Expira em 1 hora
};

// Middleware para verificar se IP está bloqueado
const checkBlocked = async (ip) => {
  const key = `blocked:${ip}`;
  const isBlocked = await redisClient.get(key);
  return !!isBlocked;
};

// Middleware para bloquear IP
const blockIP = async (ip, duration = 3600) => {
  const key = `blocked:${ip}`;
  await redisClient.setex(key, duration, '1');
  await markSuspicious(ip);
};

// Middleware para desbloquear IP
const unblockIP = async (ip) => {
  const key = `blocked:${ip}`;
  await redisClient.del(key);
};

// Middleware de verificação de bloqueio
const blockCheckMiddleware = async (req, res, next) => {
  try {
    const isBlocked = await checkBlocked(req.ip);
    if (isBlocked) {
      return res.status(403).json({
        error: 'Seu IP foi bloqueado devido a atividades suspeitas.',
        code: 'IP_BLOCKED'
      });
    }
    next();
  } catch (error) {
    console.error('Erro ao verificar IP bloqueado:', error);
    next(); // Continua mesmo se houver erro
  }
};

// Função para limpar rate limits de um IP
const clearRateLimits = async (ip) => {
  const patterns = [
    'rl:general:*',
    'rl:api:*',
    'rl:auth:*',
    'rl:register:*',
    'rl:password_reset:*',
    'rl:budget:*',
    'rl:upload:*',
    'rl:admin:*',
    'rl:user:*',
    'rl:critical:*',
    'rl:dynamic:*'
  ];

  for (const pattern of patterns) {
    const keys = await redisClient.keys(pattern);
    for (const key of keys) {
      if (key.includes(ip)) {
        await redisClient.del(key);
      }
    }
  }
};

module.exports = {
  redisClient,
  generalLimiter,
  apiLimiter,
  authLimiter,
  registerLimiter,
  passwordResetLimiter,
  budgetLimiter,
  uploadLimiter,
  adminLimiter,
  userLimiter,
  criticalLimiter,
  dynamicLimiter,
  createCustomLimiter,
  markSuspicious,
  checkBlocked,
  blockIP,
  unblockIP,
  blockCheckMiddleware,
  clearRateLimits
};

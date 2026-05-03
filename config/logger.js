const winston = require('winston');
const path = require('path');
const { format } = winston;

// Configuração de níveis de log personalizados
const customLevels = {
  levels: {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    verbose: 4,
    debug: 5,
    silly: 6
  },
  colors: {
    error: 'red',
    warn: 'yellow',
    info: 'green',
    http: 'magenta',
    verbose: 'cyan',
    debug: 'blue',
    silly: 'gray'
  }
};

// Adiciona cores personalizadas
winston.addColors(customLevels.colors);

// Formato de log para console
const consoleFormat = format.combine(
  format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  format.errors({ stack: true }),
  format.colorize({ all: true }),
  format.printf(({ level, message, timestamp, stack, ...metadata }) => {
    let logMessage = `${timestamp} [${level.toUpperCase()}]: ${message}`;

    if (Object.keys(metadata).length > 0) {
      logMessage += ` ${JSON.stringify(metadata)}`;
    }

    if (stack) {
      logMessage += `\n${stack}`;
    }

    return logMessage;
  })
);

// Formato de log para arquivo
const fileFormat = format.combine(
  format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  format.errors({ stack: true }),
  format.json()
);

// Formato de log HTTP específico
const httpFormat = format.combine(
  format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  format.json(),
  format.printf(({ timestamp, level, message, ...metadata }) => {
    return JSON.stringify({
      timestamp,
      level,
      message,
      ...metadata
    });
  })
);

// Cria diretórios de log se não existirem
const logDir = path.join(__dirname, '../logs');
const ensureLogDirectory = () => {
  const fs = require('fs');
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }
};
ensureLogDirectory();

// Configuração de transportes
const transports = [];

// Transporte de console (sempre ativo)
transports.push(
  new winston.transports.Console({
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    format: consoleFormat,
    handleExceptions: true,
    handleRejections: true
  })
);

// Transporte de arquivo de erro (sempre ativo)
transports.push(
  new winston.transports.File({
    filename: path.join(logDir, 'error.log'),
    level: 'error',
    format: fileFormat,
    maxsize: 5242880, // 5MB
    maxFiles: 5,
    handleExceptions: true,
    handleRejections: true
  })
);

// Transporte de arquivo de combinação (sempre ativo)
transports.push(
  new winston.transports.File({
    filename: path.join(logDir, 'combined.log'),
    format: fileFormat,
    maxsize: 5242880, // 5MB
    maxFiles: 5
  })
);

// Transporte de arquivo HTTP (sempre ativo)
transports.push(
  new winston.transports.File({
    filename: path.join(logDir, 'http.log'),
    level: 'http',
    format: httpFormat,
    maxsize: 5242880, // 5MB
    maxFiles: 5
  })
);

// Transportes adicionais para produção
if (process.env.NODE_ENV === 'production') {
  // Transporte de arquivo de avisos
  transports.push(
    new winston.transports.File({
      filename: path.join(logDir, 'warn.log'),
      level: 'warn',
      format: fileFormat,
      maxsize: 5242880, // 5MB
      maxFiles: 5
    })
  );

  // Transporte de arquivo de informações
  transports.push(
    new winston.transports.File({
      filename: path.join(logDir, 'info.log'),
      level: 'info',
      format: fileFormat,
      maxsize: 5242880, // 5MB
      maxFiles: 5
    })
  );

  // Transporte de arquivo de debug (se debug estiver ativado)
  if (process.env.DEBUG_LOGS === 'true') {
    transports.push(
      new winston.transports.File({
        filename: path.join(logDir, 'debug.log'),
        level: 'debug',
        format: fileFormat,
        maxsize: 5242880, // 5MB
        maxFiles: 5
      })
    );
  }
}

// Cria o logger
const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  levels: customLevels.levels,
  format: format.combine(
    format.timestamp(),
    format.errors({ stack: true })
  ),
  transports: transports,
  exitOnError: false
});

// Cria logger HTTP específico
const httpLogger = winston.createLogger({
  level: 'http',
  levels: { http: 3 },
  format: httpFormat,
  transports: [
    new winston.transports.Console({
      level: 'http',
      format: format.combine(
        format.colorize(),
        format.simple()
      )
    }),
    new winston.transports.File({
      filename: path.join(logDir, 'http.log'),
      level: 'http',
      format: httpFormat,
      maxsize: 5242880, // 5MB
      maxFiles: 5
    })
  ]
});

// Métodos auxiliares
const stream = {
  write: (message) => {
    logger.http(message.trim());
  }
};

// Função para criar logger específico por módulo
const createModuleLogger = (moduleName) => {
  return winston.createLogger({
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    levels: customLevels.levels,
    format: format.combine(
      format.label({ label: moduleName }),
      format.timestamp(),
      format.errors({ stack: true }),
      format.json()
    ),
    transports: [
      new winston.transports.Console({
        level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
        format: format.combine(
          format.colorize(),
          format.printf(({ level, message, timestamp, label, ...metadata }) => {
            return `${timestamp} [${label}] ${level}: ${message} ${Object.keys(metadata).length ? JSON.stringify(metadata) : ''}`;
          })
        )
      }),
      new winston.transports.File({
        filename: path.join(logDir, `${moduleName}.log`),
        format: fileFormat,
        maxsize: 5242880, // 5MB
        maxFiles: 3
      })
    ]
  });
};

// Função para logar erros com stack trace completo
const logError = (error, context = {}) => {
  logger.error({
    message: error.message,
    stack: error.stack,
    ...context
  });

  // Também envia para Sentry se estiver configurado
  if (process.env.NODE_ENV === 'production' && process.env.SENTRY_DSN) {
    const sentry = require('./sentry');
    sentry.captureException(error, context);
  }
};

// Função para logar requisições HTTP
const logRequest = (req, res, responseTime) => {
  const logData = {
    method: req.method,
    url: req.originalUrl || req.url,
    status: res.statusCode,
    responseTime: `${responseTime}ms`,
    userAgent: req.get('User-Agent'),
    ip: req.ip || req.connection.remoteAddress,
    userId: req.user?.id || 'anonymous'
  };

  if (res.statusCode >= 400) {
    logger.warn(logData);
  } else {
    logger.http(logData);
  }
};

// Função para logar queries do banco de dados
const logQuery = (query, duration, error = null) => {
  const logData = {
    query: query.sql || query,
    duration: `${duration}ms`,
    timestamp: new Date().toISOString()
  };

  if (error) {
    logData.error = error.message;
    logger.error(logData);
  } else if (duration > 1000) {
    logData.slow = true;
    logger.warn(logData);
  } else {
    logger.debug(logData);
  }
};

// Função para logar eventos de negócio
const logEvent = (event, data = {}) => {
  logger.info({
    event,
    data,
    timestamp: new Date().toISOString()
  });
};

// Função para logar métricas de performance
const logMetric = (metric, value, tags = {}) => {
  logger.info({
    metric,
    value,
    tags,
    timestamp: new Date().toISOString()
  });
};

// Função para logar auditoria
const logAudit = (action, user, resource, details = {}) => {
  logger.info({
    audit: true,
    action,
    user: user.id || user,
    resource,
    details,
    timestamp: new Date().toISOString(),
    ip: details.ip || 'unknown'
  });
};

// Função para logar segurança
const logSecurity = (event, details = {}) => {
  logger.warn({
    security: true,
    event,
    details,
    timestamp: new Date().toISOString()
  });
};

// Exporta o logger e funções auxiliares
module.exports = {
  logger,
  httpLogger,
  stream,
  createModuleLogger,
  logError,
  logRequest,
  logQuery,
  logEvent,
  logMetric,
  logAudit,
  logSecurity
};

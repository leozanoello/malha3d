const Sentry = require('@sentry/node');
const Tracing = require('@sentry/tracing');

// Configuração do Sentry
const initSentry = (app) => {
  if (process.env.NODE_ENV === 'production' && process.env.SENTRY_DSN) {
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      environment: process.env.NODE_ENV || 'development',
      release: process.env.APP_VERSION || '1.0.0',

      // Configurações de rastreamento
      integrations: [
        new Sentry.Integrations.Http({ tracing: true }),
        new Tracing.Integrations.Express({ app }),
        new Tracing.Integrations.Mysql(),
        new Tracing.Integrations.Redis(),
        new Sentry.Integrations.OnUnhandledRejection({ mode: 'strict' }),
        new Sentry.Integrations.OnUncaughtException({ exitEvenIfOtherHandlersAreRegistered: false })
      ],

      // Taxa de amostragem para traces
      tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

      // Taxa de amostragem para profiles
      profilesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

      // Taxa de amostragem para erros
      sampleRate: 1.0,

      // Configurações de beforeSend
      beforeSend(event) {
        // Remove informações sensíveis
        if (event.request) {
          if (event.request.headers) {
            delete event.request.headers.authorization;
            delete event.request.headers.cookie;
            delete event.request.headers['x-api-key'];
          }

          if (event.request.data) {
            // Remove dados sensíveis do corpo da requisição
            const sensitiveFields = ['password', 'token', 'secret', 'api_key', 'credit_card', 'cvv'];
            sensitiveFields.forEach(field => {
              if (event.request.data[field]) {
                event.request.data[field] = '[REDACTED]';
              }
            });
          }
        }

        // Remove informações sensíveis dos extras
        if (event.extra) {
          delete event.extra.password;
          delete event.extra.token;
          delete event.extra.secret;
        }

        return event;
      },

      // Configurações de beforeBreadcrumb
      beforeBreadcrumb(breadcrumb) {
        // Remove breadcrumbs de console em produção
        if (process.env.NODE_ENV === 'production' && breadcrumb.category === 'console') {
          return null;
        }
        return breadcrumb;
      },

      // Tags padrão
      tags: {
        app: 'zanoello3d-landing',
        version: process.env.APP_VERSION || '1.0.0',
        server_name: require('os').hostname()
      },

      // Contexto adicional
      initialScope: {
        user: {
          id: 'system',
          username: 'system'
        },
        contexts: {
          runtime: {
            name: 'node',
            version: process.version
          },
          os: {
            name: require('os').platform(),
            version: require('os').release()
          }
        }
      },

      // Configurações de deduplicação
      dedupe: true,


      // Configurações de debug
      debug: process.env.NODE_ENV !== 'production',

      // Configurações de servidor
      serverName: require('os').hostname(),

      // Configurações de max value length
      maxValueLength: 1000,

      // Configurações de max breadcrumb
      maxBreadcrumbs: 100,

      // Configurações de attachStacktrace
      attachStacktrace: true,

      // Configurações de sendDefaultPii
      sendDefaultPii: false
    });

    console.log('Sentry configurado com sucesso');
  }
};

// Middleware do Express
const sentryMiddleware = (app) => {
  if (process.env.NODE_ENV === 'production' && process.env.SENTRY_DSN) {
    // RequestHandler cria um domínio para cada requisição
    app.use(Sentry.Handlers.requestHandler());

    // TracingHandler cria um trace para cada requisição
    app.use(Sentry.Handlers.tracingHandler());
  }
};

// Error handler do Express
const sentryErrorHandler = (app) => {
  if (process.env.NODE_ENV === 'production' && process.env.SENTRY_DSN) {
    // The error handler must be before any other error middleware and after all controllers
    app.use(Sentry.Handlers.errorHandler({
      shouldHandleError(error) {
        // Capture all 5xx errors
        if (error.status && error.status >= 500) {
          return true;
        }
        // Capture all unhandled errors
        return true;
      }
    }));
  }
};

// Função para capturar exceções
const captureException = (error, context = {}) => {
  if (process.env.NODE_ENV === 'production' && process.env.SENTRY_DSN) {
    Sentry.captureException(error, {
      contexts: {
        error_context: context
      }
    });
  }
};

// Função para capturar mensagens
const captureMessage = (message, level = 'info', context = {}) => {
  if (process.env.NODE_ENV === 'production' && process.env.SENTRY_DSN) {
    Sentry.captureMessage(message, level, {
      contexts: {
        message_context: context
      }
    });
  }
};

// Função para configurar usuário
const setUser = (user) => {
  if (process.env.NODE_ENV === 'production' && process.env.SENTRY_DSN) {
    Sentry.configureScope(scope => {
      scope.setUser({
        id: user.id?.toString() || 'anonymous',
        username: user.name || user.email || 'anonymous',
        email: user.email,
        ip_address: '{{auto}}'
      });
    });
  }
};

// Função para adicionar tags
const setTags = (tags) => {
  if (process.env.NODE_ENV === 'production' && process.env.SENTRY_DSN) {
    Sentry.configureScope(scope => {
      Object.keys(tags).forEach(key => {
        scope.setTag(key, tags[key]);
      });
    });
  }
};

// Função para adicionar contexto
const setContext = (name, context) => {
  if (process.env.NODE_ENV === 'production' && process.env.SENTRY_DSN) {
    Sentry.configureScope(scope => {
      scope.setContext(name, context);
    });
  }
};

// Função para criar breadcrumbs
const addBreadcrumb = (breadcrumb) => {
  if (process.env.NODE_ENV === 'production' && process.env.SENTRY_DSN) {
    Sentry.addBreadcrumb({
      category: breadcrumb.category || 'default',
      message: breadcrumb.message,
      level: breadcrumb.level || 'info',
      data: breadcrumb.data || {},
      timestamp: Date.now() / 1000
    });
  }
};

// Função para configurar extra
const setExtra = (key, value) => {
  if (process.env.NODE_ENV === 'production' && process.env.SENTRY_DSN) {
    Sentry.configureScope(scope => {
      scope.setExtra(key, value);
    });
  }
};

// Função para limpar contexto
const clearContext = () => {
  if (process.env.NODE_ENV === 'production' && process.env.SENTRY_DSN) {
    Sentry.configureScope(scope => {
      scope.clear();
    });
  }
};

// Função para flush (enviar eventos pendentes)
const flush = async (timeout = 2000) => {
  if (process.env.NODE_ENV === 'production' && process.env.SENTRY_DSN) {
    await Sentry.flush(timeout);
  }
};

// Função para close (fechar conexão)
const close = async (timeout = 2000) => {
  if (process.env.NODE_ENV === 'production' && process.env.SENTRY_DSN) {
    await Sentry.close(timeout);
  }
};

module.exports = {
  initSentry,
  sentryMiddleware,
  sentryErrorHandler,
  captureException,
  captureMessage,
  setUser,
  setTags,
  setContext,
  addBreadcrumb,
  setExtra,
  clearContext,
  flush,
  close,
  Sentry
};

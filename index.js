const express = require('express');
const exphbs = require('express-handlebars');
const path = require('path');
const session = require('express-session');
const SequelizeStore = require('connect-session-sequelize')(session.Store);
const flash = require('connect-flash');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const { sequelize } = require('./models');

// Import routes
const routes = require('./routes');

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://cdnjs.cloudflare.com', 'https://fonts.googleapis.com'],
      scriptSrc: ["'self'", "'unsafe-inline'", 'https://cdnjs.cloudflare.com', 'https://code.jquery.com'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com'],
      imgSrc: ["'self'", 'data:', 'https:', 'http:'],
      connectSrc: ["'self'"]
    }
  }
}));

// Compression
app.use(compression());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Muitas requisições deste IP, tente novamente mais tarde.'
});
app.use(limiter);

// Stricter rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Muitas tentativas de login, tente novamente mais tarde.'
});

// Body parsing middleware
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

// Method override for PUT/DELETE
app.use(methodOverride('_method'));

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key-change-this-in-production',
  store: new SequelizeStore({
    db: sequelize,
    tableName: 'sessions',
    checkExpirationInterval: 15 * 60 * 1000, // Clean up expired sessions every 15 minutes
    expiration: 24 * 60 * 60 * 1000 // Expire sessions after 24 hours
  }),
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Flash messages
app.use(flash());

// Global middleware for flash messages and user session
app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  res.locals.user = req.session.user || null;
  next();
});

// Handlebars configuration
const hbs = exphbs.create({
  defaultLayout: 'main',
  layoutsDir: path.join(__dirname, 'views/layouts'),
  partialsDir: path.join(__dirname, 'views/partials'),
  extname: '.hbs',
  helpers: {
    // Date formatting
    formatDate: function (date, format) {
      if (!date) {return '';}
      const d = new Date(date);
      const options = {
        'short': { day: '2-digit', month: '2-digit', year: 'numeric' },
        'long': { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' },
        'time': { hour: '2-digit', minute: '2-digit' }
      };
      return d.toLocaleDateString('pt-BR', options[format] || options['short']);
    },

    // Currency formatting
    formatCurrency: function (value) {
      if (value === null || value === undefined) {return 'R$ 0,00';}
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(value);
    },

    // Phone formatting
    formatPhone: function (phone) {
      if (!phone) {return '';}
      // Remove non-digits
      const cleaned = phone.replace(/\D/g, '');
      if (cleaned.length === 11) {
        return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
      } else if (cleaned.length === 10) {
        return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`;
      }
      return phone;
    },

    // CPF/CNPJ formatting
    formatDocument: function (doc) {
      if (!doc) {return '';}
      const cleaned = doc.replace(/\D/g, '');
      if (cleaned.length === 11) {
        return `${cleaned.slice(0, 3)}.${cleaned.slice(3, 6)}.${cleaned.slice(6, 9)}-${cleaned.slice(9)}`;
      } else if (cleaned.length === 14) {
        return `${cleaned.slice(0, 2)}.${cleaned.slice(2, 5)}.${cleaned.slice(5, 8)}/${cleaned.slice(8, 12)}-${cleaned.slice(12)}`;
      }
      return doc;
    },

    // Status badge
    statusBadge: function (status) {
      const badges = {
        'pending': '<span class="badge bg-warning">Pendente</span>',
        'approved': '<span class="badge bg-success">Aprovado</span>',
        'rejected': '<span class="badge bg-danger">Rejeitado</span>',
        'in_progress': '<span class="badge bg-info">Em Andamento</span>',
        'completed': '<span class="badge bg-primary">Concluído</span>',
        'cancelled': '<span class="badge bg-secondary">Cancelado</span>',
        'active': '<span class="badge bg-success">Ativo</span>',
        'inactive': '<span class="badge bg-secondary">Inativo</span>'
      };
      return badges[status] || `<span class="badge bg-light">${status}</span>`;
    },

    // Rating stars
    ratingStars: function (rating) {
      if (!rating) {return '';}
      let stars = '';
      for (let i = 1; i <= 5; i++) {
        if (i <= rating) {
          stars += '<i class="fas fa-star text-warning"></i>';
        } else {
          stars += '<i class="far fa-star text-muted"></i>';
        }
      }
      return stars;
    },

    // Truncate text
    truncate: function (str, length) {
      if (!str) {return '';}
      if (str.length <= length) {return str;}
      return `${str.substring(0, length)}...`;
    },

    // JSON stringify
    json: function (context) {
      return JSON.stringify(context);
    },

    // Comparison helpers
    eq: function (a, b) {
      return a === b;
    },

    ne: function (a, b) {
      return a !== b;
    },

    lt: function (a, b) {
      return a < b;
    },

    le: function (a, b) {
      return a <= b;
    },

    gt: function (a, b) {
      return a > b;
    },

    ge: function (a, b) {
      return a >= b;
    },

    // Math helpers
    add: function (a, b) {
      return (parseFloat(a) || 0) + (parseFloat(b) || 0);
    },

    subtract: function (a, b) {
      return (parseFloat(a) || 0) - (parseFloat(b) || 0);
    },

    multiply: function (a, b) {
      return (parseFloat(a) || 0) * (parseFloat(b) || 0);
    },

    divide: function (a, b) {
      const divisor = parseFloat(b) || 0;
      return divisor === 0 ? 0 : (parseFloat(a) || 0) / divisor;
    },

    // Array helpers
    length: function (array) {
      return array ? array.length : 0;
    },

    // Conditional helpers
    ifCond: function (v1, operator, v2, options) {
      switch (operator) {
        case '==':
          return (v1 === v2) ? options.fn(this) : options.inverse(this);
        case '===':
          return (v1 === v2) ? options.fn(this) : options.inverse(this);
        case '!=':
          return (v1 !== v2) ? options.fn(this) : options.inverse(this);
        case '!==':
          return (v1 !== v2) ? options.fn(this) : options.inverse(this);
        case '<':
          return (v1 < v2) ? options.fn(this) : options.inverse(this);
        case '<=':
          return (v1 <= v2) ? options.fn(this) : options.inverse(this);
        case '>':
          return (v1 > v2) ? options.fn(this) : options.inverse(this);
        case '>=':
          return (v1 >= v2) ? options.fn(this) : options.inverse(this);
        case '&&':
          return (v1 && v2) ? options.fn(this) : options.inverse(this);
        case '||':
          return (v1 || v2) ? options.fn(this) : options.inverse(this);
        default:
          return options.inverse(this);
      }
    }
  }
});

// Set Handlebars as the view engine
app.engine('.hbs', hbs.engine);
app.set('view engine', '.hbs');
app.set('views', path.join(__dirname, 'views'));

// Static files
app.use('/public', express.static(path.join(__dirname, 'public')));

// Routes
app.use('/', routes);

// Apply stricter rate limiting to auth routes
app.use('/admin/login', authLimiter);

// Error handling middleware
app.use((err, req, res, _next) => {
  console.error(err.stack);

  // Handle multer errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    req.flash('error_msg', 'Arquivo muito grande. Tamanho máximo permitido é 5MB.');
    return res.redirect('back');
  }

  if (err.code === 'LIMIT_FILE_COUNT') {
    req.flash('error_msg', 'Muitos arquivos enviados.');
    return res.redirect('back');
  }

  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    req.flash('error_msg', 'Tipo de arquivo não esperado.');
    return res.redirect('back');
  }

  // Handle validation errors
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(e => e.message);
    req.flash('error_msg', errors.join(', '));
    return res.redirect('back');
  }

  // Handle Sequelize errors
  if (err.name === 'SequelizeValidationError') {
    const errors = err.errors.map(e => e.message);
    req.flash('error_msg', errors.join(', '));
    return res.redirect('back');
  }

  if (err.name === 'SequelizeUniqueConstraintError') {
    req.flash('error_msg', 'Este registro já existe.');
    return res.redirect('back');
  }

  // Default error
  res.status(500).render('error', {
    layout: false,
    title: 'Erro Interno',
    message: 'Ocorreu um erro interno no servidor.',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).render('error', {
    layout: false,
    title: 'Página Não Encontrada',
    message: 'A página que você está procurando não foi encontrada.',
    error: {}
  });
});

// Database connection and server start
async function startServer() {
  try {
    // Test database connection
    await sequelize.authenticate();
    console.log('Conexão com banco de dados estabelecida com sucesso.');

    // Sync database models
    await sequelize.sync({ alter: true });
    console.log('Modelos sincronizados com o banco de dados.');

    // Start server
    app.listen(PORT, () => {
      console.log(`Servidor rodando na porta ${PORT}`);
      console.log(`Ambiente: ${process.env.NODE_ENV || 'development'}`);
      console.log(`Acesse: http://localhost:${PORT}`);
    });

  } catch (error) {
    console.error('Erro ao iniciar o servidor:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM recebido, encerrando servidor...');
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT recebido, encerrando servidor...');
  process.exit(0);
});

// Start the server if this file is run directly
if (require.main === module) {
  startServer();
}

module.exports = app;

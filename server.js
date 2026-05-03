const express = require('express');
const exphbs = require('express-handlebars');
const path = require('path');
const session = require('express-session');
const SequelizeStore = require('connect-session-sequelize')(session.Store);
const flash = require('connect-flash');
const methodOverride = require('method-override');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const { sequelize } = require('./config/database');
const routes = require('./routes');
const logger = require('./services/logger');

const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const PORT = process.env.PORT || 3000;

// Configuração de segurança
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com', 'https://cdnjs.cloudflare.com', 'https://unpkg.com', 'https://cdn.jsdelivr.net'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com', 'https://cdnjs.cloudflare.com', 'https://unpkg.com'],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", 'https://cdnjs.cloudflare.com', 'https://unpkg.com', 'https://prod.spline.design', 'https://*.spline.design', 'https://cdn.jsdelivr.net', 'https://cdn.tailwindcss.com', 'blob:'],
      imgSrc: ["'self'", 'data:', 'https:', 'http:'],
      connectSrc: ["'self'", 'https://prod.spline.design', 'https://*.spline.design', 'https://*.google-analytics.com'],
      frameSrc: ['https://www.youtube.com', 'https://www.instagram.com', 'https://*.spline.design'],
      workerSrc: ["'self'", 'blob:'],
      childSrc: ["'self'", 'blob:']
    }
  }
}));

app.use(cors());
app.use(compression());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // limite de 100 requisições por IP
  message: 'Muitas requisições deste IP, tente novamente mais tarde.'
});
app.use(limiter);

// Configuração de sessão
const sessionStore = new SequelizeStore({
  db: sequelize,
  checkExpirationInterval: 15 * 60 * 1000,
  expiration: 24 * 60 * 60 * 1000
});

app.use(session({
  secret: process.env.SESSION_SECRET || 'zanoello_3d_secret_key',
  store: sessionStore,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production' && process.env.USE_SECURE_COOKIES === 'true',
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 * 1000 // 24 horas
  }
}));

// Flash messages
app.use(flash());

// Method override para suportar PUT e DELETE em formulários HTML
app.use(methodOverride('_method'));

// Middleware para processar dados
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Configuração do Handlebars
const hbs = exphbs.create({
  extname: '.hbs',
  defaultLayout: 'main',
  layoutsDir: path.join(__dirname, 'views/layouts'),
  partialsDir: path.join(__dirname, 'views/partials'),
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
      const cleaned = phone.replace(/\D/g, '');
      if (cleaned.length === 11) {
        return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
      } else if (cleaned.length === 10) {
        return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`;
      }
      return phone;
    },

    // Status badge
    statusBadge: function (status) {
      const badges = {
        'novo': '<span class="badge bg-primary">Novo</span>',
        'em_andamento': '<span class="badge bg-info">Em Andamento</span>',
        'respondido': '<span class="badge bg-success">Respondido</span>',
        'fechado': '<span class="badge bg-secondary">Fechado</span>',
        'perdido': '<span class="badge bg-danger">Perdido</span>',
        'pending': '<span class="badge bg-warning">Pendente</span>',
        'approved': '<span class="badge bg-success">Aprovado</span>',
        'rejected': '<span class="badge bg-danger">Rejeitado</span>',
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
    eq: (a, b) => a === b,
    ne: (a, b) => a !== b,
    lt: (a, b) => a < b,
    le: (a, b) => a <= b,
    gt: (a, b) => a > b,
    ge: (a, b) => a >= b,

    // Math helpers
    add: (a, b) => (parseFloat(a) || 0) + (parseFloat(b) || 0),
    subtract: (a, b) => (parseFloat(a) || 0) - (parseFloat(b) || 0),
    multiply: (a, b) => (parseFloat(a) || 0) * (parseFloat(b) || 0),
    divide: (a, b) => {
      const divisor = parseFloat(b) || 0;
      return divisor === 0 ? 0 : (parseFloat(a) || 0) / divisor;
    },

    // Array helpers
    length: (array) => array ? array.length : 0,

    // String helpers
    firstLetter: (str) => {
      if (!str || typeof str !== 'string') {return '';}
      return str.charAt(0).toUpperCase();
    },

    // Conditional helpers
    ifCond: function (v1, operator, v2, options) {
      switch (operator) {
        case '==': return (v1 == v2) ? options.fn(this) : options.inverse(this);
        case '===': return (v1 === v2) ? options.fn(this) : options.inverse(this);
        case '!=': return (v1 != v2) ? options.fn(this) : options.inverse(this);
        case '!==': return (v1 !== v2) ? options.fn(this) : options.inverse(this);
        case '<': return (v1 < v2) ? options.fn(this) : options.inverse(this);
        case '<=': return (v1 <= v2) ? options.fn(this) : options.inverse(this);
        case '>': return (v1 > v2) ? options.fn(this) : options.inverse(this);
        case '>=': return (v1 >= v2) ? options.fn(this) : options.inverse(this);
        case '&&': return (v1 && v2) ? options.fn(this) : options.inverse(this);
        case '||': return (v1 || v2) ? options.fn(this) : options.inverse(this);
        default: return options.inverse(this);
      }
    },

    // First letter of a string (for avatars)
    firstLetter: function (str) {
      if (!str) return 'U';
      return str.charAt(0).toUpperCase();
    },

    // Date formatting helper
    dateFormat: function (date, format) {
      const moment = require('moment');
      if (!date) return '-';
      return moment(date).format(format);
    },

    // Current date helper
    now: function () {
      return new Date();
    },

    // Or helper
    or: function (v1, v2) {
      return v1 || v2;
    },

    // Check if date is in the past
    isPast: function (date) {
      if (!date) return false;
      return new Date(date) < new Date();
    },

    // Build query string from object (excluding page)
    buildQueryString: function (options) {
      const query = options.data.root.query || {};
      const params = new URLSearchParams();
      for (const [key, value] of Object.entries(query)) {
        if (key !== 'page' && value) {
          params.append(key, value);
        }
      }
      return params.toString();
    }
  }
});

app.engine('.hbs', hbs.engine);
app.set('view engine', '.hbs');
app.set('views', path.join(__dirname, 'views'));

// Servir arquivos estáticos
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// Global variables middleware
app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  res.locals.user = req.session.user || null;
  res.locals.isAdmin = req.session.user && req.session.user.role === 'admin';
  res.locals.query = req.query;
  next();
});

// Rotas
app.use('/', routes);

// Rota de teste
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Tratamento de erros 404
app.use((req, res) => {
  res.status(404).render('error/404', { title: 'Página não encontrada', layout: false });
});

// Tratamento de erros gerais
app.use((err, req, res, _next) => {
  const isApi = req.path.startsWith('/api/');
  const isProduction = process.env.NODE_ENV === 'production';

  // Log error
  if (!isProduction || isApi) {
    logger.error(`[Error] ${req.method} ${req.path}:`, err.message);
    if (!isProduction) {logger.error(err.stack);}
  }

  // Handle Sequelize validation errors
  if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
    const messages = err.errors ? err.errors.map(e => e.message) : [err.message];
    const errorMessage = messages.join(', ');
    
    if (isApi || req.xhr) {
      return res.status(400).json({ error: errorMessage });
    }
    
    req.flash('error_msg', errorMessage);
    return res.redirect('back');
  }

  // API Error Response
  if (isApi || req.xhr) {
    return res.status(err.status || 500).json({
      error: isProduction ? 'Erro interno do servidor' : err.message
    });
  }

  // HTML Error Response
  res.status(err.status || 500).render('error/500', {
    title: 'Erro interno do servidor',
    layout: false,
    error: isProduction ? {} : err
  });
});

// Iniciar servidor
if (require.main === module) {
// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  socket.on('join_chat', (room) => {
    socket.join(room);
    console.log(`User joined room: ${room}`);
  });

  socket.on('send_message', (data) => {
    // In a real app, we would save to DB here
    io.emit('receive_message', {
      user: data.user,
      text: data.text,
      timestamp: new Date()
    });
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

// Inicialização do servidor
const startServer = async () => {
  try {
    await sequelize.authenticate();
    const isConnected = true;
    if (isConnected) {
      await sequelize.sync({ alter: false });
      
      server.listen(PORT, () => {
        console.log(`🚀 Malha3D Admin rodando em http://localhost:${PORT}`);
        console.log(`📡 WebSocket ativo para Chat Interno`);
      });
    } else {
      console.error('Falha ao iniciar o servidor: Erro na conexão com o banco de dados.');
      process.exit(1);
    }
  } catch (error) {
    console.error('Erro crítico ao iniciar o servidor:', error);
    process.exit(1);
  }
};

  startServer();
}

module.exports = app;

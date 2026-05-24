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
const moment = require('moment');
moment.locale('pt-br');

const { sequelize } = require('./config/database');
const routes = require('./routes');
const logger = require('./services/logger');

const app = express();
app.set('trust proxy', 1);
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
      scriptSrcAttr: ["'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'https:', 'http:', 'https://picsum.photos', 'https://fastly.picsum.photos', 'https://*.googleusercontent.com', 'https://*.supabase.co'],
      connectSrc: ["'self'", 'https://prod.spline.design', 'https://*.spline.design', 'https://*.google-analytics.com', 'https://*.supabase.co', 'wss://*.supabase.co'],
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
  max: 1000, // aumentado de 100 para 1000 para evitar bloqueios em desenvolvimento
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
    // === DATE & TIME HELPERS ===
    formatDate: (date, format) => {
      if (!date) return '';
      const m = moment(date);
      if (format === 'short') return m.format('DD/MM/YYYY');
      if (format === 'long') return m.format('DD/MM/YYYY HH:mm');
      if (format === 'time') return m.format('HH:mm');
      if (typeof format === 'string') return m.format(format);
      return m.format('DD/MM/YYYY');
    },
    dateFormat: (date, format) => {
      if (!date) return '';
      return moment(date).format(typeof format === 'string' ? format : 'DD/MM/YYYY');
    },
    formatDateShort: (date) => {
      if (!date) return '';
      return moment(date).format('DD/MM');
    },
    timeAgo: (date) => {
      if (!date) return '';
      return moment(date).fromNow();
    },
    isPast: (date) => {
      if (!date) return false;
      return new Date(date) < new Date();
    },
    date: (d, format) => {
      if (!d) return new Date();
      const dateObj = new Date(d);
      if (typeof format === 'string') return moment(dateObj).format(format);
      return dateObj;
    },
    now: () => new Date(),

    // === STRING & UI HELPERS ===
    firstLetter: (str) => {
      if (!str || typeof str !== 'string') return 'U';
      return str.charAt(0).toUpperCase();
    },
    getFirstLetters: (str) => {
      if (!str) return 'U';
      return str.split(' ').filter(n => n).map(n => n[0]).join('').substring(0, 2).toUpperCase();
    },
    truncate: (str, len) => {
      if (!str) return '';
      const length = parseInt(len) || 50;
      return str.length > length ? str.substring(0, length) + '...' : str;
    },
    substring: (str, start, end) => {
      if (typeof str !== 'string') return '';
      return str.substring(start, end);
    },
    split: (str, separator = ',') => {
      if (!str) return [];
      return str.split(separator);
    },
    json: (obj) => {
      return JSON.stringify(obj);
    },
    statusBadge: (status) => {
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
    ratingStars: (rating) => {
      if (!rating) return '';
      let stars = '';
      for (let i = 1; i <= 5; i++) {
        stars += `<i class="${i <= rating ? 'fas' : 'far'} fa-star ${i <= rating ? 'text-warning' : 'text-muted'}"></i>`;
      }
      return stars;
    },

    // === FINANCIAL & NUMBER HELPERS ===
    formatCurrency: (value) => {
      if (value === null || value === undefined) return 'R$ 0,00';
      const num = parseFloat(value);
      if (isNaN(num)) return 'R$ 0,00';
      return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(num);
    },
    formatMoney: (value) => {
      if (value === null || value === undefined) return '0,00';
      const num = parseFloat(value);
      if (isNaN(num)) return '0,00';
      return new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(num);
    },
    numberFormat: (number, decimals = 2, decPoint = ',', thousandsSep = '.') => {
      const num = parseFloat(number);
      if (isNaN(num)) return '0';
      const n = num.toFixed(decimals);
      const parts = n.split('.');
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, thousandsSep);
      return parts.join(decPoint);
    },
    percent: (val, total) => {
      if (!total || total === 0) return 0;
      return Math.round((val / total) * 100);
    },
    calculatePercentage: (val, total) => {
      if (!total || total === 0) return 0;
      return Math.round((val / total) * 100);
    },

    // === LOGIC & COMPARISON HELPERS ===
    eq: (a, b) => a === b,
    ne: (a, b) => a !== b,
    lt: (a, b) => a < b,
    le: (a, b) => a <= b,
    gt: (a, b) => a > b,
    ge: (a, b) => a >= b,
    and: (...args) => args.slice(0, -1).every(Boolean),
    or: (...args) => args.slice(0, -1).some(Boolean),
    ifCond: function (v1, operator, v2, options) {
      const conditions = {
        '==': v1 == v2, '===': v1 === v2, '!=': v1 != v2, '!==': v1 !== v2,
        '<': v1 < v2, '<=': v1 <= v2, '>': v1 > v2, '>=': v1 >= v2,
        '&&': v1 && v2, '||': v1 || v2
      };
      return conditions[operator] ? options.fn(this) : options.inverse(this);
    },

    // === MATH HELPERS ===
    add: (a, b) => (parseFloat(a) || 0) + (parseFloat(b) || 0),
    subtract: (a, b) => {
      const valA = (a instanceof Date) ? a.getTime() : (parseFloat(a) || 0);
      const valB = (b instanceof Date) ? b.getTime() : (parseFloat(b) || 0);
      return valA - valB;
    },
    multiply: (a, b) => (parseFloat(a) || 0) * (parseFloat(b) || 0),
    divide: (a, b) => {
      const divisor = parseFloat(b) || 0;
      return divisor === 0 ? 0 : (parseFloat(a) || 0) / divisor;
    },
    round: (val) => Math.round(parseFloat(val) || 0),

    // === UTILITY & ARRAY HELPERS ===
    array: (...args) => args.slice(0, -1),
    json: (obj) => JSON.stringify(obj),
    length: (arr) => (arr && arr.length) ? arr.length : 0,
    list: (...args) => args.slice(0, -1),
    limit: (arr, limit) => (Array.isArray(arr) ? arr.slice(0, limit) : []),
    times: (n, block) => {
      let accum = '';
      for (let i = 1; i <= n; ++i) accum += block.fn(i);
      return accum;
    },
    range: (start, end) => {
      const res = [];
      for (let i = start; i <= end; i++) res.push(i);
      return res;
    },
    random: (min, max) => Math.floor(Math.random() * (max - min + 1)) + min,
    select_random: (...args) => {
      const items = args.slice(0, -1);
      return items[Math.floor(Math.random() * items.length)];
    },
    buildQueryString: function (options) {
      const query = options.data.root.query || {};
      const params = new URLSearchParams();
      for (const [key, value] of Object.entries(query)) {
        if (key !== 'page' && value) params.append(key, value);
      }
      return params.toString();
    },
    formatPhone: (phone) => {
      if (!phone) return '';
      const cleaned = phone.replace(/\D/g, '');
      if (cleaned.length === 11) return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
      if (cleaned.length === 10) return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`;
      return phone;
    },
    formatWhatsappLink: (phone, name, context = 'default') => {
      if (!phone) return '#';
      const cleanPhone = phone.replace(/\D/g, '');
      const messages = {
        'lead': `Olá ${name}! Recebemos seu interesse aqui na Malha 3D. 🚀 Vamos transformar essa visão em realidade?`,
        'review': `Oi ${name}! Boas notícias: os renders já estão no forno e prontos para sua revisão. 📸 Confira no seu painel!`,
        'financial': `Olá ${name}! Notamos uma pendência financeira no sistema. Podemos ajudar com alguma dúvida sobre o pagamento? 💳`,
        'default': `Olá ${name}! Equipe Malha 3D falando. ⚡`
      };
      const message = messages[context] || messages.default;
      return `https://wa.me/55${cleanPhone}?text=${encodeURIComponent(message)}`;
    }
  }
});

app.engine('.hbs', hbs.engine);
app.set('view engine', '.hbs');
app.set('views', path.join(__dirname, 'views'));

// Servir arquivos estáticos
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));
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
    if (!isProduction) { logger.error(err.stack); }
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
  const logMessage = `[${new Date().toISOString()}] ${err.stack}\n`;
  require('fs').appendFileSync(require('path').join(__dirname, 'server_errors.log'), logMessage);
  
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
        // Sync schema to apply ProjectLog and new columns
        // await sequelize.sync({ alter: true });

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

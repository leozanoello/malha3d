/**
 * Configuração global para testes Jest
 * Este arquivo é executado antes de cada suite de testes
 */

// Configuração do ambiente de teste
process.env.NODE_ENV = 'test';
process.env.SESSION_SECRET = 'test-secret-key-12345';
process.env.JWT_SECRET = 'test-jwt-secret';
// Forçar SQLite em modo teste (sem SUPABASE_DB_URL)
delete process.env.SUPABASE_DB_URL;
delete process.env.DATABASE_URL;

const { sequelize } = require('../config/database');

// Sincronizar banco de dados antes de todos os testes
beforeAll(async () => {
  try {
    await sequelize.sync({ force: true });
  } catch (e) {
    console.error('DB sync error:', e.message);
  }
}, 30000);

// Timeout para testes
jest.setTimeout(10000);

// Mock de funções globais
global.console = {
  ...console,
  // Silenciar logs durante testes, mas manter erros
  log: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  // Manter erros visíveis
  error: console.error
};

// Mock de funções do navegador (para testes de frontend)
global.window = {
  location: {
    href: 'http://localhost:3000',
    origin: 'http://localhost:3000'
  },
  localStorage: {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn()
  },
  sessionStorage: {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn()
  },
  alert: jest.fn(),
  confirm: jest.fn(),
  prompt: jest.fn()
};

// Mock de document
global.document = {
  getElementById: jest.fn(),
  querySelector: jest.fn(),
  querySelectorAll: jest.fn(),
  createElement: jest.fn(() => ({
    classList: {
      add: jest.fn(),
      remove: jest.fn(),
      contains: jest.fn()
    },
    style: {},
    addEventListener: jest.fn(),
    removeEventListener: jest.fn()
  })),
  body: {
    appendChild: jest.fn(),
    removeChild: jest.fn()
  }
};

// Mock de fetch
global.fetch = jest.fn();

// Mock de jQuery
global.$ = jest.fn(() => ({
  ready: jest.fn(),
  on: jest.fn(),
  off: jest.fn(),
  click: jest.fn(),
  submit: jest.fn(),
  val: jest.fn(),
  text: jest.fn(),
  html: jest.fn(),
  addClass: jest.fn(),
  removeClass: jest.fn(),
  toggleClass: jest.fn(),
  show: jest.fn(),
  hide: jest.fn(),
  fadeIn: jest.fn(),
  fadeOut: jest.fn(),
  ajax: jest.fn()
}));

// Mock de Bootstrap
global.bootstrap = {
  Modal: jest.fn(),
  Alert: jest.fn(),
  Tooltip: jest.fn(),
  Popover: jest.fn()
};

// Mock de Chart.js
global.Chart = jest.fn();

// Mock de SweetAlert2
global.Swal = {
  fire: jest.fn(),
  mixin: jest.fn()
};

// Mock de Toastr
global.toastr = {
  success: jest.fn(),
  error: jest.fn(),
  warning: jest.fn(),
  info: jest.fn()
};

// Mock de AOS
global.AOS = {
  init: jest.fn(),
  refresh: jest.fn()
};

// Helpers de teste
global.testHelpers = {
  // Criar mock de requisição Express
  createMockRequest: (overrides = {}) => ({
    body: {},
    params: {},
    query: {},
    headers: {},
    user: null,
    session: {},
    flash: jest.fn(),
    file: null,
    files: null,
    ...overrides
  }),

  // Criar mock de resposta Express
  createMockResponse: () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    res.send = jest.fn().mockReturnValue(res);
    res.render = jest.fn().mockReturnValue(res);
    res.redirect = jest.fn().mockReturnValue(res);
    res.cookie = jest.fn().mockReturnValue(res);
    res.clearCookie = jest.fn().mockReturnValue(res);
    res.set = jest.fn().mockReturnValue(res);
    res.get = jest.fn().mockReturnValue(res);
    return res;
  },

  // Criar mock de próximo middleware
  createMockNext: () => jest.fn(),

  // Limpar todos os mocks
  clearAllMocks: () => {
    jest.clearAllMocks();
    jest.resetAllMocks();
  },

  // Mock de data/hora consistente
  mockDate: (date = '2024-01-01T00:00:00.000Z') => {
    const mockDate = new Date(date);
    jest.spyOn(global, 'Date').mockImplementation(() => mockDate);
  },

  // Restaurar Date original
  restoreDate: () => {
    if (global.Date.mockRestore) {
      global.Date.mockRestore();
    }
  }
};

// Limpar mocks após cada teste
afterEach(() => {
  jest.clearAllMocks();
});

// Limpar todos os mocks após cada suite
afterAll(() => {
  jest.restoreAllMocks();
});

// Configuração de segurança para testes
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

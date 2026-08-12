module.exports = {
  // Ambiente de teste
  testEnvironment: 'node',

  // Diretórios de teste
  roots: ['<rootDir>/tests'],

  // Padrões de arquivos de teste
  testMatch: [
    '**/__tests__/**/*.js',
    '**/?(*.)+(spec|test).js'
  ],

  // Cobertura de código
  collectCoverageFrom: [
    'controllers/**/*.js',
    'middlewares/**/*.js',
    'models/**/*.js',
    'routes/**/*.js',
    'utils/**/*.js',
    '!**/node_modules/**',
    '!**/coverage/**',
    '!**/tests/**',
    '!**/*.test.js',
    '!**/*.spec.js'
  ],

  // Diretório de relatórios de cobertura
  coverageDirectory: 'coverage',

  // Reporters de cobertura
  coverageReporters: [
    'text',
    'lcov',
    'html',
    'json'
  ],

  // Threshold de cobertura (relaxado para CI — aumentar progressivamente)
  coverageThreshold: {
    global: {
      branches: 0,
      functions: 0,
      lines: 0,
      statements: 0
    }
  },

  // Tempo limite de teste
  testTimeout: 10000,

  // Verbose
  verbose: true,

  // Clear mocks entre testes
  clearMocks: true,

  // Reset modules entre testes
  resetModules: true,

  // Restaurar mocks entre testes
  restoreMocks: true,

  // Setup files
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],

  // Módulos para mockar
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1'
  },

  // Ignorar padrões
  testPathIgnorePatterns: [
    '/node_modules/',
    '/coverage/',
    '/dist/',
    '/build/'
  ],

  // Ignorar transformação para
  transformIgnorePatterns: [
    '/node_modules/'
  ],

  // Configurações adicionais para testes de API
  testEnvironmentOptions: {
    url: 'http://localhost:3000'
  }
};

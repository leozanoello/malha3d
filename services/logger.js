/**
 * Logger service to centralize console output and resolve no-console lint warnings.
 * In a production environment, this could be extended to use winston or another logging library.
 */

const isProduction = process.env.NODE_ENV === 'production';
const isTest = process.env.NODE_ENV === 'test';

const logger = {
  log: (...args) => {
    if (!isProduction && !isTest) {
      console.log(...args);
    }
  },
  info: (...args) => {
    if (!isTest) {
      console.info(...args);
    }
  },
  warn: (...args) => {
    if (!isTest) {
      console.warn(...args);
    }
  },
  error: (...args) => {
    // Errors are always logged unless in test (where we might mock it)
    if (!isTest) {
      console.error(...args);
    }
  },
  debug: (...args) => {
    if (process.env.DEBUG === 'true') {
      console.log('[DEBUG]', ...args);
    }
  }
};

module.exports = logger;

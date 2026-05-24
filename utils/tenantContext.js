const { AsyncLocalStorage } = require('async_hooks');
const tenantStorage = new AsyncLocalStorage();

function getTenantId() {
  const store = tenantStorage.getStore();
  return store ? store.tenantId : null;
}

function runWithTenant(tenantId, fn) {
  return tenantStorage.run({ tenantId }, fn);
}

function injectTenantFilter(options, tenantId) {
  if (!options) return;
  
  const { Op } = require('sequelize');
  
  if (options.model && options.model.$isIsolated) {
    if (!options.where) {
      options.where = {};
    }
    
    // Support object-based where clauses
    if (typeof options.where === 'object' && !Array.isArray(options.where) && !(options.where instanceof Date)) {
      // Overwrite/ensure tenant isolation
      options.where.userId = tenantId;
    } else {
      options.where = {
        [Op.and]: [
          options.where,
          { userId: tenantId }
        ]
      };
    }
  }
  
  // Recursively apply to includes
  if (options.include && Array.isArray(options.include)) {
    options.include.forEach((inc, index) => {
      if (inc && inc.prototype && inc.prototype instanceof require('sequelize').Model) {
        // Shorthand: normalize to object
        const normalized = { model: inc };
        injectTenantFilter(normalized, tenantId);
        options.include[index] = normalized;
      } else if (inc && inc.model) {
        injectTenantFilter(inc, tenantId);
      }
    });
  }
}

/**
 * Registra os hooks de isolamento no Sequelize
 */
function registerTenantHooks(sequelize) {
  const { Op } = require('sequelize');
  
  Object.values(sequelize.models).forEach(model => {
    if (model.$isIsolated) {
      // Registrar hook de busca
      model.addHook('beforeFind', (options) => {
        const tenantId = getTenantId();
        if (tenantId) {
          if (!options.model) {
            options.model = model;
          }
          injectTenantFilter(options, tenantId);
        }
      });

      // Registrar hook de criação individual
      model.addHook('beforeCreate', (instance, options) => {
        const tenantId = getTenantId();
        if (tenantId) {
          instance.userId = tenantId;
        }
      });

      // Registrar hook de criação em lote
      model.addHook('beforeBulkCreate', (instances, options) => {
        const tenantId = getTenantId();
        if (tenantId) {
          instances.forEach(instance => {
            instance.userId = tenantId;
          });
        }
      });
    }
  });
}

module.exports = {
  tenantStorage,
  getTenantId,
  runWithTenant,
  registerTenantHooks
};

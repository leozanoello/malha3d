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
  if (!options) {return;}

  const { Op } = require('sequelize');

  if (options.model && options.model.$isIsolated) {
    if (!options.where) {
      options.where = {};
    }

    const tenantCondition = {
      [Op.or]: [
        { userId: tenantId },
        { userId: null }
      ]
    };

    if (typeof options.where === 'object' && !Array.isArray(options.where) && !(options.where instanceof Date)) {
      if (Object.keys(options.where).length === 0) {
        options.where = tenantCondition;
      } else {
        const existingWhere = { ...options.where };
        delete existingWhere.userId;
        options.where = {
          [Op.and]: [
            existingWhere,
            tenantCondition
          ]
        };
      }
    } else {
      options.where = {
        [Op.and]: [
          options.where,
          tenantCondition
        ]
      };
    }
  }

  // Recursively apply to includes
  if (options.include && Array.isArray(options.include)) {
    options.include.forEach((inc, index) => {
      if (inc && inc.prototype && inc.prototype instanceof require('sequelize').Model) {
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
      model.addHook('beforeCreate', (instance, _options) => {
        const tenantId = getTenantId();
        if (tenantId) {
          instance.userId = tenantId;
        }
      });

      // Registrar hook de criação em lote
      model.addHook('beforeBulkCreate', (instances, _options) => {
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

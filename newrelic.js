/**
 * New Relic agent configuration.
 *
 * See lib/config/default.js in the agent distribution for a more complete
 * description of configuration variables and their potential values.
 */
exports.config = {
  /**
   * Array of application names.
   * @env NEW_RELIC_APP_NAME
   */
  app_name: ['Zanoello 3D Landing Page'],

  /**
   * Your New Relic license key.
   * @env NEW_RELIC_LICENSE_KEY
   */
  license_key: process.env.NEW_RELIC_LICENSE_KEY || '',

  /**
   * This controls whether the agent is allowed to send data to New Relic.
   * @env NEW_RELIC_ENABLED
   */
  agent_enabled: process.env.NODE_ENV === 'production',

  /**
   * Whether to capture parameters in the request URL.
   * @env NEW_RELIC_CAPTURE_PARAMS
   */
  capture_params: {
    enabled: true,
    exclude: ['password', 'token', 'secret', 'api_key', 'authorization']
  },

  /**
   * Whether to ignore specific status codes.
   */
  error_collector: {
    enabled: true,
    ignore_status_codes: [404, 422],
    expected_status_codes: [401]
  },

  /**
   * Whether to enable transaction tracing.
   */
  transaction_tracer: {
    enabled: true,
    transaction_threshold: 'apdex_f',
    top_n: 20,
    record_sql: 'obfuscated',
    explain_threshold: 500,
    enabled_instrumentations: ['express', 'mysql', 'redis']
  },

  /**
   * Whether to enable slow SQL sampling.
   */
  slow_sql: {
    enabled: true,
    max_samples: 10,
    threshold: '500ms'
  },

  /**
   * Database query collection settings.
   */
  datastore_tracer: {
    instance_reporting: {
      enabled: true
    },
    database_name_reporting: {
      enabled: true
    },
    collect_backtrace: true,
    explain: {
      enabled: true,
      threshold: '500ms'
    }
  },

  /**
   * Cross application tracing settings.
   */
  cross_application_tracer: {
    enabled: true
  },

  /**
   * Distributed tracing settings.
   */
  distributed_tracing: {
    enabled: true
  },

  /**
   * Span event settings.
   */
  span_events: {
    enabled: true
  },

  /**
   * Infinite tracing settings.
   */
  infinite_tracing: {
    trace_observer: {
      host: '',
      port: 443
    }
  },

  /**
   * Logging configuration.
   */
  logging: {
    enabled: true,
    level: 'info',
    filepath: '/var/log/newrelic/agent.log',
    max_files: 5,
    max_log_size: 10 * 1024 * 1024 // 10MB
  },

  /**
   * Audit logging settings.
   */
  audit_log: {
    enabled: false,
    endpoints: [],
    ignore_endpoints: []
  },

  /**
   * Custom attributes to add to all data.
   */
  custom_attributes: {
    environment: process.env.NODE_ENV || 'development',
    application: 'zanoello3d-landing',
    version: process.env.APP_VERSION || '1.0.0'
  },

  /**
   * Rules for naming transactions.
   */
  rules: {
    name: [
      {
        pattern: '^/api/budgets/\\d+$',
        name: '/api/budgets/:id'
      },
      {
        pattern: '^/api/users/\\d+$',
        name: '/api/users/:id'
      },
      {
        pattern: '^/admin/.*',
        name: '/admin/*'
      }
    ],
    ignore: [
      '^/health$',
      '^/favicon.ico$',
      '^/robots.txt$',
      '^/sitemap.xml$'
    ]
  },

  /**
   * Browser monitoring settings.
   */
  browser_monitoring: {
    enabled: true,
    attributes: {
      enabled: true
    }
  },

  /**
   * Security settings.
   */
  security: {
    certificates: [],
    certificate_locations: [],
    ssl_ca_bundle_path: '',
    ssl_ca_path: '',
    ssl_verify_mode: 'peer',
    ssl_cert_file: '',
    ssl_cert_key_file: '',
    ssl_cert_passphrase: '',
    ssl_cert_bundle_file: ''
  },

  /**
   * Feature flags.
   */
  feature_flag: {
    legacy_support: false,
    serverless_mode: {
      enabled: false
    }
  },

  /**
   * Application logging settings.
   */
  application_logging: {
    enabled: true,
    forwarding: {
      enabled: true,
      max_samples_stored: 10000
    },
    local_decorating: {
      enabled: false
    },
    metrics: {
      enabled: true
    }
  },

  /**
   * Code level metrics settings.
   */
  code_level_metrics: {
    enabled: true
  }
};

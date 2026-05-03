/**
 * Service Monitor and Error Handler
 * Monitors service availability, handles errors, and provides fallback mechanisms
 */

class ServiceMonitor {
  constructor() {
    this.isOnline = navigator.onLine;
    this.serviceStatus = {};
    this.retryAttempts = {};
    this.maxRetries = 3;
    this.retryDelay = 1000; // 1 second
    this.monitoringInterval = null;
    this.errorLog = [];
    this.performanceMetrics = {};

    this.init();
  }

  init() {
    this.setupEventListeners();
    this.startMonitoring();
    this.log('Service Monitor initialized');
  }

  setupEventListeners() {
    // Network status changes
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.log('Network connection restored');
      this.handleConnectionRestored();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.log('Network connection lost');
      this.handleConnectionLost();
    });

    // Global error handling
    window.addEventListener('error', (event) => {
      this.handleError('JavaScript Error', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error
      });
    });

    // Unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.handleError('Unhandled Promise Rejection', {
        reason: event.reason
      });
    });

    // Resource loading errors
    document.addEventListener('error', (event) => {
      if (event.target.tagName === 'IMG' || event.target.tagName === 'SCRIPT' || event.target.tagName === 'LINK') {
        this.handleError('Resource Load Error', {
          src: event.target.src || event.target.href,
          tagName: event.target.tagName
        });
      }
    }, true);
  }

  startMonitoring() {
    // Check service availability every 30 seconds
    this.monitoringInterval = setInterval(() => {
      this.checkServiceHealth();
    }, 30000);

    // Initial health check
    this.checkServiceHealth();
  }

  stopMonitoring() {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
  }

  async checkServiceHealth() {
    const services = [
      { name: 'api', url: '/api/health' },
      { name: 'assets', url: '/public/css/main.css' },
      { name: 'scripts', url: '/public/js/main.js' }
    ];

    for (const service of services) {
      try {
        const startTime = performance.now();
        const response = await this.fetchWithTimeout(service.url, { timeout: 5000 });
        const endTime = performance.now();

        this.serviceStatus[service.name] = {
          status: response.ok ? 'healthy' : 'unhealthy',
          statusCode: response.status,
          responseTime: Math.round(endTime - startTime),
          lastChecked: new Date().toISOString()
        };

        this.log(`Service ${service.name} is ${this.serviceStatus[service.name].status} (${response.status})`);

      } catch (error) {
        this.serviceStatus[service.name] = {
          status: 'error',
          error: error.message,
          lastChecked: new Date().toISOString()
        };

        this.log(`Service ${service.name} error: ${error.message}`);
      }
    }

    this.updateUI();
  }

  async fetchWithTimeout(url, options = {}) {
    const { timeout = 5000, ...fetchOptions } = options;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        ...fetchOptions,
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw new Error('Request timeout');
      }
      throw error;
    }
  }

  handleError(type, details) {
    const error = {
      type,
      details,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    this.errorLog.push(error);

    // Keep only last 50 errors
    if (this.errorLog.length > 50) {
      this.errorLog = this.errorLog.slice(-50);
    }

    this.log(`Error: ${type}`, details);
    this.showErrorNotification(type, details);

    // Send error to monitoring service if available
    this.reportError(error);
  }

  showErrorNotification(type, details) {
    const notification = document.createElement('div');
    notification.className = 'service-error-notification';
    notification.innerHTML = `
            <div class="error-content">
                <i class="fas fa-exclamation-triangle"></i>
                <span class="error-message">${this.getErrorMessage(type, details)}</span>
                <button class="close-btn" onclick="this.parentElement.parentElement.remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;

    document.body.appendChild(notification);

    // Auto-remove after 5 seconds
    setTimeout(() => {
      if (notification.parentElement) {
        notification.remove();
      }
    }, 5000);
  }

  getErrorMessage(type, details) {
    switch (type) {
      case 'JavaScript Error':
        return `Erro na aplicação: ${details.message}`;
      case 'Unhandled Promise Rejection':
        return 'Erro de processamento detectado';
      case 'Resource Load Error':
        return `Falha ao carregar recurso: ${details.src}`;
      case 'Service Unavailable':
        return 'Serviço temporariamente indisponível';
      default:
        return 'Erro desconhecido detectado';
    }
  }

  async reportError(error) {
    try {
      // Try to send error to monitoring endpoint
      await this.fetchWithTimeout('/api/errors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(error),
        timeout: 3000
      });
    } catch (reportError) {
      // Silently fail - we're already handling an error
      this.log('Failed to report error to monitoring service', reportError);
    }
  }

  handleConnectionLost() {
    this.showConnectionStatus('offline');
    this.enableOfflineMode();
  }

  handleConnectionRestored() {
    this.showConnectionStatus('online');
    this.disableOfflineMode();
    this.retryFailedRequests();
  }

  showConnectionStatus(status) {
    const statusElement = document.getElementById('connectionStatus');
    if (statusElement) {
      statusElement.className = `connection-status ${status}`;
      statusElement.innerHTML = `
                <i class="fas fa-${status === 'online' ? 'wifi' : 'wifi-slash'}"></i>
                ${status === 'online' ? 'Conectado' : 'Sem conexão'}
            `;
    }
  }

  enableOfflineMode() {
    document.body.classList.add('offline-mode');
    this.log('Offline mode enabled');
  }

  disableOfflineMode() {
    document.body.classList.remove('offline-mode');
    this.log('Offline mode disabled');
  }

  retryFailedRequests() {
    // Retry any failed API calls
    const failedRequests = this.getFailedRequests();
    failedRequests.forEach(request => {
      this.retryRequest(request);
    });
  }

  getFailedRequests() {
    // Get failed requests from localStorage or session
    const failed = localStorage.getItem('failedRequests');
    return failed ? JSON.parse(failed) : [];
  }

  saveFailedRequest(request) {
    const failedRequests = this.getFailedRequests();
    failedRequests.push({
      ...request,
      timestamp: new Date().toISOString()
    });

    // Keep only last 20 failed requests
    if (failedRequests.length > 20) {
      failedRequests = failedRequests.slice(-20);
    }

    localStorage.setItem('failedRequests', JSON.stringify(failedRequests));
  }

  async retryRequest(request) {
    const attempts = this.retryAttempts[request.id] || 0;

    if (attempts >= this.maxRetries) {
      this.log(`Max retries reached for request ${request.id}`);
      return;
    }

    this.retryAttempts[request.id] = attempts + 1;

    try {
      await this.fetchWithTimeout(request.url, {
        method: request.method,
        headers: request.headers,
        body: request.body,
        timeout: 10000
      });

      this.log(`Request ${request.id} succeeded on retry ${attempts + 1}`);

      // Remove from failed requests
      this.removeFailedRequest(request.id);

    } catch (error) {
      this.log(`Request ${request.id} failed on retry ${attempts + 1}: ${error.message}`);

      if (attempts + 1 < this.maxRetries) {
        setTimeout(() => {
          this.retryRequest(request);
        }, this.retryDelay * (attempts + 1));
      }
    }
  }

  removeFailedRequest(requestId) {
    const failedRequests = this.getFailedRequests();
    const filtered = failedRequests.filter(req => req.id !== requestId);
    localStorage.setItem('failedRequests', JSON.stringify(filtered));
  }

  updateUI() {
    // Update UI elements based on service status
    const statusSummary = this.getStatusSummary();

    // Update status indicator
    const statusIndicator = document.getElementById('serviceStatusIndicator');
    if (statusIndicator) {
      statusIndicator.className = `service-status ${statusSummary.overall}`;
      statusIndicator.title = `Status: ${statusSummary.overall}\n${statusSummary.details}`;
    }

    // Show/hide offline warnings
    const offlineWarning = document.getElementById('offlineWarning');
    if (offlineWarning) {
      offlineWarning.style.display = this.isOnline ? 'none' : 'block';
    }
  }

  getStatusSummary() {
    const services = Object.keys(this.serviceStatus);
    if (services.length === 0) {
      return { overall: 'unknown', details: 'Status não disponível' };
    }

    const healthy = services.filter(s => this.serviceStatus[s].status === 'healthy').length;
    const unhealthy = services.filter(s => this.serviceStatus[s].status === 'unhealthy').length;
    const errors = services.filter(s => this.serviceStatus[s].status === 'error').length;

    let overall;
    let details;

    if (errors > 0) {
      overall = 'error';
      details = `${errors} serviço(s) com erro`;
    } else if (unhealthy > 0) {
      overall = 'warning';
      details = `${unhealthy} serviço(s) não saudável(is)`;
    } else if (healthy === services.length) {
      overall = 'healthy';
      details = 'Todos os serviços operacionais';
    } else {
      overall = 'unknown';
      details = 'Status parcialmente disponível';
    }

    return { overall, details };
  }

  log(message, details = null) {
    const timestamp = new Date().toISOString();
    const logEntry = { timestamp, message, details };

    console.log(`[ServiceMonitor] ${timestamp}: ${message}`, details);

    // Store in localStorage for debugging
    const logs = this.getLogs();
    logs.push(logEntry);

    // Keep only last 100 logs
    if (logs.length > 100) {
      logs = logs.slice(-100);
    }

    localStorage.setItem('serviceMonitorLogs', JSON.stringify(logs));
  }

  getLogs() {
    const logs = localStorage.getItem('serviceMonitorLogs');
    return logs ? JSON.parse(logs) : [];
  }

  getErrorLog() {
    return this.errorLog;
  }

  getServiceStatus() {
    return this.serviceStatus;
  }

  getPerformanceMetrics() {
    return this.performanceMetrics;
  }

  // Public API methods
  async makeRequest(url, options = {}) {
    const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    try {
      const response = await this.fetchWithTimeout(url, {
        ...options,
        timeout: options.timeout || 10000
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return response;

    } catch (error) {
      // Save failed request for retry
      this.saveFailedRequest({
        id: requestId,
        url,
        method: options.method || 'GET',
        headers: options.headers,
        body: options.body
      });

      this.handleError('Service Unavailable', {
        url,
        error: error.message
      });

      throw error;
    }
  }

  // Cleanup
  destroy() {
    this.stopMonitoring();
    this.log('Service Monitor destroyed');
  }
}

// CSS for service monitor UI elements
const serviceMonitorCSS = `
.service-error-notification {
    position: fixed;
    top: 20px;
    right: 20px;
    background: #dc3545;
    color: white;
    padding: 1rem;
    border-radius: 5px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    z-index: 9999;
    max-width: 400px;
    animation: slideInRight 0.3s ease-out;
}

.service-error-notification .error-content {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.service-error-notification .close-btn {
    background: none;
    border: none;
    color: white;
    cursor: pointer;
    margin-left: auto;
    padding: 0.25rem;
}

.service-status {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.25rem 0.5rem;
    border-radius: 3px;
    font-size: 0.8rem;
    font-weight: bold;
}

.service-status.healthy {
    background: #28a745;
    color: white;
}

.service-status.warning {
    background: #ffc107;
    color: #212529;
}

.service-status.error {
    background: #dc3545;
    color: white;
}

.service-status.unknown {
    background: #6c757d;
    color: white;
}

.connection-status {
    position: fixed;
    top: 20px;
    left: 20px;
    padding: 0.5rem 1rem;
    border-radius: 5px;
    font-weight: bold;
    z-index: 9998;
    transition: all 0.3s ease;
}

.connection-status.online {
    background: #28a745;
    color: white;
}

.connection-status.offline {
    background: #dc3545;
    color: white;
}

.offline-mode {
    filter: grayscale(50%);
}

.offline-mode .offline-warning {
    display: block !important;
}

@keyframes slideInRight {
    from {
        transform: translateX(100%);
        opacity: 0;
    }
    to {
        transform: translateX(0);
        opacity: 1;
    }
}
`;

// Inject CSS
if (!document.getElementById('serviceMonitorStyles')) {
  const style = document.createElement('style');
  style.id = 'serviceMonitorStyles';
  style.textContent = serviceMonitorCSS;
  document.head.appendChild(style);
}

// Create global service monitor instance
window.serviceMonitor = new ServiceMonitor();

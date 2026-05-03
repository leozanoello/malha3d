/**
 * Zanoello 3D - Admin Panel JavaScript
 * Professional admin panel functionality
 */

class AdminPanel {
  constructor() {
    this.currentUser = null;
    this.currentSection = 'dashboard';
    this.isAuthenticated = false;
    this.sidebarCollapsed = false;

    this.init();
  }

  init() {
    this.setupEventListeners();
    this.checkAuthentication();
    this.loadDashboardData();
    this.initializeCharts();
  }

  setupEventListeners() {
    // Authentication
    document.getElementById('loginForm')?.addEventListener('submit', (e) => this.handleLogin(e));
    document.getElementById('logoutBtn')?.addEventListener('click', () => this.handleLogout());
    document.getElementById('togglePassword')?.addEventListener('click', () => this.togglePassword());

    // Navigation
    document.querySelectorAll('.sidebar-menu .nav-link').forEach(link => {
      link.addEventListener('click', (e) => this.handleNavigation(e));
    });

    // Sidebar toggle
    document.getElementById('sidebarToggle')?.addEventListener('click', () => this.toggleSidebar());

    // View site button
    document.getElementById('viewSiteBtn')?.addEventListener('click', () => {
      window.open('/', '_blank');
    });

    // Calculator configuration
    document.getElementById('calculatorConfigForm')?.addEventListener('submit', (e) => this.saveCalculatorConfig(e));
    document.getElementById('saveCalculatorBtn')?.addEventListener('click', () => this.saveCalculatorConfig());

    // Gallery management
    document.getElementById('addImageBtn')?.addEventListener('click', () => this.openImageUploadModal());
    document.getElementById('imageUploadForm')?.addEventListener('submit', (e) => this.uploadImages(e));
    document.getElementById('uploadImagesBtn')?.addEventListener('click', () => this.uploadImages());
    document.getElementById('imageEditForm')?.addEventListener('submit', (e) => this.saveImageEdit(e));
    document.getElementById('saveImageBtn')?.addEventListener('click', () => this.saveImageEdit());

    // Image upload area
    const uploadArea = document.getElementById('uploadArea');
    if (uploadArea) {
      uploadArea.addEventListener('click', () => document.getElementById('imageFiles').click());
      uploadArea.addEventListener('dragover', (e) => this.handleDragOver(e));
      uploadArea.addEventListener('drop', (e) => this.handleDrop(e));
    }

    // Image files input
    document.getElementById('imageFiles')?.addEventListener('change', (e) => this.handleFileSelect(e));

    // Settings
    document.getElementById('settingsForm')?.addEventListener('submit', (e) => this.saveSettings(e));
    document.getElementById('saveSettingsBtn')?.addEventListener('click', () => this.saveSettings());
    document.getElementById('backupBtn')?.addEventListener('click', () => this.createBackup());
    document.getElementById('restoreBtn')?.addEventListener('click', () => this.restoreBackup());

    // Calculations history
    document.getElementById('filterCalculationsBtn')?.addEventListener('click', () => this.filterCalculations());
    document.getElementById('exportCalculationsBtn')?.addEventListener('click', () => this.exportCalculations());
    document.getElementById('clearHistoryBtn')?.addEventListener('click', () => this.clearHistory());

    // Search and filters
    document.getElementById('imageSearch')?.addEventListener('input', (e) => this.searchImages(e.target.value));
    document.getElementById('categoryFilter')?.addEventListener('change', (e) => this.filterImagesByCategory(e.target.value));
    document.getElementById('sortBy')?.addEventListener('change', (e) => this.sortImages(e.target.value));

    // Window resize
    window.addEventListener('resize', () => this.handleResize());
  }

  // Authentication Methods
  checkAuthentication() {
    const savedAuth = localStorage.getItem('adminAuth');
    if (savedAuth) {
      try {
        const authData = JSON.parse(savedAuth);
        if (authData.token && authData.expires > Date.now()) {
          this.isAuthenticated = true;
          this.currentUser = authData.user;
          this.showAdminPanel();
        } else {
          this.showLoginModal();
        }
      } catch (error) {
        this.showLoginModal();
      }
    } else {
      this.showLoginModal();
    }
  }

  handleLogin(e) {
    e.preventDefault();

    const username = document.getElementById('adminUsername').value;
    const password = document.getElementById('adminPassword').value;
    const rememberMe = document.getElementById('rememberMe').checked;

    // Simple authentication (in production, this should be server-side)
    if (username === 'admin' && password === 'admin123') {
      const authData = {
        user: { username, role: 'admin' },
        token: this.generateToken(),
        expires: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
      };

      if (rememberMe) {
        localStorage.setItem('adminAuth', JSON.stringify(authData));
      } else {
        sessionStorage.setItem('adminAuth', JSON.stringify(authData));
      }

      this.isAuthenticated = true;
      this.currentUser = authData.user;
      this.showAdminPanel();
      this.showNotification('Login realizado com sucesso!', 'success');
    } else {
      this.showNotification('Usuário ou senha incorretos!', 'error');
    }
  }

  handleLogout() {
    localStorage.removeItem('adminAuth');
    sessionStorage.removeItem('adminAuth');
    this.isAuthenticated = false;
    this.currentUser = null;
    this.showLoginModal();
    this.showNotification('Logout realizado com sucesso!', 'success');
  }

  togglePassword() {
    const passwordInput = document.getElementById('adminPassword');
    const toggleBtn = document.getElementById('togglePassword');

    if (passwordInput.type === 'password') {
      passwordInput.type = 'text';
      toggleBtn.innerHTML = '<i class="fas fa-eye-slash"></i>';
    } else {
      passwordInput.type = 'password';
      toggleBtn.innerHTML = '<i class="fas fa-eye"></i>';
    }
  }

  generateToken() {
    return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
  }

  showLoginModal() {
    document.getElementById('loginModal').classList.add('show');
    document.getElementById('loginModal').style.display = 'block';
    document.getElementById('adminPanel').classList.add('d-none');
  }

  showAdminPanel() {
    document.getElementById('loginModal').classList.remove('show');
    document.getElementById('loginModal').style.display = 'none';
    document.getElementById('adminPanel').classList.remove('d-none');
    this.loadSection('dashboard');
  }

  // Navigation Methods
  handleNavigation(e) {
    e.preventDefault();
    const section = e.target.closest('.nav-link').dataset.section;
    this.loadSection(section);
  }

  loadSection(section) {
    // Update active nav link
    document.querySelectorAll('.sidebar-menu .nav-link').forEach(link => {
      link.classList.remove('active');
    });
    document.querySelector(`[data-section="${section}"]`).classList.add('active');

    // Update section title
    const titles = {
      dashboard: 'Dashboard',
      gallery: 'Gerenciamento de Galeria',
      calculator: 'Configuração da Calculadora',
      calculations: 'Histórico de Cálculos',
      settings: 'Configurações do Sistema'
    };
    document.getElementById('currentSectionTitle').textContent = titles[section];

    // Show/hide sections
    document.querySelectorAll('.admin-section').forEach(sec => {
      sec.classList.remove('active');
    });
    document.getElementById(section).classList.add('active');

    this.currentSection = section;

    // Load section-specific data
    switch (section) {
      case 'dashboard':
        this.loadDashboardData();
        break;
      case 'gallery':
        this.loadGalleryData();
        break;
      case 'calculator':
        this.loadCalculatorConfig();
        break;
      case 'calculations':
        this.loadCalculationsHistory();
        break;
      case 'settings':
        this.loadSettings();
        break;
    }
  }

  toggleSidebar() {
    this.sidebarCollapsed = !this.sidebarCollapsed;
    document.querySelector('.admin-sidebar').classList.toggle('collapsed', this.sidebarCollapsed);
  }

  // Dashboard Methods
  loadDashboardData() {
    // Simulate loading dashboard data
    setTimeout(() => {
      document.getElementById('totalImages').textContent = '156';
      document.getElementById('totalCalculations').textContent = '89';
      document.getElementById('totalViews').textContent = '2,341';
      document.getElementById('totalContacts').textContent = '23';

      this.loadRecentActivities();
    }, 500);
  }

  loadRecentActivities() {
    const activities = [
      {
        icon: 'fas fa-image',
        type: 'success',
        title: 'Nova imagem adicionada',
        description: 'Imagem "Residência Moderna" foi adicionada à galeria',
        time: '5 minutos atrás'
      },
      {
        icon: 'fas fa-calculator',
        type: 'info',
        title: 'Cálculo realizado',
        description: 'Novo cálculo de orçamento foi realizado',
        time: '15 minutos atrás'
      },
      {
        icon: 'fas fa-cog',
        type: 'warning',
        title: 'Configuração alterada',
        description: 'Configurações da calculadora foram atualizadas',
        time: '1 hora atrás'
      }
    ];

    const container = document.getElementById('recentActivities');
    container.innerHTML = activities.map(activity => `
            <div class="activity-item">
                <div class="activity-icon ${activity.type}">
                    <i class="${activity.icon}"></i>
                </div>
                <div class="activity-content">
                    <h6>${activity.title}</h6>
                    <p>${activity.description}</p>
                </div>
                <div class="activity-time">
                    ${activity.time}
                </div>
            </div>
        `).join('');
  }

  initializeCharts() {
    // Access Chart
    const accessCtx = document.getElementById('accessChart');
    if (accessCtx) {
      new Chart(accessCtx, {
        type: 'line',
        data: {
          labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'],
          datasets: [{
            label: 'Acessos',
            data: [120, 190, 300, 500, 200, 300],
            borderColor: '#ff6b35',
            backgroundColor: 'rgba(255, 107, 53, 0.1)',
            tension: 0.4
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              labels: {
                color: '#f8f9fa'
              }
            }
          },
          scales: {
            x: {
              ticks: {
                color: '#6c757d'
              },
              grid: {
                color: 'rgba(255, 107, 53, 0.1)'
              }
            },
            y: {
              ticks: {
                color: '#6c757d'
              },
              grid: {
                color: 'rgba(255, 107, 53, 0.1)'
              }
            }
          }
        }
      });
    }

    // Calculation Chart
    const calcCtx = document.getElementById('calculationChart');
    if (calcCtx) {
      new Chart(calcCtx, {
        type: 'doughnut',
        data: {
          labels: ['Residencial', 'Comercial', 'Industrial'],
          datasets: [{
            data: [45, 35, 20],
            backgroundColor: ['#ff6b35', '#ffd23f', '#28a745']
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              labels: {
                color: '#f8f9fa'
              }
            }
          }
        }
      });
    }
  }

  // Gallery Management Methods
  loadGalleryData() {
    // Simulate loading gallery data
    const images = [
      {
        id: 1,
        title: 'Residência Moderna',
        category: 'residential',
        project: 'Casa das Acácias',
        description: 'Renderização 3D de residência moderna com 300m²',
        featured: true,
        date: '2024-01-15',
        url: '/images/gallery/residencia1.jpg'
      },
      {
        id: 2,
        title: 'Escritório Corporativo',
        category: 'commercial',
        project: 'Torre Business',
        description: 'Visualização de escritório corporativo de alto padrão',
        featured: false,
        date: '2024-01-10',
        url: '/images/gallery/comercial1.jpg'
      }
    ];

    this.renderGalleryImages(images);
  }

  renderGalleryImages(images) {
    const container = document.getElementById('imageGrid');
    container.innerHTML = images.map(image => `
            <div class="image-item">
                <img src="${image.url}" alt="${image.title}">
                ${image.featured ? '<div class="featured-badge"><i class="fas fa-star"></i></div>' : ''}
                <div class="image-info">
                    <h6>${image.title}</h6>
                    <p>${image.description}</p>
                    <small class="text-muted">${image.category} • ${image.date}</small>
                </div>
                <div class="image-actions">
                    <button class="btn btn-sm btn-outline-primary" onclick="adminPanel.editImage(${image.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="adminPanel.deleteImage(${image.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
  }

  openImageUploadModal() {
    const modal = new bootstrap.Modal(document.getElementById('imageUploadModal'));
    modal.show();
  }

  handleDragOver(e) {
    e.preventDefault();
    e.currentTarget.classList.add('dragover');
  }

  handleDrop(e) {
    e.preventDefault();
    e.currentTarget.classList.remove('dragover');

    const files = Array.from(e.dataTransfer.files);
    this.processImageFiles(files);
  }

  handleFileSelect(e) {
    const files = Array.from(e.target.files);
    this.processImageFiles(files);
  }

  processImageFiles(files) {
    const imageFiles = files.filter(file => file.type.startsWith('image/'));

    if (imageFiles.length === 0) {
      this.showNotification('Por favor, selecione apenas arquivos de imagem!', 'error');
      return;
    }

    const previewContainer = document.getElementById('imagePreview');
    previewContainer.innerHTML = '';

    imageFiles.forEach((file, index) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const previewItem = document.createElement('div');
        previewItem.className = 'preview-item';
        previewItem.innerHTML = `
                    <img src="${e.target.result}" alt="Preview ${index + 1}">
                    <button type="button" class="preview-remove" onclick="this.parentElement.remove()">
                        <i class="fas fa-times"></i>
                    </button>
                `;
        previewContainer.appendChild(previewItem);
      };
      reader.readAsDataURL(file);
    });
  }

  uploadImages(e) {
    if (e) {e.preventDefault();}

    const formData = new FormData(document.getElementById('imageUploadForm'));
    const files = document.getElementById('imageFiles').files;

    if (files.length === 0) {
      this.showNotification('Por favor, selecione pelo menos uma imagem!', 'error');
      return;
    }

    // Simulate upload process
    this.showNotification('Upload em progresso...', 'info');

    setTimeout(() => {
      this.showNotification('Imagens enviadas com sucesso!', 'success');
      bootstrap.Modal.getInstance(document.getElementById('imageUploadModal')).hide();
      this.loadGalleryData();
    }, 2000);
  }

  editImage(id) {
    // Simulate loading image data
    const imageData = {
      id: id,
      title: 'Residência Moderna',
      category: 'residential',
      project: 'Casa das Acácias',
      description: 'Renderização 3D de residência moderna com 300m²',
      featured: true
    };

    // Populate edit form
    document.querySelector('[name="edit_title"]').value = imageData.title;
    document.querySelector('[name="edit_category"]').value = imageData.category;
    document.querySelector('[name="edit_project"]').value = imageData.project;
    document.querySelector('[name="edit_description"]').value = imageData.description;
    document.querySelector('[name="edit_featured"]').checked = imageData.featured;

    const modal = new bootstrap.Modal(document.getElementById('imageEditModal'));
    modal.show();
  }

  saveImageEdit(e) {
    if (e) {e.preventDefault();}

    const formData = new FormData(document.getElementById('imageEditForm'));

    // Simulate saving
    this.showNotification('Imagem atualizada com sucesso!', 'success');
    bootstrap.Modal.getInstance(document.getElementById('imageEditModal')).hide();
    this.loadGalleryData();
  }

  deleteImage(id) {
    if (confirm('Tem certeza que deseja excluir esta imagem?')) {
      this.showNotification('Imagem excluída com sucesso!', 'success');
      this.loadGalleryData();
    }
  }

  searchImages(query) {
    // Simulate search functionality
    console.log('Searching images for:', query);
  }

  filterImagesByCategory(category) {
    // Simulate category filtering
    console.log('Filtering images by category:', category);
  }

  sortImages(sortBy) {
    // Simulate sorting
    console.log('Sorting images by:', sortBy);
  }

  // Calculator Configuration Methods
  loadCalculatorConfig() {
    // Load saved configuration or use defaults
    const defaultConfig = {
      step1_a_label: 'Residencial Simples',
      step1_a_multiplier: 1.0,
      step1_a_base_price: 50.00,
      step1_b_label: 'Residencial Médio',
      step1_b_multiplier: 1.5,
      step1_b_base_price: 75.00,
      step1_c_label: 'Residencial Alto Padrão',
      step1_c_multiplier: 2.0,
      step1_c_base_price: 100.00,

      step2_a_label: 'Baixa Complexidade',
      step2_a_multiplier: 1.0,
      step2_b_label: 'Média Complexidade',
      step2_b_multiplier: 1.3,
      step2_c_label: 'Alta Complexidade',
      step2_c_multiplier: 1.6,

      step3_a_label: 'Prazo Normal (30 dias)',
      step3_a_multiplier: 1.0,
      step3_b_label: 'Prazo Rápido (15 dias)',
      step3_b_multiplier: 1.2,
      step3_c_label: 'Prazo Urgente (7 dias)',
      step3_c_multiplier: 1.5,

      base_price_per_sqm: 25.00,
      currency: 'BRL',
      min_area: 50,
      max_area: 1000
    };

    const savedConfig = JSON.parse(localStorage.getItem('calculatorConfig') || '{}');
    const config = { ...defaultConfig, ...savedConfig };

    // Populate form
    Object.keys(config).forEach(key => {
      const input = document.querySelector(`[name="${key}"]`);
      if (input) {
        input.value = config[key];
      }
    });
  }

  saveCalculatorConfig(e) {
    if (e) {e.preventDefault();}

    const formData = new FormData(document.getElementById('calculatorConfigForm'));
    const config = {};

    for (const [key, value] of formData.entries()) {
      config[key] = value;
    }

    // Validate configuration
    if (!this.validateCalculatorConfig(config)) {
      return;
    }

    localStorage.setItem('calculatorConfig', JSON.stringify(config));
    this.showNotification('Configurações salvas com sucesso!', 'success');

    // Update calculator on main site
    if (window.parent && window.parent.calculator3D) {
      window.parent.calculator3D.loadConfiguration();
    }
  }

  validateCalculatorConfig(config) {
    // Validate required fields
    const requiredFields = ['base_price_per_sqm', 'min_area', 'max_area'];
    for (const field of requiredFields) {
      if (!config[field] || parseFloat(config[field]) <= 0) {
        this.showNotification(`Campo obrigatório inválido: ${field}`, 'error');
        return false;
      }
    }

    // Validate area range
    const minArea = parseFloat(config.min_area);
    const maxArea = parseFloat(config.max_area);
    if (minArea >= maxArea) {
      this.showNotification('Área mínima deve ser menor que a área máxima', 'error');
      return false;
    }

    return true;
  }

  // Calculations History Methods
  loadCalculationsHistory() {
    // Simulate loading calculations history
    const calculations = [
      {
        id: 1,
        date: '2024-01-15 14:30',
        client: 'João Silva',
        type: 'Residencial',
        area: 250,
        value: 12500.00,
        details: 'Residencial Médio, Média Complexidade, Prazo Normal'
      },
      {
        id: 2,
        date: '2024-01-14 16:45',
        client: 'Maria Santos',
        type: 'Comercial',
        area: 180,
        value: 10800.00,
        details: 'Comercial, Alta Complexidade, Prazo Rápido'
      }
    ];

    this.renderCalculationsTable(calculations);
  }

  renderCalculationsTable(calculations) {
    const tbody = document.getElementById('calculationsTableBody');
    tbody.innerHTML = calculations.map(calc => `
            <tr>
                <td>${calc.date}</td>
                <td>${calc.client}</td>
                <td>${calc.type}</td>
                <td>${calc.area} m²</td>
                <td>R$ ${calc.value.toFixed(2)}</td>
                <td>
                    <button class="btn btn-sm btn-outline-info" onclick="adminPanel.viewCalculationDetails(${calc.id})">
                        <i class="fas fa-eye"></i>
                    </button>
                </td>
                <td>
                    <button class="btn btn-sm btn-outline-danger" onclick="adminPanel.deleteCalculation(${calc.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
  }

  viewCalculationDetails(id) {
    // Simulate loading calculation details
    const calcDetails = {
      id: id,
      client: 'João Silva',
      email: 'joao@email.com',
      phone: '(11) 99999-9999',
      area: 250,
      step1: 'Residencial Médio',
      step2: 'Média Complexidade',
      step3: 'Prazo Normal',
      totalValue: 12500.00,
      date: '2024-01-15 14:30',
      notes: 'Cliente solicitou orçamento para residência com 250m²'
    };

    alert(`Detalhes do Cálculo #${id}:\n\n` +
              `Cliente: ${calcDetails.client}\n` +
              `E-mail: ${calcDetails.email}\n` +
              `Telefone: ${calcDetails.phone}\n` +
              `Área: ${calcDetails.area}m²\n` +
              `Tipo: ${calcDetails.step1}\n` +
              `Complexidade: ${calcDetails.step2}\n` +
              `Prazo: ${calcDetails.step3}\n` +
              `Valor Total: R$ ${calcDetails.totalValue.toFixed(2)}\n` +
              `Data: ${calcDetails.date}\n` +
              `Observações: ${calcDetails.notes}`);
  }

  deleteCalculation(id) {
    if (confirm('Tem certeza que deseja excluir este cálculo?')) {
      this.showNotification('Cálculo excluído com sucesso!', 'success');
      this.loadCalculationsHistory();
    }
  }

  filterCalculations() {
    const dateFrom = document.getElementById('calculationDateFrom').value;
    const dateTo = document.getElementById('calculationDateTo').value;
    const type = document.getElementById('calculationTypeFilter').value;

    console.log('Filtering calculations:', { dateFrom, dateTo, type });
    this.loadCalculationsHistory();
  }

  exportCalculations() {
    // Simulate export functionality
    const data = [
      ['Data', 'Cliente', 'Tipo', 'Área (m²)', 'Valor'],
      ['2024-01-15', 'João Silva', 'Residencial', '250', 'R$ 12,500.00'],
      ['2024-01-14', 'Maria Santos', 'Comercial', '180', 'R$ 10,800.00']
    ];

    const csvContent = data.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `calculos_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();

    URL.revokeObjectURL(url);
    this.showNotification('Dados exportados com sucesso!', 'success');
  }

  clearHistory() {
    if (confirm('Tem certeza que deseja limpar todo o histórico de cálculos?')) {
      this.showNotification('Histórico limpo com sucesso!', 'success');
      this.loadCalculationsHistory();
    }
  }

  // Settings Methods
  loadSettings() {
    const settings = JSON.parse(localStorage.getItem('adminSettings') || '{}');

    // Populate settings form
    Object.keys(settings).forEach(key => {
      const input = document.querySelector(`[name="${key}"]`);
      if (input) {
        input.value = settings[key];
      }
    });
  }

  saveSettings(e) {
    if (e) {e.preventDefault();}

    const formData = new FormData(document.getElementById('settingsForm'));
    const settings = {};

    for (const [key, value] of formData.entries()) {
      settings[key] = value;
    }

    // Handle password change
    if (settings.new_password) {
      if (settings.new_password !== settings.confirm_password) {
        this.showNotification('As senhas não coincidem!', 'error');
        return;
      }
      // In production, this should be handled server-side
      console.log('Password changed for user:', this.currentUser.username);
    }

    localStorage.setItem('adminSettings', JSON.stringify(settings));
    this.showNotification('Configurações salvas com sucesso!', 'success');
  }

  createBackup() {
    // Simulate backup creation
    const backupData = {
      timestamp: new Date().toISOString(),
      calculatorConfig: JSON.parse(localStorage.getItem('calculatorConfig') || '{}'),
      adminSettings: JSON.parse(localStorage.getItem('adminSettings') || '{}'),
      galleryData: [], // Would include actual gallery data
      calculationsHistory: [] // Would include actual calculations
    };

    const backupJson = JSON.stringify(backupData, null, 2);
    const blob = new Blob([backupJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `backup_zanoello3d_${new Date().toISOString().split('T')[0]}.json`;
    a.click();

    URL.revokeObjectURL(url);
    this.showNotification('Backup criado com sucesso!', 'success');
  }

  restoreBackup() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';

    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const backupData = JSON.parse(event.target.result);

            // Restore data
            if (backupData.calculatorConfig) {
              localStorage.setItem('calculatorConfig', JSON.stringify(backupData.calculatorConfig));
            }
            if (backupData.adminSettings) {
              localStorage.setItem('adminSettings', JSON.stringify(backupData.adminSettings));
            }

            this.showNotification('Backup restaurado com sucesso!', 'success');
            this.loadSettings();
            this.loadCalculatorConfig();
          } catch (error) {
            this.showNotification('Erro ao restaurar backup!', 'error');
          }
        };
        reader.readAsText(file);
      }
    };

    input.click();
  }

  // Utility Methods
  showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `alert alert-${type === 'error' ? 'danger' : type} alert-dismissible fade show`;
    notification.style.position = 'fixed';
    notification.style.top = '20px';
    notification.style.right = '20px';
    notification.style.zIndex = '9999';
    notification.style.minWidth = '300px';
    notification.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;

    document.body.appendChild(notification);

    // Auto-remove after 5 seconds
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 5000);
  }

  handleResize() {
    // Handle responsive behavior
    if (window.innerWidth <= 992) {
      document.querySelector('.admin-sidebar').classList.add('collapsed');
    }
  }
}

// Initialize admin panel when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.adminPanel = new AdminPanel();
});

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AdminPanel;
}

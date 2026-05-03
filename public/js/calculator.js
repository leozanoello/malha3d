/**
 * Zanoello 3D - Interactive Calculator
 * Three-step calculator with mathematical formulas
 */

class Calculator3D {
  constructor() {
    this.currentStep = 1;
    this.maxSteps = 3;
    this.calculations = {
      step1: null,
      step2: null,
      step3: null,
      squareMeters: null,
      total: null
    };

    this.formulas = {
      // Base multipliers for each step
      step1: {
        'A': 1.2, // Basic
        'B': 1.5, // Standard
        'C': 2.0  // Premium
      },
      step2: {
        'A': 1.1, // Simple
        'B': 1.3, // Moderate
        'C': 1.6  // Complex
      },
      step3: {
        'A': 1.0, // 3 days
        'B': 1.2, // 7 days
        'C': 1.4  // 14 days
      },
      // Base price per square meter (R$)
      basePricePerSqm: 45.00
    };

    this.init();
  }

  init() {
    this.bindEvents();
    this.loadCalculatorData();
    this.updateStepDisplay();
    this.setupSquareMetersInput();
  }

  bindEvents() {
    // Step navigation
    document.getElementById('nextStep1')?.addEventListener('click', () => this.nextStep());
    document.getElementById('nextStep2')?.addEventListener('click', () => this.nextStep());
    document.getElementById('prevStep2')?.addEventListener('click', () => this.prevStep());
    document.getElementById('prevStep3')?.addEventListener('click', () => this.prevStep());
    document.getElementById('calculateBtn')?.addEventListener('click', () => this.calculate());

    // Step selection
    document.getElementById('step1Select')?.addEventListener('change', (e) => this.selectStepOption(1, e.target.value));
    document.getElementById('step2Select')?.addEventListener('change', (e) => this.selectStepOption(2, e.target.value));
    document.getElementById('step3Select')?.addEventListener('change', (e) => this.selectStepOption(3, e.target.value));

    // Square meters input
    document.getElementById('squareMeters')?.addEventListener('input', (e) => this.updateSquareMeters(e.target.value));

    // Result actions
    document.getElementById('saveCalculation')?.addEventListener('click', () => this.saveCalculation());
    document.getElementById('newCalculation')?.addEventListener('click', () => this.resetCalculator());
    document.getElementById('contactQuote')?.addEventListener('click', () => this.contactForQuote());
  }

  setupSquareMetersInput() {
    const squareMetersInput = document.getElementById('squareMeters');
    if (squareMetersInput) {
      // Add input validation and formatting
      squareMetersInput.addEventListener('input', (e) => {
        let value = e.target.value.replace(/[^\d.]/g, '');
        if (value && !isNaN(value)) {
          value = Math.max(1, Math.min(10000, parseFloat(value)));
          e.target.value = value;
          this.updateSquareMeters(value);
        } else if (value === '') {
          this.updateSquareMeters(null);
        }
      });

      // Add placeholder with hint
      squareMetersInput.placeholder = 'Ex: 150';

      // Add help text
      const helpText = document.createElement('small');
      helpText.className = 'form-text text-muted';
      helpText.textContent = 'Informe a área total em metros quadrados do projeto';
      squareMetersInput.parentNode.appendChild(helpText);
    }
  }

  selectStepOption(step, option) {
    if (option) {
      this.calculations[`step${step}`] = option;
      this.updateStepDisplay();
      this.validateStep(step);
    }
  }

  updateSquareMeters(value) {
    this.calculations.squareMeters = value ? parseFloat(value) : null;
    this.validateSquareMeters();
  }

  validateStep(step) {
    const select = document.getElementById(`step${step}Select`);
    const nextBtn = document.getElementById(`nextStep${step}`);

    if (select && nextBtn) {
      if (select.value) {
        nextBtn.disabled = false;
        nextBtn.classList.remove('disabled');
      } else {
        nextBtn.disabled = true;
        nextBtn.classList.add('disabled');
      }
    }
  }

  validateSquareMeters() {
    const input = document.getElementById('squareMeters');
    const calculateBtn = document.getElementById('calculateBtn');

    if (input && calculateBtn) {
      if (this.calculations.squareMeters && this.calculations.squareMeters > 0) {
        calculateBtn.disabled = false;
        calculateBtn.classList.remove('disabled');
        input.classList.remove('is-invalid');
      } else {
        calculateBtn.disabled = true;
        calculateBtn.classList.add('disabled');
        input.classList.add('is-invalid');
      }
    }
  }

  validateAllSteps() {
    return this.calculations.step1 &&
               this.calculations.step2 &&
               this.calculations.step3 &&
               this.calculations.squareMeters &&
               this.calculations.squareMeters > 0;
  }

  nextStep() {
    if (this.currentStep < this.maxSteps) {
      if (this.validateCurrentStep()) {
        this.currentStep++;
        this.showStep(this.currentStep);
        this.updateStepDisplay();
      }
    }
  }

  prevStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
      this.showStep(this.currentStep);
      this.updateStepDisplay();
    }
  }

  validateCurrentStep() {
    switch (this.currentStep) {
      case 1:
        return this.calculations.step1 !== null;
      case 2:
        return this.calculations.step2 !== null;
      case 3:
        return this.calculations.step3 !== null && this.calculations.squareMeters !== null;
      default:
        return false;
    }
  }

  showStep(stepNumber) {
    // Hide all steps
    document.querySelectorAll('.calculator-step').forEach(step => {
      step.classList.remove('active');
    });

    // Show current step
    const currentStepElement = document.getElementById(`step${stepNumber}`);
    if (currentStepElement) {
      currentStepElement.classList.add('active');
    }

    // Update step indicators
    document.querySelectorAll('.step').forEach((step, index) => {
      step.classList.remove('active', 'completed');
      if (index + 1 < stepNumber) {
        step.classList.add('completed');
      } else if (index + 1 === stepNumber) {
        step.classList.add('active');
      }
    });

    // Update navigation buttons
    this.updateNavigationButtons();
  }

  updateStepDisplay() {
    // Update step indicators
    document.querySelectorAll('.step').forEach((step, index) => {
      const stepNumber = index + 1;
      step.classList.remove('active', 'completed');

      if (stepNumber < this.currentStep) {
        step.classList.add('completed');
      } else if (stepNumber === this.currentStep) {
        step.classList.add('active');
      }
    });

    // Update navigation buttons
    this.updateNavigationButtons();
  }

  updateNavigationButtons() {
    // Show/hide navigation buttons based on current step
    const prevBtn = document.getElementById(`prevStep${this.currentStep}`);
    const nextBtn = document.getElementById(`nextStep${this.currentStep}`);

    // Hide all navigation buttons first
    document.querySelectorAll('.step-navigation .btn').forEach(btn => {
      btn.style.display = 'none';
    });

    // Show relevant buttons
    if (prevBtn) {prevBtn.style.display = 'inline-block';}
    if (nextBtn) {nextBtn.style.display = 'inline-block';}

    // Special case for step 3 - show calculate button
    if (this.currentStep === 3) {
      const calculateBtn = document.getElementById('calculateBtn');
      if (calculateBtn) {
        calculateBtn.style.display = 'inline-block';
        if (nextBtn) {nextBtn.style.display = 'none';}
      }
    }
  }

  calculate() {
    if (!this.validateAllSteps()) {
      this.showError('Por favor, preencha todas as etapas antes de calcular.');
      return;
    }

    try {
      // Get multipliers for each step
      const step1Multiplier = this.formulas.step1[this.calculations.step1];
      const step2Multiplier = this.formulas.step2[this.calculations.step2];
      const step3Multiplier = this.formulas.step3[this.calculations.step3];

      // Calculate base price
      const basePrice = this.calculations.squareMeters * this.formulas.basePricePerSqm;

      // Apply multipliers
      const step1Price = basePrice * step1Multiplier;
      const step2Price = step1Price * step2Multiplier;
      const finalPrice = step2Price * step3Multiplier;

      this.calculations.total = finalPrice;

      // Display results
      this.displayResults();

      // Save calculation to history
      this.saveCalculationToHistory();

      // Show success message
      this.showSuccess('Cálculo realizado com sucesso!');

    } catch (error) {
      console.error('Erro no cálculo:', error);
      this.showError('Erro ao realizar o cálculo. Por favor, tente novamente.');
    }
  }

  displayResults() {
    const resultsDiv = document.getElementById('calculatorResults');
    const step3Div = document.getElementById('step3');

    if (!resultsDiv || !step3Div) {return;}

    // Get selected options
    const step1Label = document.querySelector('#step1Select option:checked')?.text || 'Não selecionado';
    const step2Label = document.querySelector('#step2Select option:checked')?.text || 'Não selecionado';
    const step3Label = document.querySelector('#step3Select option:checked')?.text || 'Não selecionado';

    // Format currency
    const formatCurrency = (value) => {
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(value);
    };

    // Calculate intermediate values for display
    const basePrice = this.calculations.squareMeters * this.formulas.basePricePerSqm;
    const step1Price = basePrice * this.formulas.step1[this.calculations.step1];
    const step2Price = step1Price * this.formulas.step2[this.calculations.step2];
    const finalPrice = step2Price * this.formulas.step3[this.calculations.step3];

    // Build results HTML
    resultsDiv.innerHTML = `
            <div class="calculator-results">
                <div class="result-header">
                    <h4><i class="fas fa-calculator me-2"></i>Resultado do Orçamento</h4>
                    <span class="badge bg-success">${new Date().toLocaleDateString('pt-BR')}</span>
                </div>
                
                <div class="result-summary">
                    <div class="result-item">
                        <span class="result-label">Área do Projeto:</span>
                        <span class="result-value">${this.calculations.squareMeters} m²</span>
                    </div>
                    
                    <div class="result-item">
                        <span class="result-label">Complexidade (${step1Label}):</span>
                        <span class="result-value">${formatCurrency(step1Price)}</span>
                    </div>
                    
                    <div class="result-item">
                        <span class="result-label">Detalhamento (${step2Label}):</span>
                        <span class="result-value">${formatCurrency(step2Price)}</span>
                    </div>
                    
                    <div class="result-item">
                        <span class="result-label">Prazo (${step3Label}):</span>
                        <span class="result-value">${formatCurrency(finalPrice)}</span>
                    </div>
                    
                    <div class="result-item total">
                        <span class="result-label">Valor Total:</span>
                        <span class="result-value">${formatCurrency(finalPrice)}</span>
                    </div>
                </div>
                
                <div class="result-actions">
                    <button type="button" class="btn btn-primary" id="saveCalculation">
                        <i class="fas fa-save me-2"></i>Salvar Cálculo
                    </button>
                    <button type="button" class="btn btn-outline-light" id="newCalculation">
                        <i class="fas fa-redo me-2"></i>Novo Cálculo
                    </button>
                    <button type="button" class="btn btn-success" id="contactQuote">
                        <i class="fas fa-envelope me-2"></i>Solicitar Orçamento
                    </button>
                </div>
                
                <div class="mt-3">
                    <small class="text-muted">
                        <i class="fas fa-info-circle me-1"></i>
                        Este é um orçamento estimado. O valor final pode variar conforme requisitos específicos do projeto.
                    </small>
                </div>
            </div>
        `;

    // Show results and hide step form
    step3Div.style.display = 'none';
    resultsDiv.style.display = 'block';

    // Re-bind result action events
    setTimeout(() => {
      document.getElementById('saveCalculation')?.addEventListener('click', () => this.saveCalculation());
      document.getElementById('newCalculation')?.addEventListener('click', () => this.resetCalculator());
      document.getElementById('contactQuote')?.addEventListener('click', () => this.contactForQuote());
    }, 100);

    // Scroll to results
    resultsDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  saveCalculation() {
    const calculation = {
      id: Date.now(),
      date: new Date().toISOString(),
      calculations: { ...this.calculations },
      total: this.calculations.total,
      timestamp: new Date().toLocaleString('pt-BR')
    };

    // Get existing calculations
    const savedCalculations = JSON.parse(localStorage.getItem('calculatorHistory') || '[]');

    // Add new calculation
    savedCalculations.unshift(calculation);

    // Keep only last 10 calculations
    const recentCalculations = savedCalculations.slice(0, 10);

    // Save to localStorage
    localStorage.setItem('calculatorHistory', JSON.stringify(recentCalculations));

    this.showSuccess('Cálculo salvo com sucesso!');
  }

  saveCalculationToHistory() {
    // This method is called automatically after calculation
    // The saveCalculation method handles the actual saving
  }

  resetCalculator() {
    // Reset calculations
    this.calculations = {
      step1: null,
      step2: null,
      step3: null,
      squareMeters: null,
      total: null
    };

    // Reset current step
    this.currentStep = 1;

    // Reset form
    document.getElementById('step1Select').value = '';
    document.getElementById('step2Select').value = '';
    document.getElementById('step3Select').value = '';
    document.getElementById('squareMeters').value = '';

    // Hide results and show step 1
    document.getElementById('calculatorResults').style.display = 'none';
    document.getElementById('step3').style.display = 'block';

    // Show step 1
    this.showStep(1);

    // Update displays
    this.updateStepDisplay();
    this.validateStep(1);
    this.validateStep(2);
    this.validateStep(3);
    this.validateSquareMeters();

    this.showSuccess('Calculadora reiniciada!');
  }

  contactForQuote() {
    // Prepare quote data
    const quoteData = {
      area: this.calculations.squareMeters,
      complexity: this.calculations.step1,
      detail: this.calculations.step2,
      deadline: this.calculations.step3,
      total: this.calculations.total,
      timestamp: new Date().toISOString()
    };

    // Store in sessionStorage for the contact form
    sessionStorage.setItem('pendingQuote', JSON.stringify(quoteData));

    // Scroll to contact section
    document.getElementById('contact').scrollIntoView({ behavior: 'smooth' });

    // Auto-fill contact form if it exists
    this.autoFillContactForm(quoteData);

    this.showSuccess('Redirecionando para o formulário de contato...');
  }

  autoFillContactForm(quoteData) {
    // Try to find and fill contact form
    const messageField = document.querySelector('textarea[name="message"], #message, #contactMessage');
    if (messageField) {
      const message = `Olá, gostaria de solicitar um orçamento para um projeto de renderização 3D.\n\n` +
                         `Detalhes do projeto:\n` +
                         `• Área: ${quoteData.area} m²\n` +
                         `• Complexidade: ${this.getStepLabel(1, quoteData.complexity)}\n` +
                         `• Detalhamento: ${this.getStepLabel(2, quoteData.detail)}\n` +
                         `• Prazo: ${this.getStepLabel(3, quoteData.deadline)}\n` +
                         `• Valor estimado: R$ ${quoteData.total.toFixed(2)}\n\n` +
                         `Por favor, entre em contato para discutirmos mais detalhes.`;

      messageField.value = message;
      messageField.focus();
    }
  }

  getStepLabel(step, value) {
    const labels = {
      1: {
        'A': 'Básica',
        'B': 'Padrão',
        'C': 'Premium'
      },
      2: {
        'A': 'Simples',
        'B': 'Moderado',
        'C': 'Complexo'
      },
      3: {
        'A': '3 dias',
        'B': '7 dias',
        'C': '14 dias'
      }
    };

    return labels[step][value] || value;
  }

  loadCalculatorData() {
    // Load any saved data or configurations
    const savedData = localStorage.getItem('calculatorData');
    if (savedData) {
      try {
        const data = JSON.parse(savedData);
        // Apply any saved configurations
        if (data.formulas) {
          this.formulas = { ...this.formulas, ...data.formulas };
        }
      } catch (error) {
        console.warn('Erro ao carregar dados da calculadora:', error);
      }
    }
  }

  showError(message) {
    this.showNotification(message, 'danger');
  }

  showSuccess(message) {
    this.showNotification(message, 'success');
  }

  showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
    notification.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
    notification.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;

    // Add to body
    document.body.appendChild(notification);

    // Auto-remove after 5 seconds
    setTimeout(() => {
      if (notification.parentNode) {
        notification.remove();
      }
    }, 5000);

    // Remove on close button click
    notification.querySelector('.btn-close')?.addEventListener('click', () => {
      notification.remove();
    });
  }

  // Admin methods (can be extended for admin panel)
  updateFormulas(newFormulas) {
    this.formulas = { ...this.formulas, ...newFormulas };
    localStorage.setItem('calculatorData', JSON.stringify({ formulas: this.formulas }));
  }

  getCalculationHistory() {
    return JSON.parse(localStorage.getItem('calculatorHistory') || '[]');
  }

  clearCalculationHistory() {
    localStorage.removeItem('calculatorHistory');
  }
}

// Initialize calculator when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.calculator3D = new Calculator3D();
});

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Calculator3D;
}

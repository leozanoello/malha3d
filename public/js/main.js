/**
 * Zanoello 3D - Main JavaScript
 * Main functionality and initialization
 */

class Zanoello3D {
  constructor() {
    this.calculator = null;
    this.gallery = null;
    this.init();
  }

  init() {
    this.setupNavigation();
    this.setupScrollEffects();
    this.setupAnimations();
    this.setupContactForm();
    this.setupSmoothScrolling();
    this.setupParallaxEffects();
    this.setupIntersectionObserver();
    this.setupMobileMenu();
    this.initializeComponents();
  }

  setupNavigation() {
    // Navbar scroll effect
    window.addEventListener('scroll', () => {
      const navbar = document.getElementById('mainNav');
      if (navbar) {
        if (window.scrollY > 50) {
          navbar.classList.add('navbar-scrolled');
        } else {
          navbar.classList.remove('navbar-scrolled');
        }
      }
    });

    // Active navigation highlighting
    this.updateActiveNavigation();
    window.addEventListener('scroll', () => {
      this.updateActiveNavigation();
    });

    // Smooth scroll for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
          target.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      });
    });
  }

  updateActiveNavigation() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.navbar-nav .nav-link');

    let current = '';
    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.clientHeight;
      if (scrollY >= (sectionTop - 200)) {
        current = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${current}`) {
        link.classList.add('active');
      }
    });
  }

  setupScrollEffects() {
    // Scroll reveal animations
    const revealElements = document.querySelectorAll('.reveal');

    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    });

    revealElements.forEach(element => {
      revealObserver.observe(element);
    });
  }

  setupAnimations() {
    // Counter animations
    this.animateCounters();

    // Progress bar animations
    this.animateProgressBars();

    // Typing effect for hero title
    this.setupTypingEffect();
  }

  animateCounters() {
    const counters = document.querySelectorAll('.counter');

    const counterObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const counter = entry.target;
          const target = parseInt(counter.dataset.target || counter.textContent);
          const duration = 2000;
          const step = target / (duration / 16);
          let current = 0;

          const updateCounter = () => {
            current += step;
            if (current < target) {
              counter.textContent = Math.floor(current);
              requestAnimationFrame(updateCounter);
            } else {
              counter.textContent = target;
            }
          };

          updateCounter();
          counterObserver.unobserve(counter);
        }
      });
    }, { threshold: 0.5 });

    counters.forEach(counter => {
      counterObserver.observe(counter);
    });
  }

  animateProgressBars() {
    const progressBars = document.querySelectorAll('.progress-bar');

    const progressObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const bar = entry.target;
          const width = bar.style.width;
          bar.style.width = '0%';

          setTimeout(() => {
            bar.style.width = width;
          }, 100);

          progressObserver.unobserve(bar);
        }
      });
    }, { threshold: 0.5 });

    progressBars.forEach(bar => {
      progressObserver.observe(bar);
    });
  }

  setupTypingEffect() {
    const typingElement = document.querySelector('.typing-effect');
    if (!typingElement) {return;}

    const text = typingElement.textContent;
    typingElement.textContent = '';

    let index = 0;
    const typeWriter = () => {
      if (index < text.length) {
        typingElement.textContent += text.charAt(index);
        index++;
        setTimeout(typeWriter, 100);
      }
    };

    // Start typing effect when element is visible
    const typingObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          typeWriter();
          typingObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    typingObserver.observe(typingElement);
  }

  setupContactForm() {
    const contactForm = document.getElementById('contactForm');
    if (!contactForm) {return;}

    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const formData = new FormData(contactForm);
      const data = Object.fromEntries(formData);

      // Add calculator data if available
      const pendingQuote = sessionStorage.getItem('pendingQuote');
      if (pendingQuote) {
        data.calculatorData = pendingQuote;
        sessionStorage.removeItem('pendingQuote');
      }

      try {
        await this.submitContactForm(data);
        this.showNotification('Mensagem enviada com sucesso! Obrigado pelo contato.', 'success');
        contactForm.reset();
      } catch (error) {
        this.showNotification('Erro ao enviar mensagem. Por favor, tente novamente.', 'danger');
      }
    });
  }

  async submitContactForm(data) {
    // Simulate API call
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // In a real application, this would be an actual API call
        console.log('Contact form data:', data);
        resolve({ success: true });
      }, 1500);
    });
  }

  setupSmoothScrolling() {
    // Add smooth scrolling to all internal links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
          target.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      });
    });
  }

  setupParallaxEffects() {
    // Parallax effect for hero section
    const heroSection = document.querySelector('.hero-section');
    if (!heroSection) {return;}

    window.addEventListener('scroll', () => {
      const scrolled = window.pageYOffset;
      const rate = scrolled * -0.5;

      heroSection.style.transform = `translateY(${rate}px)`;
    });
  }

  setupIntersectionObserver() {
    // Animate elements on scroll
    const animateElements = document.querySelectorAll('.animate-on-scroll');

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animated');
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    });

    animateElements.forEach(element => {
      observer.observe(element);
    });
  }

  setupMobileMenu() {
    const mobileMenuToggle = document.querySelector('.navbar-toggler');
    const mobileMenu = document.querySelector('.navbar-collapse');

    if (mobileMenuToggle && mobileMenu) {
      mobileMenuToggle.addEventListener('click', () => {
        mobileMenu.classList.toggle('show');
      });

      // Close mobile menu when clicking outside
      document.addEventListener('click', (e) => {
        if (!mobileMenu.contains(e.target) && !mobileMenuToggle.contains(e.target)) {
          mobileMenu.classList.remove('show');
        }
      });
    }
  }

  initializeComponents() {
    // Initialize calculator
    if (typeof Calculator3D !== 'undefined') {
      this.calculator = new Calculator3D();
    }

    // Initialize gallery
    if (typeof Gallery3D !== 'undefined') {
      this.gallery = new Gallery3D();
    }
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

  // Utility methods
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  throttle(func, limit) {
    let inThrottle;
    return function () {
      const args = arguments;
      const context = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }

  // Performance monitoring
  setupPerformanceMonitoring() {
    if ('performance' in window) {
      window.addEventListener('load', () => {
        const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
        console.log(`Page load time: ${loadTime}ms`);

        // Send to analytics (in a real application)
        // analytics.track('page_load_time', { loadTime });
      });
    }
  }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
  window.zanoello3D = new Zanoello3D();

  // Add loading animation
  const loadingOverlay = document.createElement('div');
  loadingOverlay.id = 'loadingOverlay';
  loadingOverlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: #000;
        z-index: 9999;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: opacity 0.5s ease;
    `;

  loadingOverlay.innerHTML = `
        <div class="loading-spinner">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Carregando...</span>
            </div>
        </div>
    `;

  document.body.appendChild(loadingOverlay);

  // Remove loading overlay after page loads
  window.addEventListener('load', () => {
    setTimeout(() => {
      loadingOverlay.style.opacity = '0';
      setTimeout(() => {
        loadingOverlay.remove();
      }, 500);
    }, 1000);
  });
});

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Zanoello3D;
}

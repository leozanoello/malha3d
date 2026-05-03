/**
 * Zanoello 3D - Gallery System
 * Interactive image gallery with filtering and upload functionality
 */

class Gallery3D {
  constructor() {
    this.currentFilter = 'all';
    this.currentPage = 1;
    this.itemsPerPage = 12;
    this.galleryItems = [];
    this.filteredItems = [];
    this.isLoading = false;
    this.lightbox = null;

    this.init();
  }

  init() {
    this.loadGalleryData();
    this.setupEventListeners();
    this.setupLightbox();
    this.setupIntersectionObserver();
  }

  setupEventListeners() {
    // Filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const filter = e.target.dataset.filter;
        this.filterGallery(filter);
      });
    });

    // Load more button
    document.getElementById('loadMoreBtn')?.addEventListener('click', () => {
      this.loadMoreItems();
    });

    // Upload button (if admin)
    document.getElementById('uploadBtn')?.addEventListener('click', () => {
      this.openUploadModal();
    });

    // Search functionality
    const searchInput = document.getElementById('gallerySearch');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchGallery(e.target.value);
      });
    }

    // Keyboard navigation for lightbox
    document.addEventListener('keydown', (e) => {
      if (this.lightbox && this.lightbox.isOpen) {
        switch (e.key) {
          case 'Escape':
            this.closeLightbox();
            break;
          case 'ArrowLeft':
            this.navigateLightbox('prev');
            break;
          case 'ArrowRight':
            this.navigateLightbox('next');
            break;
        }
      }
    });
  }

  setupLightbox() {
    // Create lightbox HTML if it doesn't exist
    if (!document.getElementById('galleryLightbox')) {
      const lightboxHTML = `
                <div id="galleryLightbox" class="gallery-lightbox" style="display: none;">
                    <div class="lightbox-overlay" onclick="gallery3D.closeLightbox()"></div>
                    <div class="lightbox-content">
                        <button class="lightbox-close" onclick="gallery3D.closeLightbox()">
                            <i class="fas fa-times"></i>
                        </button>
                        <button class="lightbox-nav lightbox-prev" onclick="gallery3D.navigateLightbox('prev')">
                            <i class="fas fa-chevron-left"></i>
                        </button>
                        <button class="lightbox-nav lightbox-next" onclick="gallery3D.navigateLightbox('next')">
                            <i class="fas fa-chevron-right"></i>
                        </button>
                        <img id="lightboxImage" src="" alt="" class="lightbox-image">
                        <div class="lightbox-info">
                            <h4 id="lightboxTitle"></h4>
                            <p id="lightboxDescription"></p>
                            <div class="lightbox-meta">
                                <span id="lightboxCategory"></span>
                                <span id="lightboxDate"></span>
                            </div>
                        </div>
                    </div>
                </div>
            `;
      document.body.insertAdjacentHTML('beforeend', lightboxHTML);
    }

    this.lightbox = {
      element: document.getElementById('galleryLightbox'),
      image: document.getElementById('lightboxImage'),
      title: document.getElementById('lightboxTitle'),
      description: document.getElementById('lightboxDescription'),
      category: document.getElementById('lightboxCategory'),
      date: document.getElementById('lightboxDate'),
      isOpen: false,
      currentIndex: 0
    };
  }

  setupIntersectionObserver() {
    // Lazy loading for gallery images
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          if (img.dataset.src) {
            img.src = img.dataset.src;
            img.classList.remove('lazy');
            observer.unobserve(img);
          }
        }
      });
    });

    // Observe all lazy images
    document.querySelectorAll('img[data-src]').forEach(img => {
      imageObserver.observe(img);
    });
  }

  loadGalleryData() {
    // Simulate loading gallery data
    // In a real application, this would be an API call
    this.showLoading(true);

    setTimeout(() => {
      // Sample gallery data
      this.galleryItems = [
        {
          id: 1,
          title: 'Residência Moderna - Fachada Principal',
          description: 'Renderização 3D de fachada moderna com iluminação natural e materiais contemporâneos.',
          category: 'residencial',
          project: 'residencia-moderna',
          image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=600&fit=crop',
          thumbnail: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&h=300&fit=crop',
          date: '2024-01-15',
          featured: true
        },
        {
          id: 2,
          title: 'Escritório Corporativo - Vista Aérea',
          description: 'Visualização aérea de complexo corporativo com design arquitetônico inovador.',
          category: 'comercial',
          project: 'escritorio-corporativo',
          image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=600&fit=crop',
          thumbnail: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=300&fit=crop',
          date: '2024-01-20',
          featured: false
        },
        {
          id: 3,
          title: 'Loja de Varejo - Interior',
          description: 'Renderização de interior de loja com iluminação comercial e layout otimizado.',
          category: 'comercial',
          project: 'loja-varejo',
          image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=600&fit=crop',
          thumbnail: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=300&fit=crop',
          date: '2024-01-25',
          featured: true
        },
        {
          id: 4,
          title: 'Casa de Campo - Perspectiva Externa',
          description: 'Visualização externa de residência rural com integração paisagística.',
          category: 'residencial',
          project: 'casa-campo',
          image: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&h=600&fit=crop',
          thumbnail: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=400&h=300&fit=crop',
          date: '2024-02-01',
          featured: false
        },
        {
          id: 5,
          title: 'Hotel Boutique - Fachada Noturna',
          description: 'Renderização noturna de hotel boutique com iluminação cênica dramática.',
          category: 'hospitalidade',
          project: 'hotel-boutique',
          image: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&h=600&fit=crop',
          thumbnail: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=400&h=300&fit=crop',
          date: '2024-02-05',
          featured: true
        },
        {
          id: 6,
          title: 'Restaurante - Ambiente Interno',
          description: 'Visualização de restaurante com atmosfera acolhedora e iluminação ambiental.',
          category: 'hospitalidade',
          project: 'restaurante-ambiente',
          image: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800&h=600&fit=crop',
          thumbnail: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=400&h=300&fit=crop',
          date: '2024-02-10',
          featured: false
        }
      ];

      this.filteredItems = [...this.galleryItems];
      this.renderGallery();
      this.showLoading(false);
    }, 1000);
  }

  renderGallery() {
    const galleryGrid = document.getElementById('galleryGrid');
    if (!galleryGrid) {return;}

    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    const itemsToShow = this.filteredItems.slice(0, endIndex);

    if (this.currentPage === 1) {
      galleryGrid.innerHTML = '';
    }

    itemsToShow.slice(startIndex).forEach(item => {
      const galleryItem = this.createGalleryItem(item);
      galleryGrid.appendChild(galleryItem);
    });

    this.updateLoadMoreButton();
    this.setupLightboxEvents();
  }

  createGalleryItem(item) {
    const div = document.createElement('div');
    div.className = 'gallery-item';
    div.dataset.category = item.category;
    div.dataset.project = item.project;
    div.dataset.id = item.id;

    div.innerHTML = `
            <img src="${item.thumbnail}" 
                 data-src="${item.image}" 
                 alt="${item.title}" 
                 class="gallery-image lazy"
                 loading="lazy">
            <div class="gallery-overlay">
                <div class="gallery-overlay-content">
                    <h5>${item.title}</h5>
                    <p>${item.description}</p>
                    <div class="gallery-overlay-meta">
                        <span class="badge bg-primary">${this.formatCategory(item.category)}</span>
                        <span class="gallery-date">${this.formatDate(item.date)}</span>
                    </div>
                    <button class="btn btn-sm btn-outline-light mt-2" onclick="gallery3D.openLightbox(${item.id})">
                        <i class="fas fa-expand me-1"></i>Ver em Tela Cheia
                    </button>
                </div>
            </div>
            ${item.featured ? '<div class="gallery-featured-badge"><i class="fas fa-star"></i></div>' : ''}
        `;

    return div;
  }

  setupLightboxEvents() {
    // Add click events to gallery items for lightbox
    document.querySelectorAll('.gallery-item').forEach(item => {
      item.addEventListener('click', (e) => {
        if (!e.target.closest('button')) {
          const itemId = parseInt(item.dataset.id);
          this.openLightbox(itemId);
        }
      });
    });
  }

  openLightbox(itemId) {
    const item = this.filteredItems.find(item => item.id === itemId);
    if (!item || !this.lightbox) {return;}

    this.lightbox.image.src = item.image;
    this.lightbox.title.textContent = item.title;
    this.lightbox.description.textContent = item.description;
    this.lightbox.category.textContent = this.formatCategory(item.category);
    this.lightbox.date.textContent = this.formatDate(item.date);
    this.lightbox.currentIndex = this.filteredItems.findIndex(i => i.id === itemId);
    this.lightbox.isOpen = true;

    this.lightbox.element.style.display = 'flex';
    document.body.style.overflow = 'hidden';

    // Add animation
    setTimeout(() => {
      this.lightbox.element.classList.add('active');
    }, 10);
  }

  closeLightbox() {
    if (!this.lightbox) {return;}

    this.lightbox.element.classList.remove('active');
    setTimeout(() => {
      this.lightbox.element.style.display = 'none';
      this.lightbox.isOpen = false;
      document.body.style.overflow = '';
    }, 300);
  }

  navigateLightbox(direction) {
    if (!this.lightbox || !this.lightbox.isOpen) {return;}

    let newIndex;
    if (direction === 'next') {
      newIndex = (this.lightbox.currentIndex + 1) % this.filteredItems.length;
    } else {
      newIndex = (this.lightbox.currentIndex - 1 + this.filteredItems.length) % this.filteredItems.length;
    }

    const newItem = this.filteredItems[newIndex];
    this.openLightbox(newItem.id);
  }

  filterGallery(filter) {
    this.currentFilter = filter;
    this.currentPage = 1;

    // Update filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
      btn.classList.remove('active');
      if (btn.dataset.filter === filter) {
        btn.classList.add('active');
      }
    });

    // Filter items
    if (filter === 'all') {
      this.filteredItems = [...this.galleryItems];
    } else {
      this.filteredItems = this.galleryItems.filter(item => item.category === filter);
    }

    this.renderGallery();
  }

  searchGallery(query) {
    if (!query.trim()) {
      this.filterGallery(this.currentFilter);
      return;
    }

    const searchTerm = query.toLowerCase();
    this.filteredItems = this.galleryItems.filter(item =>
      item.title.toLowerCase().includes(searchTerm) ||
            item.description.toLowerCase().includes(searchTerm) ||
            item.category.toLowerCase().includes(searchTerm) ||
            item.project.toLowerCase().includes(searchTerm)
    );

    this.currentPage = 1;
    this.renderGallery();
  }

  loadMoreItems() {
    if (this.isLoading) {return;}

    this.isLoading = true;
    this.showLoading(true);

    // Simulate loading more items
    setTimeout(() => {
      this.currentPage++;
      this.renderGallery();
      this.isLoading = false;
      this.showLoading(false);
    }, 800);
  }

  updateLoadMoreButton() {
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    if (!loadMoreBtn) {return;}

    const totalItems = this.filteredItems.length;
    const displayedItems = this.currentPage * this.itemsPerPage;

    if (displayedItems >= totalItems) {
      loadMoreBtn.style.display = 'none';
    } else {
      loadMoreBtn.style.display = 'inline-block';
      loadMoreBtn.textContent = `Carregar Mais (${totalItems - displayedItems})`;
    }
  }

  openUploadModal() {
    // This would open an upload modal for admin users
    alert('Sistema de upload - Esta funcionalidade requer autenticação administrativa.');
  }

  formatCategory(category) {
    const categoryMap = {
      'residencial': 'Residencial',
      'comercial': 'Comercial',
      'hospitalidade': 'Hospitalidade',
      'industrial': 'Industrial',
      'institucional': 'Institucional'
    };
    return categoryMap[category] || category;
  }

  formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  showLoading(show) {
    const loadingElement = document.getElementById('galleryLoading');
    if (loadingElement) {
      loadingElement.style.display = show ? 'block' : 'none';
    }
  }

  // Admin methods
  addGalleryItem(item) {
    this.galleryItems.unshift(item);
    this.filterGallery(this.currentFilter);
  }

  updateGalleryItem(id, updatedItem) {
    const index = this.galleryItems.findIndex(item => item.id === id);
    if (index !== -1) {
      this.galleryItems[index] = { ...this.galleryItems[index], ...updatedItem };
      this.filterGallery(this.currentFilter);
    }
  }

  deleteGalleryItem(id) {
    this.galleryItems = this.galleryItems.filter(item => item.id !== id);
    this.filterGallery(this.currentFilter);
  }

  // Utility methods
  getGalleryStats() {
    const stats = {
      total: this.galleryItems.length,
      byCategory: {},
      featured: this.galleryItems.filter(item => item.featured).length
    };

    this.galleryItems.forEach(item => {
      stats.byCategory[item.category] = (stats.byCategory[item.category] || 0) + 1;
    });

    return stats;
  }
}

// Initialize gallery when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.gallery3D = new Gallery3D();
});

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Gallery3D;
}

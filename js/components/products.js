const CATEGORIES = ['all', 'audio', 'computers', 'accessories', 'storage', 'wearables'];

const ProductsPage = {
    currentCategory: 'all',
    searchQuery: '',
    sortOrder: 'default',
    products: [],
    loading: false,

    async fetchAndRender() {
        this.loading = true;
        document.getElementById('app').innerHTML = this.renderShell();
        this.attachFilterListeners();

        try {
            const sortMap = { 'price-asc': 'price_asc', 'price-desc': 'price_desc', 'rating-desc': 'rating_desc' };
            this.products = await ProductAPI.getAll({
                category: this.currentCategory,
                search: this.searchQuery,
                sort: sortMap[this.sortOrder] || ''
            });
        } catch (e) {
            this.products = [];
            console.error('Failed to load products:', e);
        }

        this.loading = false;
        document.getElementById('products-grid').innerHTML = this.renderGrid();
    },

    renderShell() {
        return `
            <div class="search-sort-bar">
                <input type="text" class="search-input" placeholder="Search products..."
                       value="${escapeHtml(this.searchQuery)}" id="searchInput">
                <select class="sort-select" id="sortSelect">
                    <option value="default" ${this.sortOrder === 'default' ? 'selected' : ''}>Default</option>
                    <option value="price-asc" ${this.sortOrder === 'price-asc' ? 'selected' : ''}>Price: Low → High</option>
                    <option value="price-desc" ${this.sortOrder === 'price-desc' ? 'selected' : ''}>Price: High → Low</option>
                    <option value="rating-desc" ${this.sortOrder === 'rating-desc' ? 'selected' : ''}>Top Rated</option>
                </select>
            </div>
            <div class="filter-bar">
                ${CATEGORIES.map(cat => `
                    <button class="filter-btn ${this.currentCategory === cat ? 'active' : ''}" data-category="${cat}">
                        ${cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </button>
                `).join('')}
            </div>
            <div id="products-grid" class="products-grid">
                <p class="empty-state">Loading...</p>
            </div>
        `;
    },

    renderGrid() {
        if (this.products.length === 0) return '<p class="empty-state">No products found.</p>';
        return this.products.map(p => this.renderCard(p)).join('');
    },

    renderCard(product) {
        const shortDesc = product.description && product.description.length > 60
            ? product.description.substring(0, 60) + '...'
            : (product.description || '');
        return `
            <div class="product-card" onclick="Router.goTo('product-detail', {id: ${product.id}})" style="cursor:pointer;">
                <img loading="lazy" src="${escapeHtml(product.image)}" alt="${escapeHtml(product.name)}">
                <div class="product-card-body">
                    <h3>${escapeHtml(product.name)}</h3>
                    <p class="description">${escapeHtml(shortDesc)}</p>
                    <div class="rating">${'★'.repeat(Math.floor(product.rating))}${'☆'.repeat(5 - Math.floor(product.rating))}</div>
                    <p class="price">$${product.price.toFixed(2)}</p>
                    <button class="btn" onclick="event.stopPropagation(); ProductsPage.addToCart(${product.id})">
                        Add to Cart
                    </button>
                </div>
            </div>
        `;
    },

    mount() {
        this.fetchAndRender();
        if ("IntersectionObserver" in window) {
          const observer = new IntersectionObserver((entries) => {
            entries.forEach(e => { if (e.isIntersecting) { e.target.style.opacity = "1"; observer.unobserve(e.target); }});
          }, { rootMargin: "50px" });
          document.querySelectorAll(".product-card img").forEach(img => {
            img.style.opacity = "0"; img.style.transition = "opacity 0.3s";
            img.addEventListener("load", () => { img.style.opacity = "1"; });
            observer.observe(img);
          });
        }
    },

    attachFilterListeners() {
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.currentCategory = e.target.dataset.category;
                this.fetchAndRender();
            });
        });

        let searchTimer;
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                clearTimeout(searchTimer);
                searchTimer = setTimeout(() => {
                    this.searchQuery = e.target.value;
                    this.fetchAndRender();
                }, 300); // debounce 300ms
            });
        }

        const sortSelect = document.getElementById('sortSelect');
        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => {
                this.sortOrder = e.target.value;
                this.fetchAndRender();
            });
        }
    },

    addToCart(productId) {
        const product = this.products.find(p => p.id === productId);
        if (product) {
            CartStore.addItem(product, 1);
            this.showNotification('Added to cart!');
        }
    },

    showNotification(message) {
        const n = document.createElement('div');
        n.style.cssText = `position:fixed;bottom:20px;right:20px;background:#059669;color:white;
            padding:1rem 2rem;border-radius:8px;box-shadow:0 4px 12px rgba(0,0,0,0.15);z-index:1000;`;
        n.textContent = message;
        document.body.appendChild(n);
        setTimeout(() => n.remove(), 2000);
    }
};

Router.register('products', () => ProductsPage.mount());

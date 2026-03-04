const ProductsPage = {
    currentCategory: 'all',
    searchQuery: '',
    sortOrder: 'default',

    getFilteredProducts() {
        let products = this.currentCategory === 'all'
            ? PRODUCTS
            : PRODUCTS.filter(p => p.category === this.currentCategory);

        if (this.searchQuery) {
            const q = this.searchQuery.toLowerCase();
            products = products.filter(p => p.name.toLowerCase().includes(q));
        }

        if (this.sortOrder === 'price-asc') {
            products = [...products].sort((a, b) => a.price - b.price);
        } else if (this.sortOrder === 'price-desc') {
            products = [...products].sort((a, b) => b.price - a.price);
        } else if (this.sortOrder === 'rating-desc') {
            products = [...products].sort((a, b) => b.rating - a.rating);
        }

        return products;
    },

    render() {
        const categories = CATEGORIES;
        const filteredProducts = this.getFilteredProducts();

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
                ${categories.map(cat => `
                    <button class="filter-btn ${this.currentCategory === cat ? 'active' : ''}" 
                            data-category="${cat}">
                        ${cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </button>
                `).join('')}
            </div>
            <div class="products-grid">
                ${filteredProducts.length > 0 
                    ? filteredProducts.map(product => this.renderCard(product)).join('')
                    : '<p class="empty-state">No products found.</p>'
                }
            </div>
        `;
    },

    renderCard(product) {
        const shortDesc = product.description.length > 60 
            ? product.description.substring(0, 60) + '...' 
            : product.description;
        
        return `
            <div class="product-card" onclick="Router.goTo('product-detail', {id: ${product.id}})" style="cursor:pointer;">
                <img src="${escapeHtml(product.image)}" alt="${escapeHtml(product.name)}">
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
        document.getElementById('app').innerHTML = this.render();
        this.attachFilterListeners();
    },

    attachFilterListeners() {
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.currentCategory = e.target.dataset.category;
                this.mount();
            });
        });

        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchQuery = e.target.value;
                this.mount();
            });
        }

        const sortSelect = document.getElementById('sortSelect');
        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => {
                this.sortOrder = e.target.value;
                this.mount();
            });
        }
    },

    addToCart(productId) {
        const product = PRODUCTS.find(p => p.id === productId);
        CartStore.addItem(product, 1);
        this.showNotification('Added to cart!');
    },

    showNotification(message) {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: #059669;
            color: white;
            padding: 1rem 2rem;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 1000;
            animation: slideIn 0.3s ease;
        `;
        notification.textContent = message;
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 2000);
    }
};

Router.register('products', () => ProductsPage.mount());

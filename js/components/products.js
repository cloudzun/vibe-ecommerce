const ProductsPage = {
    currentCategory: 'all',

    render() {
        const categories = CATEGORIES;
        const filteredProducts = this.currentCategory === 'all'
            ? PRODUCTS
            : PRODUCTS.filter(p => p.category === this.currentCategory);

        return `
            <div class="filter-bar">
                ${categories.map(cat => `
                    <button class="filter-btn ${this.currentCategory === cat ? 'active' : ''}" 
                            data-category="${cat}">
                        ${cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </button>
                `).join('')}
            </div>
            <div class="products-grid">
                ${filteredProducts.map(product => this.renderCard(product)).join('')}
            </div>
        `;
    },

    renderCard(product) {
        const shortDesc = product.description.length > 60 
            ? product.description.substring(0, 60) + '...' 
            : product.description;
        
        return `
            <div class="product-card">
                <img src="${escapeHtml(product.image)}" alt="${escapeHtml(product.name)}">
                <div class="product-card-body">
                    <h3>${escapeHtml(product.name)}</h3>
                    <p class="description">${escapeHtml(shortDesc)}</p>
                    <div class="rating">${'★'.repeat(Math.floor(product.rating))}${'☆'.repeat(5 - Math.floor(product.rating))}</div>
                    <p class="price">$${product.price.toFixed(2)}</p>
                    <button class="btn" onclick="ProductsPage.addToCart(${product.id})">
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

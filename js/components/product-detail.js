const ProductDetailPage = {
    quantity: 1,

    render(productId) {
        const id = parseInt(productId);
        if (!productId || isNaN(id)) {
            return '<div class="empty-state"><h2>Product not found</h2><button class="btn" style="margin-top: 1rem;" onclick="Router.goTo(\'products\')">Back to Products</button></div>';
        }
        
        const product = PRODUCTS.find(p => p.id === id);
        
        if (!product) {
            return '<div class="empty-state"><h2>Product not found</h2><button class="btn" style="margin-top: 1rem;" onclick="Router.goTo(\'products\')">Back to Products</button></div>';
        }

        return `
            <div class="product-detail">
                <div class="product-image">
                    <img src="${escapeHtml(product.image)}" alt="${escapeHtml(product.name)}">
                </div>
                <div class="product-info">
                    <h2>${escapeHtml(product.name)}</h2>
                    <div class="rating">${'★'.repeat(Math.floor(product.rating))}${'☆'.repeat(5 - Math.floor(product.rating))} (${product.rating})</div>
                    <p class="price">$${product.price.toFixed(2)}</p>
                    <p>${escapeHtml(product.description)}</p>
                    <div class="quantity-selector">
                        <button onclick="ProductDetailPage.changeQuantity(-1)">-</button>
                        <span>${this.quantity}</span>
                        <button onclick="ProductDetailPage.changeQuantity(1)">+</button>
                    </div>
                    <button class="btn" onclick="ProductDetailPage.addToCart(${product.id})">
                        Add to Cart
                    </button>
                    <button class="btn btn-secondary" style="margin-top: 1rem;" onclick="Router.goTo('products')">
                        ← Back to Products
                    </button>
                </div>
            </div>
        `;
    },

    mount(params) {
        this.quantity = 1;
        document.getElementById('app').innerHTML = this.render(params.id);
    },

    changeQuantity(delta) {
        this.quantity = Math.max(1, this.quantity + delta);
        this.mount(Router.currentRoute.params);
    },

    addToCart(productId) {
        const product = PRODUCTS.find(p => p.id === productId);
        if (!product) {
            ProductsPage.showNotification('Product not found');
            return;
        }
        CartStore.addItem(product, this.quantity);
        ProductsPage.showNotification('Added to cart!');
    }
};

Router.register('product-detail', (params) => ProductDetailPage.mount(params));

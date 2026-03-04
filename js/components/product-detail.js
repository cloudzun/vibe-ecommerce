const ProductDetailPage = {
    quantity: 1,

    render(productId) {
        const product = PRODUCTS.find(p => p.id === parseInt(productId));
        
        if (!product) {
            return '<div class="empty-state"><h2>Product not found</h2></div>';
        }

        return `
            <div class="product-detail">
                <div class="product-image">
                    <img src="${product.image}" alt="${product.name}">
                </div>
                <div class="product-info">
                    <h2>${product.name}</h2>
                    <div class="rating">${'★'.repeat(Math.floor(product.rating))}${'☆'.repeat(5 - Math.floor(product.rating))} (${product.rating})</div>
                    <p class="price">$${product.price.toFixed(2)}</p>
                    <p>${product.description}</p>
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
        CartStore.addItem(product, this.quantity);
        ProductsPage.showNotification('Added to cart!');
    }
};

Router.register('product-detail', (params) => ProductDetailPage.mount(params));

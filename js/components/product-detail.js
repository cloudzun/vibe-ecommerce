const ProductDetailPage = {
    quantity: 1,
    product: null,

    async mount(params) {
        this.quantity = 1;
        this.product = null;
        document.getElementById('app').innerHTML = '<p class="empty-state">Loading...</p>';

        const id = parseInt(params && params.id);
        if (!id || isNaN(id)) {
            document.getElementById('app').innerHTML = this.renderNotFound();
            return;
        }

        try {
            this.product = await ProductAPI.getById(id);
            document.getElementById('app').innerHTML = this.render();
        } catch (e) {
            document.getElementById('app').innerHTML = this.renderNotFound();
        }
    },

    render() {
        const product = this.product;
        return `
            <div class="product-detail">
                <div class="product-image">
                    <img loading="lazy" src="${escapeHtml(product.image)}" alt="${escapeHtml(product.name)}">
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
                    <button class="btn" onclick="ProductDetailPage.addToCart()">Add to Cart</button>
                    <button class="btn btn-secondary" style="margin-top:1rem" onclick="Router.goTo('products')">← Back</button>
                </div>
            </div>
        `;
    },

    renderNotFound() {
        return `<div class="empty-state"><h2>Product not found</h2>
            <button class="btn" style="margin-top:1rem" onclick="Router.goTo('products')">Back to Products</button></div>`;
    },

    changeQuantity(delta) {
        this.quantity = Math.max(1, this.quantity + delta);
        if (this.product) document.getElementById('app').innerHTML = this.render();
    },

    addToCart() {
        if (!this.product) return;
        CartStore.addItem(this.product, this.quantity);
        ProductsPage.showNotification('Added to cart!');
    }
};

Router.register('product-detail', (params) => ProductDetailPage.mount(params));

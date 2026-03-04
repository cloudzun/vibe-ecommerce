const Header = {
    render() {
        const cartCount = CartStore.getCartCount();
        
        return `
            <nav class="navbar">
                <div class="nav-brand" onclick="Router.goTo('products')">
                    <h1>TechShop</h1>
                </div>
                <ul class="nav-links">
                    <li><a href="#products" class="${this.isActive('products')}">Products</a></li>
                    <li><a href="#cart" class="${this.isActive('cart')}">
                        Cart <span class="cart-badge">${cartCount}</span>
                    </a></li>
                </ul>
            </nav>
        `;
    },

    isActive(route) {
        const current = window.location.hash.slice(1) || 'products';
        return current.startsWith(route) ? 'active' : '';
    },

    mount() {
        document.getElementById('header').innerHTML = this.render();
        CartStore.addListener(() => this.updateCartBadge());
    },

    updateCartBadge() {
        const badge = document.querySelector('.cart-badge');
        if (badge) {
            badge.textContent = CartStore.getCartCount();
        }
    }
};

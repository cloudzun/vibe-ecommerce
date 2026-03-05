const HeaderComponent = {
    render() {
        const cartCount = CartStore.getCartCount();
        const isLoggedIn = AuthService.isLoggedIn();
        const user = AuthService.getUser();

        const authLinks = isLoggedIn
            ? `<li><a href="#account" class="${this.isActive('account')}">${escapeHtml(user.email.split('@')[0])}</a></li>`
            : `<li><a href="#login" class="${this.isActive('login')}">Sign In</a></li>`;

        document.getElementById('header').innerHTML = `
            <nav class="navbar">
                <div class="nav-brand" onclick="Router.goTo('products')">
                    <h1>TechShop</h1>
                </div>
                <ul class="nav-links">
                    <li><a href="#products" class="${this.isActive('products')}">Products</a></li>
                    ${authLinks}
                    <li><a href="#cart" class="${this.isActive('cart')}">
                        Cart <span class="cart-badge">${cartCount}</span>
                    </a></li>
                </ul>
            </nav>
        `;

        CartStore.addListener(() => this.updateCartBadge());
    },

    isActive(route) {
        const current = window.location.hash.slice(1).split('?')[0] || 'products';
        return current === route ? 'active' : '';
    },

    mount() {
        this.render();
    },

    updateCartBadge() {
        const badge = document.querySelector('.cart-badge');
        if (badge) badge.textContent = CartStore.getCartCount();
    }
};

// Alias for backward compat
const Header = HeaderComponent;

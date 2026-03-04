const CartPage = {
    render() {
        const cart = CartStore.getCart();
        
        if (cart.length === 0) {
            return `
                <div class="empty-state">
                    <h2>Your cart is empty</h2>
                    <p style="margin: 1rem 0;">Add some products to get started!</p>
                    <button class="btn" style="width: auto;" onclick="Router.goTo('products')">
                        Browse Products
                    </button>
                </div>
            `;
        }

        const total = CartStore.getCartTotal();

        return `
            <div class="cart-container">
                <h2 style="margin-bottom: 1.5rem;">Shopping Cart</h2>
                ${cart.map(item => `
                    <div class="cart-item">
                        <img src="${item.image}" alt="${item.name}">
                        <div>
                            <h3>${item.name}</h3>
                            <p class="price">$${item.price.toFixed(2)}</p>
                        </div>
                        <div class="cart-item-actions">
                            <div class="quantity-selector" style="margin: 0.5rem 0;">
                                <button onclick="CartPage.updateQuantity(${item.id}, ${item.quantity - 1})">-</button>
                                <span>${item.quantity}</span>
                                <button onclick="CartPage.updateQuantity(${item.id}, ${item.quantity + 1})">+</button>
                            </div>
                            <button class="btn btn-secondary" style="padding: 0.5rem 1rem; width: auto;" 
                                    onclick="CartPage.removeItem(${item.id})">
                                Remove
                            </button>
                        </div>
                    </div>
                `).join('')}
                <div class="cart-summary">
                    <div class="total">Total: $${total.toFixed(2)}</div>
                    <button class="btn" onclick="Router.goTo('checkout')">
                        Proceed to Checkout
                    </button>
                </div>
            </div>
        `;
    },

    mount() {
        document.getElementById('app').innerHTML = this.render();
    },

    updateQuantity(productId, quantity) {
        CartStore.updateQuantity(productId, Math.max(1, quantity));
    },

    removeItem(productId) {
        CartStore.removeItem(productId);
    }
};

Router.register('cart', () => CartPage.mount());

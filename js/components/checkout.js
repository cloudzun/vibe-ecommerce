const CheckoutPage = {
    render() {
        const cart = CartStore.getCart();
        const total = CartStore.getCartTotal();

        if (cart.length === 0) {
            return `
                <div class="empty-state">
                    <h2>Your cart is empty</h2>
                    <button class="btn" style="width: auto;" onclick="Router.goTo('products')">
                        Browse Products
                    </button>
                </div>
            `;
        }

        return `
            <h2 style="margin-bottom: 1.5rem;">Checkout</h2>
            <form class="checkout-form" onsubmit="CheckoutPage.handleSubmit(event)">
                <div>
                    <div class="form-group">
                        <label>Full Name *</label>
                        <input type="text" name="name" required placeholder="John Doe">
                    </div>
                    <div class="form-group">
                        <label>Email *</label>
                        <input type="email" name="email" required placeholder="john@example.com">
                    </div>
                    <div class="form-group full-width">
                        <label>Shipping Address *</label>
                        <textarea name="address" required rows="3" placeholder="123 Main St, City, State 12345"></textarea>
                    </div>
                    <div class="form-group full-width">
                        <label>Card Number *</label>
                        <input type="text" name="cardNumber" required placeholder="1234 5678 9012 3456" pattern="[0-9\s]{13,19}">
                    </div>
                    <button type="submit" class="btn full-width">Place Order</button>
                </div>
                <div class="order-summary">
                    <h3>Order Summary</h3>
                    ${cart.map(item => `
                        <div class="order-item">
                            <span>${escapeHtml(item.name)} x${item.quantity}</span>
                            <span>$${(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                    `).join('')}
                    <div class="order-item" style="font-weight: 700; border-top: 2px solid #3b82f6; margin-top: 1rem; padding-top: 1rem;">
                        <span>Total</span>
                        <span>$${total.toFixed(2)}</span>
                    </div>
                </div>
            </form>
        `;
    },

    mount() {
        document.getElementById('app').innerHTML = this.render();
    },

    handleSubmit(event) {
        event.preventDefault();
        
        const form = event.target;
        const formData = new FormData(form);
        
        const order = {
            name: formData.get('name'),
            email: formData.get('email'),
            address: formData.get('address'),
            cardNumber: formData.get('cardNumber'),
            items: CartStore.getCart(),
            total: CartStore.getCartTotal(),
            date: new Date().toISOString()
        };

        console.log('Order placed:', order);
        
        CartStore.clearCart();
        
        this.showSuccess(order);
    },

    showSuccess(order) {
        document.getElementById('app').innerHTML = `
            <div class="success-message">
                <h2>✓ Order Placed Successfully!</h2>
                <p style="font-size: 1.1rem; color: #6b7280; margin-bottom: 1rem;">
                    Thank you for your purchase, ${escapeHtml(order.name)}!
                </p>
                <p style="color: #6b7280;">
                    Order total: <strong>$${order.total.toFixed(2)}</strong>
                </p>
                <p style="color: #6b7280; margin-top: 1rem;">
                    A confirmation email has been sent to ${escapeHtml(order.email)}
                </p>
                <button class="btn" style="width: auto; margin-top: 2rem;" onclick="Router.goTo('products')">
                    Continue Shopping
                </button>
            </div>
        `;
    }
};

Router.register('checkout', () => CheckoutPage.mount());

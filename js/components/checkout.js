const CheckoutPage = {
    submitting: false,

    render() {
        const cart = CartStore.getCart();
        const total = CartStore.getCartTotal();

        if (cart.length === 0) {
            return `<div class="empty-state">
                <h2>Your cart is empty</h2>
                <button class="btn" style="width:auto" onclick="Router.goTo('products')">Browse Products</button>
            </div>`;
        }

        return `
            <h2 style="margin-bottom:1.5rem">Checkout</h2>
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
                    <button type="submit" class="btn full-width" id="submitBtn">Place Order</button>
                </div>
                <div class="order-summary">
                    <h3>Order Summary</h3>
                    ${cart.map(item => `
                        <div class="order-item">
                            <span>${escapeHtml(item.name)} x${item.quantity}</span>
                            <span>$${(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                    `).join('')}
                    <div class="order-item" style="font-weight:700;border-top:2px solid #3b82f6;margin-top:1rem;padding-top:1rem">
                        <span>Total</span>
                        <span>$${total.toFixed(2)}</span>
                    </div>
                </div>
            </form>
        `;
    },

    mount() {
        this.submitting = false;
        document.getElementById('app').innerHTML = this.render();
    },

    async handleSubmit(event) {
        event.preventDefault();
        if (this.submitting) return;
        this.submitting = true;

        const btn = document.getElementById('submitBtn');
        if (btn) { btn.disabled = true; btn.textContent = 'Placing order...'; }

        const form = event.target;
        const formData = new FormData(form);

        const order = {
            name: formData.get('name'),
            email: formData.get('email'),
            address: formData.get('address'),
            items: CartStore.getCart(),
            total: CartStore.getCartTotal()
        };

        try {
            const result = await OrderAPI.create(order);
            CartStore.clearCart();
            // 把 orderId 存到 sessionStorage 供确认页读取
            sessionStorage.setItem('lastOrderId', result.orderId);
            Router.goTo('order-confirmation');
        } catch (e) {
            this.submitting = false;
            if (btn) { btn.disabled = false; btn.textContent = 'Place Order'; }
            alert('Failed to place order. Please try again.');
        }
    }
};

Router.register('checkout', () => CheckoutPage.mount());

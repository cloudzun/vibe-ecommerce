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

        // 生成订单号：时间戳 + 随机4位
        const orderId = 'ORD-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).substr(2, 4).toUpperCase();

        const order = {
            id: orderId,
            name: formData.get('name'),
            email: formData.get('email'),
            address: formData.get('address'),
            items: CartStore.getCart(),
            total: CartStore.getCartTotal(),
            date: new Date().toISOString()
        };

        // 保存到 sessionStorage 供确认页读取
        try {
            sessionStorage.setItem('lastOrder', JSON.stringify(order));
        } catch (e) {
            // sessionStorage 不可用时降级：直接在页面显示
        }

        CartStore.clearCart();
        Router.goTo('order-confirmation');
    }
};

Router.register('checkout', () => CheckoutPage.mount());

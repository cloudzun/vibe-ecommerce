const OrderConfirmationPage = {
    render(order) {
        if (!order) {
            return `<div class="empty-state">
                <h2>No order found</h2>
                <button class="btn" style="margin-top:1rem" onclick="Router.goTo('products')">Back to Shop</button>
            </div>`;
        }

        const itemsHtml = order.items.map(item => `
            <tr>
                <td>${escapeHtml(item.name)}</td>
                <td>${item.quantity}</td>
                <td>$${(item.price * item.quantity).toFixed(2)}</td>
            </tr>
        `).join('');

        return `
            <div class="order-confirmation">
                <div class="order-success-icon">✓</div>
                <h2>Order Confirmed!</h2>
                <p class="order-id">Order #${escapeHtml(order.id)}</p>
                <p class="order-meta">Thank you, ${escapeHtml(order.name)}! A confirmation will be sent to ${escapeHtml(order.email)}.</p>

                <div class="order-summary">
                    <h3>Order Summary</h3>
                    <table class="order-table">
                        <thead>
                            <tr><th>Product</th><th>Qty</th><th>Subtotal</th></tr>
                        </thead>
                        <tbody>${itemsHtml}</tbody>
                        <tfoot>
                            <tr><td colspan="2"><strong>Total</strong></td><td><strong>$${order.total.toFixed(2)}</strong></td></tr>
                        </tfoot>
                    </table>
                </div>

                <button class="btn" style="margin-top:2rem" onclick="Router.goTo('products')">Continue Shopping</button>
            </div>
        `;
    },

    mount() {
        // 从 sessionStorage 读取最近一次订单
        let order = null;
        try {
            const raw = sessionStorage.getItem('lastOrder');
            if (raw) order = JSON.parse(raw);
        } catch (e) {
            order = null;
        }
        document.getElementById('app').innerHTML = this.render(order);
    }
};

Router.register('order-confirmation', () => OrderConfirmationPage.mount());

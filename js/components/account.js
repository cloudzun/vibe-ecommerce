const AccountPage = {
  async mount() {
    if (!AuthService.isLoggedIn()) {
      Router.goTo('login');
      return;
    }

    const app = document.getElementById('app');
    const user = AuthService.getUser();

    app.innerHTML = `
      <div class="account-container">
        <div class="account-header">
          <h2>我的账户</h2>
          <p class="account-email">${escapeHtml(user.email)}</p>
          <button id="logout-btn" class="btn btn-secondary">退出登录</button>
        </div>
        <h3>历史订单</h3>
        <div id="orders-list"><p>加载中...</p></div>
      </div>
    `;

    document.getElementById('logout-btn').addEventListener('click', async () => {
      await AuthService.logout();
      HeaderComponent.render();
      Router.goTo('products');
    });

    try {
      const orders = await AuthService.getOrders();
      const listEl = document.getElementById('orders-list');

      if (!orders || orders.length === 0) {
        listEl.innerHTML = '<p class="empty-state">暂无订单记录</p>';
        return;
      }

      listEl.innerHTML = orders.map(order => `
        <div class="order-card">
          <div class="order-card-header">
            <span class="order-id">${escapeHtml(order.id)}</span>
            <span class="order-date">${new Date(order.created_at).toLocaleDateString('zh-CN')}</span>
            <span class="order-total">¥${Number(order.total).toFixed(2)}</span>
          </div>
          <ul class="order-items-list">
            ${(order.items || []).map(item => `
              <li>${escapeHtml(item.name)} × ${item.quantity} — ¥${Number(item.price).toFixed(2)}</li>
            `).join('')}
          </ul>
        </div>
      `).join('');
    } catch (err) {
      document.getElementById('orders-list').innerHTML =
        `<p class="error-message">加载失败：${escapeHtml(err.message)}</p>`;
    }
  }
};

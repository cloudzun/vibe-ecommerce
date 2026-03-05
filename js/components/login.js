const LoginPage = {
  mount() {
    if (AuthService.isLoggedIn()) {
      Router.goTo('account');
      return;
    }
    const app = document.getElementById('app');
    app.innerHTML = `
      <div class="auth-container">
        <h2>登录</h2>
        <form id="login-form" class="auth-form">
          <div class="form-group">
            <label for="email">邮箱</label>
            <input type="email" id="email" required placeholder="you@example.com">
          </div>
          <div class="form-group">
            <label for="password">密码</label>
            <input type="password" id="password" required placeholder="至少 6 位">
          </div>
          <div id="login-error" class="form-error" style="display:none"></div>
          <button type="submit" class="btn btn-primary" id="login-btn">登录</button>
        </form>
        <p class="auth-switch">还没有账号？<a href="#register">立即注册</a></p>
      </div>
    `;

    document.getElementById('login-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value;
      const errorEl = document.getElementById('login-error');
      const btn = document.getElementById('login-btn');

      btn.disabled = true;
      btn.textContent = '登录中...';
      errorEl.style.display = 'none';

      try {
        await AuthService.login(email, password);
        HeaderComponent.render();
        Router.goTo('account');
      } catch (err) {
        errorEl.textContent = err.message;
        errorEl.style.display = 'block';
        btn.disabled = false;
        btn.textContent = '登录';
      }
    });
  }
};

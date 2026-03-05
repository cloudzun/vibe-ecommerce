const RegisterPage = {
  mount() {
    if (AuthService.isLoggedIn()) {
      Router.goTo('account');
      return;
    }
    const app = document.getElementById('app');
    app.innerHTML = `
      <div class="auth-container">
        <h2>注册</h2>
        <form id="register-form" class="auth-form">
          <div class="form-group">
            <label for="email">邮箱</label>
            <input type="email" id="email" required placeholder="you@example.com">
          </div>
          <div class="form-group">
            <label for="password">密码</label>
            <input type="password" id="password" required placeholder="至少 6 位">
          </div>
          <div class="form-group">
            <label for="password2">确认密码</label>
            <input type="password" id="password2" required placeholder="再输一次">
          </div>
          <div id="register-error" class="form-error" style="display:none"></div>
          <button type="submit" class="btn btn-primary" id="register-btn">注册</button>
        </form>
        <p class="auth-switch">已有账号？<a href="#login">立即登录</a></p>
      </div>
    `;

    document.getElementById('register-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value;
      const password2 = document.getElementById('password2').value;
      const errorEl = document.getElementById('register-error');
      const btn = document.getElementById('register-btn');

      errorEl.style.display = 'none';

      if (password !== password2) {
        errorEl.textContent = '两次密码不一致';
        errorEl.style.display = 'block';
        return;
      }

      btn.disabled = true;
      btn.textContent = '注册中...';

      try {
        await AuthService.register(email, password);
        // 注册成功后自动登录
        await AuthService.login(email, password);
        HeaderComponent.render();
        Router.goTo('account');
      } catch (err) {
        errorEl.textContent = err.message;
        errorEl.style.display = 'block';
        btn.disabled = false;
        btn.textContent = '注册';
      }
    });
  }
};

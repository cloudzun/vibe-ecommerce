// 前端认证工具函数
const AuthService = {
    getToken() {
        try {
            return localStorage.getItem('accessToken');
        } catch (e) {
            return null;
        }
    },

    setToken(token, refreshToken) {
        try {
            localStorage.setItem('accessToken', token);
            // refreshToken 由服务器通过 httpOnly cookie 设置，前端不需要存储
        } catch (e) {
            console.error('Failed to store token:', e);
        }
    },

    clearToken() {
        try {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('user');
        } catch (e) {}
    },

    getUser() {
        try {
            const user = localStorage.getItem('user');
            return user ? JSON.parse(user) : null;
        } catch (e) {
            return null;
        }
    },

    setUser(user) {
        try {
            localStorage.setItem('user', JSON.stringify(user));
        } catch (e) {
            console.error('Failed to store user:', e);
        }
    },

    isLoggedIn() {
        return !!this.getToken() && !!this.getUser();
    },

    async register(email, password) {
        const res = await fetch('https://shop-api.huaqloud.com/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.error || 'Registration failed');
        return data;
    },

    async login(email, password) {
        const res = await fetch('https://shop-api.huaqloud.com/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
            credentials: 'include'  // 接收 httpOnly cookie
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.error || 'Login failed');
        this.setToken(data.data.accessToken);
        this.setUser(data.data.user);
        return data.data;
    },

    async logout() {
        try {
            await fetch('https://shop-api.huaqloud.com/api/auth/logout', {
                method: 'POST',
                credentials: 'include'
            });
        } catch (e) {}
        this.clearToken();
    },

    async getOrders() {
        const token = this.getToken();
        if (!token) throw new Error('Not logged in');
        const res = await fetch('https://shop-api.huaqloud.com/api/users/me/orders', {
            headers: { 'Authorization': `Bearer ${token}` },
            credentials: 'include'
        });
        if (res.status === 401) {
            this.clearToken();
            throw new Error('Session expired');
        }
        const data = await res.json();
        if (!data.success) throw new Error(data.error || 'Failed to fetch orders');
        return data.data;
    }
};

// API base URL — Phase 3: served from backend
const API_BASE = 'https://shop-api.huaqloud.com';

// ProductAPI: replaces hardcoded PRODUCTS array
const ProductAPI = {
    async getAll(params = {}) {
        const query = new URLSearchParams();
        if (params.category && params.category !== 'all') query.set('category', params.category);
        if (params.search) query.set('search', params.search);
        if (params.sort && params.sort !== 'default') query.set('sort', params.sort);

        const url = `${API_BASE}/api/products${query.toString() ? '?' + query.toString() : ''}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error('Failed to fetch products');
        const data = await res.json();
        return data.data;
    },

    async getById(id) {
        const res = await fetch(`${API_BASE}/api/products/${id}`);
        if (!res.ok) throw new Error('Product not found');
        const data = await res.json();
        return data.data;
    }
};

const OrderAPI = {
    async create(order) {
        const res = await fetch(`${API_BASE}/api/orders`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(order)
        });
        if (!res.ok) throw new Error('Failed to create order');
        const data = await res.json();
        return data.data; // { orderId }
    },

    async getById(id) {
        const res = await fetch(`${API_BASE}/api/orders/${id}`);
        if (!res.ok) throw new Error('Order not found');
        const data = await res.json();
        return data.data;
    }
};

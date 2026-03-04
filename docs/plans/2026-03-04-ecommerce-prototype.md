# E-commerce SPA Prototype Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a vanilla JavaScript single-page e-commerce application with product listing, detail view, shopping cart, and checkout flow.

**Architecture:** SPA with hash-based routing (#products, #product-detail, #cart, #checkout). All state managed in JavaScript with localStorage persistence for cart data.

**Tech Stack:** Pure HTML5, CSS3, ES6+ JavaScript. No frameworks, no build tools, no external dependencies.

---

## Project Structure

```
vibe-ecommerce/
├── index.html          # Single HTML entry point
├── css/
│   └── styles.css      # All styles
├── js/
│   ├── data.js         # Product data array
│   ├── store.js        # Cart state + localStorage
│   ├── router.js       # Hash-based routing
│   ├── components/
│   │   ├── header.js   # Navigation + cart badge
│   │   ├── products.js # Product grid + filter
│   │   ├── product-detail.js # Detail view
│   │   ├── cart.js     # Cart page
│   │   └── checkout.js # Checkout form
│   └── app.js          # Main initialization
└── docs/plans/
    └── 2026-03-04-ecommerce-prototype.md
```

---

### Task 1: Create Base HTML Structure

**Files:**
- Create: `index.html`

**Step 1: Write the HTML skeleton**

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>TechShop - Electronics Store</title>
    <link rel="stylesheet" href="css/styles.css">
</head>
<body>
    <header id="header"></header>
    <main id="app"></main>
    
    <script src="js/data.js"></script>
    <script src="js/store.js"></script>
    <script src="js/router.js"></script>
    <script src="js/components/header.js"></script>
    <script src="js/components/products.js"></script>
    <script src="js/components/product-detail.js"></script>
    <script src="js/components/cart.js"></script>
    <script src="js/components/checkout.js"></script>
    <script src="js/app.js"></script>
</body>
</html>
```

**Step 2: Verify file exists**

Run: `ls -la index.html`
Expected: File exists with content

**Step 3: Commit**

```bash
git add index.html
git commit -m "feat: create base HTML structure"
```

---

### Task 2: Create Product Data

**Files:**
- Create: `js/data.js`

**Step 1: Write product data array**

```javascript
const PRODUCTS = [
    {
        id: 1,
        name: "Wireless Bluetooth Headphones",
        category: "audio",
        price: 79.99,
        image: "https://picsum.photos/seed/headphones/400/300",
        description: "Premium wireless headphones with active noise cancellation and 30-hour battery life.",
        rating: 4.5
    },
    {
        id: 2,
        name: "Smart Watch Pro",
        category: "wearables",
        price: 199.99,
        image: "https://picsum.photos/seed/smartwatch/400/300",
        description: "Feature-rich smartwatch with health tracking, GPS, and water resistance.",
        rating: 4.7
    },
    {
        id: 3,
        name: "Portable Bluetooth Speaker",
        category: "audio",
        price: 49.99,
        image: "https://picsum.photos/seed/speaker/400/300",
        description: "Compact waterproof speaker with 360-degree sound and 12-hour playtime.",
        rating: 4.3
    },
    {
        id: 4,
        name: "4K Action Camera",
        category: "cameras",
        price: 149.99,
        image: "https://picsum.photos/seed/camera/400/300",
        description: "Ultra HD action camera with image stabilization and waterproof case.",
        rating: 4.6
    },
    {
        id: 5,
        name: "Wireless Charging Pad",
        category: "accessories",
        price: 29.99,
        image: "https://picsum.photos/seed/charger/400/300",
        description: "Fast wireless charger compatible with all Qi-enabled devices.",
        rating: 4.2
    },
    {
        id: 6,
        name: "Gaming Mouse RGB",
        category: "gaming",
        price: 59.99,
        image: "https://picsum.photos/seed/mouse/400/300",
        description: "High-precision gaming mouse with customizable RGB lighting and programmable buttons.",
        rating: 4.8
    },
    {
        id: 7,
        name: "USB-C Hub Multiport",
        category: "accessories",
        price: 39.99,
        image: "https://picsum.photos/seed/hub/400/300",
        description: "7-in-1 USB-C hub with HDMI, USB 3.0, SD card reader, and power delivery.",
        rating: 4.4
    },
    {
        id: 8,
        name: "Mechanical Keyboard",
        category: "gaming",
        price: 89.99,
        image: "https://picsum.photos/seed/keyboard/400/300",
        description: "Compact mechanical keyboard with blue switches and RGB backlighting.",
        rating: 4.6
    },
    {
        id: 9,
        name: "Fitness Tracker Band",
        category: "wearables",
        price: 39.99,
        image: "https://picsum.photos/seed/fitness/400/300",
        description: "Slim fitness tracker with heart rate monitor and sleep tracking.",
        rating: 4.1
    },
    {
        id: 10,
        name: "Noise Cancelling Earbuds",
        category: "audio",
        price: 129.99,
        image: "https://picsum.photos/seed/earbuds/400/300",
        description: "True wireless earbuds with active noise cancellation and wireless charging case.",
        rating: 4.7
    }
];

const CATEGORIES = ["all", "audio", "wearables", "cameras", "accessories", "gaming"];
```

**Step 2: Verify file exists**

Run: `ls -la js/data.js`
Expected: File exists with content

**Step 3: Commit**

```bash
git add js/data.js
git commit -m "feat: add product data with 10 electronics items"
```

---

### Task 3: Create Cart Store with localStorage

**Files:**
- Create: `js/store.js`

**Step 1: Write cart store module**

```javascript
const CartStore = {
    STORAGE_KEY: 'techshop_cart',

    getCart() {
        const data = localStorage.getItem(this.STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    },

    saveCart(cart) {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(cart));
        this.notifyListeners();
    },

    addItem(product, quantity = 1) {
        const cart = this.getCart();
        const existing = cart.find(item => item.id === product.id);
        
        if (existing) {
            existing.quantity += quantity;
        } else {
            cart.push({ ...product, quantity });
        }
        
        this.saveCart(cart);
    },

    removeItem(productId) {
        const cart = this.getCart().filter(item => item.id !== productId);
        this.saveCart(cart);
    },

    updateQuantity(productId, quantity) {
        const cart = this.getCart();
        const item = cart.find(item => item.id === productId);
        
        if (item) {
            if (quantity <= 0) {
                this.removeItem(productId);
            } else {
                item.quantity = quantity;
                this.saveCart(cart);
            }
        }
    },

    clearCart() {
        this.saveCart([]);
    },

    getCartCount() {
        return this.getCart().reduce((sum, item) => sum + item.quantity, 0);
    },

    getCartTotal() {
        return this.getCart().reduce((sum, item) => sum + (item.price * item.quantity), 0);
    },

    listeners: [],

    addListener(callback) {
        this.listeners.push(callback);
    },

    notifyListeners() {
        this.listeners.forEach(callback => callback());
    }
};
```

**Step 2: Verify file exists**

Run: `ls -la js/store.js`
Expected: File exists with content

**Step 3: Commit**

```bash
git add js/store.js
git commit -m "feat: create cart store with localStorage persistence"
```

---

### Task 4: Create Hash Router

**Files:**
- Create: `js/router.js`

**Step 1: Write router module**

```javascript
const Router = {
    routes: {},
    currentRoute: null,

    register(route, handler) {
        this.routes[route] = handler;
    },

    navigate(hash) {
        if (!hash) hash = window.location.hash.slice(1) || 'products';
        
        const route = hash.split('?')[0];
        const params = this.parseParams(hash);
        
        this.currentRoute = { route, params };
        
        const handler = this.routes[route] || this.routes['products'];
        if (handler) {
            handler(params);
        }
        
        window.dispatchEvent(new CustomEvent('routeChange', { detail: { route, params } }));
    },

    parseParams(hash) {
        const [path, queryString] = hash.split('?');
        if (!queryString) return {};
        
        return queryString.split('&').reduce((params, pair) => {
            const [key, value] = pair.split('=');
            params[decodeURIComponent(key)] = decodeURIComponent(value || '');
            return params;
        }, {});
    },

    goTo(route, params = {}) {
        const queryString = Object.keys(params).length 
            ? '?' + new URLSearchParams(params).toString()
            : '';
        window.location.hash = route + queryString;
    }
};

window.addEventListener('hashchange', () => {
    Router.navigate();
});
```

**Step 2: Verify file exists**

Run: `ls -la js/router.js`
Expected: File exists with content

**Step 3: Commit**

```bash
git add js/router.js
git commit -m "feat: implement hash-based router"
```

---

### Task 5: Create Header Component

**Files:**
- Create: `js/components/header.js`

**Step 1: Write header component**

```javascript
const Header = {
    render() {
        const cartCount = CartStore.getCartCount();
        
        return `
            <nav class="navbar">
                <div class="nav-brand" onclick="Router.goTo('products')">
                    <h1>TechShop</h1>
                </div>
                <ul class="nav-links">
                    <li><a href="#products" class="${this.isActive('products')}">Products</a></li>
                    <li><a href="#cart" class="${this.isActive('cart')}">
                        Cart <span class="cart-badge">${cartCount}</span>
                    </a></li>
                </ul>
            </nav>
        `;
    },

    isActive(route) {
        const current = window.location.hash.slice(1) || 'products';
        return current.startsWith(route) ? 'active' : '';
    },

    mount() {
        document.getElementById('header').innerHTML = this.render();
        CartStore.addListener(() => this.updateCartBadge());
    },

    updateCartBadge() {
        const badge = document.querySelector('.cart-badge');
        if (badge) {
            badge.textContent = CartStore.getCartCount();
        }
    }
};
```

**Step 2: Verify file exists**

Run: `ls -la js/components/header.js`
Expected: File exists with content

**Step 3: Commit**

```bash
git add js/components/header.js
git commit -m "feat: create header component with cart badge"
```

---

### Task 6: Create CSS Styles

**Files:**
- Create: `css/styles.css`

**Step 1: Write base styles**

```css
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
    background-color: #f5f7fa;
    color: #333;
    line-height: 1.6;
}

/* Navbar */
.navbar {
    background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
    padding: 1rem 2rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.nav-brand h1 {
    color: white;
    font-size: 1.5rem;
    cursor: pointer;
}

.nav-links {
    list-style: none;
    display: flex;
    gap: 2rem;
}

.nav-links a {
    color: rgba(255,255,255,0.9);
    text-decoration: none;
    font-weight: 500;
    transition: color 0.2s;
}

.nav-links a:hover,
.nav-links a.active {
    color: white;
}

.cart-badge {
    background: #ef4444;
    color: white;
    padding: 0.1rem 0.5rem;
    border-radius: 1rem;
    font-size: 0.75rem;
    margin-left: 0.25rem;
}

/* Main container */
#app {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
}

/* Products grid */
.products-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 2rem;
}

/* Product card */
.product-card {
    background: white;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(0,0,0,0.08);
    transition: transform 0.2s, box-shadow 0.2s;
}

.product-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 25px rgba(0,0,0,0.12);
}

.product-card img {
    width: 100%;
    height: 200px;
    object-fit: cover;
}

.product-card-body {
    padding: 1.25rem;
}

.product-card h3 {
    font-size: 1.1rem;
    margin-bottom: 0.5rem;
    color: #1e3a8a;
}

.product-card .price {
    font-size: 1.25rem;
    font-weight: 700;
    color: #3b82f6;
}

.product-card .rating {
    color: #f59e0b;
    margin: 0.5rem 0;
}

.btn {
    background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
    color: white;
    border: none;
    padding: 0.75rem 1.5rem;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 600;
    width: 100%;
    transition: opacity 0.2s;
}

.btn:hover {
    opacity: 0.9;
}

.btn-secondary {
    background: #e5e7eb;
    color: #374151;
}

/* Filter */
.filter-bar {
    margin-bottom: 2rem;
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
}

.filter-btn {
    background: white;
    border: 2px solid #e5e7eb;
    padding: 0.5rem 1rem;
    border-radius: 20px;
    cursor: pointer;
    transition: all 0.2s;
}

.filter-btn:hover,
.filter-btn.active {
    background: #3b82f6;
    border-color: #3b82f6;
    color: white;
}

/* Product detail */
.product-detail {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 3rem;
    background: white;
    padding: 2rem;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}

.product-detail img {
    width: 100%;
    border-radius: 8px;
}

.product-detail h2 {
    color: #1e3a8a;
    margin-bottom: 1rem;
}

.product-detail .price {
    font-size: 2rem;
    font-weight: 700;
    color: #3b82f6;
    margin-bottom: 1rem;
}

.quantity-selector {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin: 1.5rem 0;
}

.quantity-selector button {
    width: 40px;
    height: 40px;
    border: 2px solid #e5e7eb;
    background: white;
    border-radius: 8px;
    cursor: pointer;
    font-size: 1.25rem;
}

.quantity-selector span {
    font-size: 1.25rem;
    font-weight: 600;
    min-width: 40px;
    text-align: center;
}

/* Cart */
.cart-container {
    background: white;
    border-radius: 12px;
    padding: 2rem;
    box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}

.cart-item {
    display: grid;
    grid-template-columns: 80px 1fr auto;
    gap: 1.5rem;
    align-items: center;
    padding: 1.5rem 0;
    border-bottom: 1px solid #e5e7eb;
}

.cart-item:last-child {
    border-bottom: none;
}

.cart-item img {
    width: 80px;
    height: 80px;
    object-fit: cover;
    border-radius: 8px;
}

.cart-summary {
    margin-top: 2rem;
    padding-top: 1.5rem;
    border-top: 2px solid #e5e7eb;
}

.cart-summary .total {
    font-size: 1.5rem;
    font-weight: 700;
    color: #1e3a8a;
    margin-bottom: 1.5rem;
}

/* Checkout form */
.checkout-form {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 2rem;
}

.form-group {
    margin-bottom: 1.25rem;
}

.form-group.full-width {
    grid-column: 1 / -1;
}

.form-group label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
    color: #374151;
}

.form-group input,
.form-group textarea {
    width: 100%;
    padding: 0.75rem;
    border: 2px solid #e5e7eb;
    border-radius: 8px;
    font-size: 1rem;
    transition: border-color 0.2s;
}

.form-group input:focus,
.form-group textarea:focus {
    outline: none;
    border-color: #3b82f6;
}

.order-summary {
    background: #f9fafb;
    padding: 1.5rem;
    border-radius: 8px;
    height: fit-content;
}

.order-summary h3 {
    color: #1e3a8a;
    margin-bottom: 1rem;
}

.order-item {
    display: flex;
    justify-content: space-between;
    padding: 0.5rem 0;
    border-bottom: 1px solid #e5e7eb;
}

/* Success message */
.success-message {
    text-align: center;
    padding: 3rem;
    background: white;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}

.success-message h2 {
    color: #059669;
    font-size: 2rem;
    margin-bottom: 1rem;
}

/* Empty states */
.empty-state {
    text-align: center;
    padding: 3rem;
    color: #6b7280;
}

/* Responsive */
@media (max-width: 768px) {
    .product-detail {
        grid-template-columns: 1fr;
    }
    
    .checkout-form {
        grid-template-columns: 1fr;
    }
    
    .cart-item {
        grid-template-columns: 60px 1fr;
    }
    
    .cart-item-actions {
        grid-column: 2;
    }
}
```

**Step 2: Verify file exists**

Run: `ls -la css/styles.css`
Expected: File exists with content

**Step 3: Commit**

```bash
git add css/styles.css
git commit -m "feat: add comprehensive CSS styles with responsive design"
```

---

### Task 7: Create Products Page Component

**Files:**
- Create: `js/components/products.js`

**Step 1: Write products component**

```javascript
const ProductsPage = {
    currentCategory: 'all',

    render() {
        const categories = CATEGORIES;
        const filteredProducts = this.currentCategory === 'all'
            ? PRODUCTS
            : PRODUCTS.filter(p => p.category === this.currentCategory);

        return `
            <div class="filter-bar">
                ${categories.map(cat => `
                    <button class="filter-btn ${this.currentCategory === cat ? 'active' : ''}" 
                            data-category="${cat}">
                        ${cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </button>
                `).join('')}
            </div>
            <div class="products-grid">
                ${filteredProducts.map(product => this.renderCard(product)).join('')}
            </div>
        `;
    },

    renderCard(product) {
        return `
            <div class="product-card">
                <img src="${product.image}" alt="${product.name}">
                <div class="product-card-body">
                    <h3>${product.name}</h3>
                    <div class="rating">${'★'.repeat(Math.floor(product.rating))}${'☆'.repeat(5 - Math.floor(product.rating))}</div>
                    <p class="price">$${product.price.toFixed(2)}</p>
                    <button class="btn" onclick="ProductsPage.addToCart(${product.id})">
                        Add to Cart
                    </button>
                </div>
            </div>
        `;
    },

    mount() {
        document.getElementById('app').innerHTML = this.render();
        this.attachFilterListeners();
    },

    attachFilterListeners() {
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.currentCategory = e.target.dataset.category;
                this.mount();
            });
        });
    },

    addToCart(productId) {
        const product = PRODUCTS.find(p => p.id === productId);
        CartStore.addItem(product, 1);
        this.showNotification('Added to cart!');
    },

    showNotification(message) {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: #059669;
            color: white;
            padding: 1rem 2rem;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 1000;
            animation: slideIn 0.3s ease;
        `;
        notification.textContent = message;
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 2000);
    }
};

Router.register('products', () => ProductsPage.mount());
```

**Step 2: Verify file exists**

Run: `ls -la js/components/products.js`
Expected: File exists with content

**Step 3: Commit**

```bash
git add js/components/products.js
git commit -m "feat: create products page with category filter"
```

---

### Task 8: Create Product Detail Component

**Files:**
- Create: `js/components/product-detail.js`

**Step 1: Write product detail component**

```javascript
const ProductDetailPage = {
    quantity: 1,

    render(productId) {
        const product = PRODUCTS.find(p => p.id === parseInt(productId));
        
        if (!product) {
            return '<div class="empty-state"><h2>Product not found</h2></div>';
        }

        return `
            <div class="product-detail">
                <div class="product-image">
                    <img src="${product.image}" alt="${product.name}">
                </div>
                <div class="product-info">
                    <h2>${product.name}</h2>
                    <div class="rating">${'★'.repeat(Math.floor(product.rating))}${'☆'.repeat(5 - Math.floor(product.rating))} (${product.rating})</div>
                    <p class="price">$${product.price.toFixed(2)}</p>
                    <p>${product.description}</p>
                    <div class="quantity-selector">
                        <button onclick="ProductDetailPage.changeQuantity(-1)">-</button>
                        <span>${this.quantity}</span>
                        <button onclick="ProductDetailPage.changeQuantity(1)">+</button>
                    </div>
                    <button class="btn" onclick="ProductDetailPage.addToCart(${product.id})">
                        Add to Cart
                    </button>
                    <button class="btn btn-secondary" style="margin-top: 1rem;" onclick="Router.goTo('products')">
                        ← Back to Products
                    </button>
                </div>
            </div>
        `;
    },

    mount(params) {
        this.quantity = 1;
        document.getElementById('app').innerHTML = this.render(params.id);
    },

    changeQuantity(delta) {
        this.quantity = Math.max(1, this.quantity + delta);
        this.mount(Router.currentRoute.params);
    },

    addToCart(productId) {
        const product = PRODUCTS.find(p => p.id === productId);
        CartStore.addItem(product, this.quantity);
        ProductsPage.showNotification('Added to cart!');
    }
};

Router.register('product-detail', (params) => ProductDetailPage.mount(params));
```

**Step 2: Verify file exists**

Run: `ls -la js/components/product-detail.js`
Expected: File exists with content

**Step 3: Commit**

```bash
git add js/components/product-detail.js
git commit -m "feat: create product detail page with quantity selector"
```

---

### Task 9: Create Cart Page Component

**Files:**
- Create: `js/components/cart.js`

**Step 1: Write cart component**

```javascript
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
        CartStore.updateQuantity(productId, quantity);
    },

    removeItem(productId) {
        CartStore.removeItem(productId);
    }
};

Router.register('cart', () => CartPage.mount());
```

**Step 2: Verify file exists**

Run: `ls -la js/components/cart.js`
Expected: File exists with content

**Step 3: Commit**

```bash
git add js/components/cart.js
git commit -m "feat: create cart page with quantity edit and remove"
```

---

### Task 10: Create Checkout Component

**Files:**
- Create: `js/components/checkout.js`

**Step 1: Write checkout component**

```javascript
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
                            <span>${item.name} x${item.quantity}</span>
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
                    Thank you for your purchase, ${order.name}!
                </p>
                <p style="color: #6b7280;">
                    Order total: <strong>$${order.total.toFixed(2)}</strong>
                </p>
                <p style="color: #6b7280; margin-top: 1rem;">
                    A confirmation email has been sent to ${order.email}
                </p>
                <button class="btn" style="width: auto; margin-top: 2rem;" onclick="Router.goTo('products')">
                    Continue Shopping
                </button>
            </div>
        `;
    }
};

Router.register('checkout', () => CheckoutPage.mount());
```

**Step 2: Verify file exists**

Run: `ls -la js/components/checkout.js`
Expected: File exists with content

**Step 3: Commit**

```bash
git add js/components/checkout.js
git commit -m "feat: create checkout page with form validation"
```

---

### Task 11: Create Main App Initialization

**Files:**
- Create: `js/app.js`

**Step 1: Write app initialization**

```javascript
document.addEventListener('DOMContentLoaded', () => {
    Header.mount();
    
    if (!window.location.hash) {
        window.location.hash = 'products';
    } else {
        Router.navigate();
    }
    
    console.log('TechShop initialized!');
});
```

**Step 2: Verify file exists**

Run: `ls -la js/app.js`
Expected: File exists with content

**Step 3: Commit**

```bash
git add js/app.js
git commit -m "feat: add main app initialization"
```

---

### Task 12: Verify All Pages and Navigation

**Files:**
- Verify: All created files

**Step 1: List all created files**

Run: `find . -name "*.html" -o -name "*.css" -o -name "*.js" | grep -v node_modules | sort`

Expected output:
```
./css/styles.css
./index.html
./js/app.js
./js/components/cart.js
./js/components/checkout.js
./js/components/header.js
./js/components/product-detail.js
./js/components/products.js
./js/data.js
./js/router.js
./js/store.js
```

**Step 2: Test in browser (manual verification)**

Open `index.html` in a browser and verify:
1. Products page loads with grid of products
2. Category filter buttons work
3. Click on product navigates to detail page
4. "Add to Cart" buttons work (badge updates)
5. Cart page shows added items
6. Quantity edit and remove work in cart
7. Checkout form validates and submits
8. Success message shows after order

**Step 3: Final commit**

```bash
git add -A
git commit -m "feat: complete e-commerce SPA prototype"
```

---

## Testing Checklist

- [ ] Products page displays 10 products in responsive grid
- [ ] Category filter shows correct products
- [ ] Product detail page shows full info
- [ ] Add to cart works from both pages
- [ ] Cart badge updates in real-time
- [ ] Cart persists after page refresh
- [ ] Cart quantity edit works
- [ ] Cart item removal works
- [ ] Checkout form validates required fields
- [ ] Order success message displays
- [ ] Navigation works between all pages
- [ ] Responsive design works on mobile

---

Plan complete and saved to `docs/plans/2026-03-04-ecommerce-prototype.md`. Two execution options:

**1. Subagent-Driven (this session)** - I dispatch fresh subagent per task, review between tasks, fast iteration

**2. Parallel Session (separate)** - Open new session with executing-plans, batch execution with checkpoints

**Which approach?**

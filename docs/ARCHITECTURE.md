# Architecture

Technical deep-dive into vibe-ecommerce's design decisions, module responsibilities, and data flow.

---

## Overview

A full-stack single-page application (SPA) with two runtime environments:

### 生产环境（Production）
Frontend on Vercel, backend on Azure Linux server with SQLite.

```
Vercel (Frontend)                    Azure Linux Server (Backend)
index.html                           server/app.js (Express, port 3001)
  └── loads scripts in order:          └── routes/products.js
      data.js (API client)             └── routes/orders.js
      utils.js → store.js              └── db.js (Knex + SQLite)
      router.js → components/*
      app.js
```

**Network path (production)**:
```
Browser → https://shop-api.huaqloud.com (NPM Docker, port 443)
        → iptables (172.17.0.0/16 → port 3001)
        → Node.js Express (localhost:3001)
        → SQLite (server/data/shop.db)
```

### 本地开发环境（Docker Compose）
三容器架构，一键启动，PostgreSQL 数据库。

```
Browser → http://localhost (port 80)
        → nginx:alpine (frontend container)
            ├── /          → static files (index.html, css/, js/)
            └── /api/*     → proxy → backend:3001
                               → Node.js Express (backend container)
                               → PostgreSQL (db container, port 5432)
```

**双模式切换**（`server/db.js`）:
```javascript
const isPg = !!process.env.DATABASE_URL;
// DATABASE_URL 存在 → PostgreSQL（Docker）
// DATABASE_URL 不存在 → SQLite（生产/本地无 Docker）
```

---

## Frontend Modules

### `js/data.js` — API Client

Exports two API clients that wrap all backend communication:

```javascript
// Products
ProductAPI.getAll({ category, search, sort })  // GET /api/products
ProductAPI.getById(id)                          // GET /api/products/:id

// Orders
OrderAPI.create({ name, email, address, items, total })  // POST /api/orders
OrderAPI.getById(id)                                      // GET /api/orders/:id
```

**API base**: `https://shop-api.huaqloud.com`

**Phase 3 change**: Replaced hardcoded `PRODUCTS` array with async fetch calls. All components that previously read `PRODUCTS.find()` now call `await ProductAPI.getById()`.

---

### `js/utils.js` — Security Utilities

```javascript
function escapeHtml(str) { ... }
```

All user-facing strings rendered via `innerHTML` must pass through `escapeHtml()`. Identified as CRITICAL in Phase 1 code quality review. No exceptions.

---

### `js/store.js` — Cart State

Single source of truth for cart. localStorage with try/catch fallback (private/incognito mode throws `SecurityError`).

```javascript
CartStore.addItem(product, quantity)
CartStore.removeItem(productId)
CartStore.updateQuantity(productId, quantity)
CartStore.getCart()        // → array
CartStore.getCartTotal()   // → number
CartStore.clearCart()
```

**Phase 4 plan**: Interface stays identical. Implementation switches to server-side cart for authenticated users. Guest cart stays in localStorage.

---

### `js/router.js` — Hash-Based SPA Router

```
#products                → ProductsPage.mount()
#product-detail?id=N     → ProductDetailPage.mount({id: N})
#cart                    → CartPage.mount()
#checkout                → CheckoutPage.mount()
#order-confirmation      → OrderConfirmationPage.mount()
```

Hash-based routing works without a server and requires no Vercel configuration. Browser back/forward works natively.

---

### `js/components/products.js` — Product Listing

Unified state for search + filter + sort:

```javascript
const ProductsPage = {
    currentCategory: 'all',
    searchQuery: '',      // debounced 300ms before API call
    sortOrder: 'default',
    products: [],         // populated from API
}
```

Single `fetchAndRender()` entry point — all state changes (search/filter/sort) go through the same path, preventing state desync. Search is debounced 300ms to avoid per-keystroke API calls.

Card click → product detail page. "Add to Cart" button uses `event.stopPropagation()` to prevent bubbling to card click handler.

---

### `js/components/checkout.js` + `js/components/order-confirmation.js`

**Phase 3 order data flow** (replaced sessionStorage):

```
CheckoutPage.handleSubmit()
  → POST /api/orders → { orderId }
  → sessionStorage.setItem('lastOrderId', orderId)
  → CartStore.clearCart()
  → Router.goTo('order-confirmation')

OrderConfirmationPage.mount()
  → orderId = sessionStorage.getItem('lastOrderId')
  → GET /api/orders/:orderId → { order + items }
  → renders confirmation
```

sessionStorage stores only the `orderId` (not the full order). Full order data comes from the API. This means order data persists correctly even if the page is refreshed.

---

## Backend Modules

### `server/app.js` — Express Entry Point

```javascript
app.use(helmet())           // security headers
app.use(cors({ origin: ['https://vibe-ecommerce-seven.vercel.app', ...] }))
app.use(express.json())
app.use('/api/products', require('./routes/products'))
app.use('/api/orders', require('./routes/orders'))
app.get('/health', ...)     // health check
```

CORS whitelist: Vercel frontend origin + localhost for dev. Not wildcard.

---

### `server/db.js` — Database Init

Knex configured for `better-sqlite3`. Creates tables and seeds 10 products on first run.

```javascript
const knex = require('knex')({
  client: 'better-sqlite3',
  connection: { filename: './data/shop.db' }
});
```

**Migration path to Azure SQL DB** (Phase 5/6): change `client` to `'mssql'` and `connection` to Azure credentials. All business logic in routes stays unchanged — Knex abstracts the dialect.

---

### `server/routes/products.js` — Product Routes

```
GET /api/products
  ?category=audio          → WHERE category = 'audio'
  ?search=head             → WHERE name ILIKE '%head%'
  ?sort=price_asc          → ORDER BY price ASC
  (combinable)

GET /api/products/:id      → single product, 404 if not found
```

---

### `server/routes/orders.js` — Order Routes

```
POST /api/orders
  body: { name, email, address, items[], total }
  → knex.transaction(): INSERT orders + INSERT order_items
  → returns { orderId }

GET /api/orders/:id
  → JOIN order_items + products
  → returns { order + items[] }
```

**Transaction**: order row and all order_items are inserted atomically. If items insert fails, order row is rolled back.

**Snapshot price**: `order_items.price` stores the price at order time, not a foreign key to the current product price. Product prices can change; historical order totals must not.

---

## Data Flow: Full Purchase

```
1. ProductsPage loads
   → ProductAPI.getAll() → GET /api/products
   → renders product grid

2. User clicks product card
   → Router.goTo('product-detail', {id})
   → ProductAPI.getById(id) → GET /api/products/:id
   → renders detail page

3. User adds to cart
   → CartStore.addItem(product, quantity)
   → persists to localStorage

4. User submits checkout
   → OrderAPI.create({name, email, address, items, total})
   → POST /api/orders → { orderId }
   → sessionStorage.setItem('lastOrderId', orderId)
   → CartStore.clearCart()
   → Router.goTo('order-confirmation')

5. Order confirmation loads
   → OrderAPI.getById(orderId) → GET /api/orders/:orderId
   → renders order summary with items + total
```

---

## Security

### XSS Prevention
All `innerHTML` assignments use `escapeHtml()`. No exceptions.

### Input Validation
- URL param IDs: `parseInt()` + `isNaN()` check
- Cart quantities: `Math.max(1, quantity)` — no negatives
- Checkout form: HTML5 `required` + `type="email"` + card pattern
- API body: required field checks + type validation before DB write

### Network Security
- Port 3001 not exposed to internet — iptables allows only Docker network (172.17.0.0/16)
- HTTPS via NPM (Let's Encrypt auto-renewal)
- `helmet()` sets security headers (CSP, HSTS, X-Frame-Options, etc.)

### localStorage Error Handling
try/catch on all localStorage operations — `SecurityError` in private/incognito mode falls back to in-memory array.

---

## Phase 4: Authentication Layer

### `js/auth.js` — AuthService

Client-side auth utility. Manages token lifecycle:

```javascript
AuthService.register(email, password)   // POST /api/auth/register
AuthService.login(email, password)      // POST /api/auth/login → stores token + user
AuthService.logout()                    // POST /api/auth/logout → clears cookie + localStorage
AuthService.isLoggedIn()                // → boolean
AuthService.getToken()                  // → accessToken string
AuthService.getUser()                   // → { id, email }
AuthService.getOrders()                 // GET /api/users/me/orders (with Bearer token)
```

**Token storage**: accessToken in localStorage, refreshToken in httpOnly cookie (set by server). Frontend never reads the refresh token.

### `server/routes/auth.js` — Auth Routes

```
POST /api/auth/register   → bcrypt hash → INSERT users
POST /api/auth/login      → bcrypt compare → JWT access (15min) + refresh cookie (7d)
POST /api/auth/refresh    → verify cookie → new accessToken
POST /api/auth/logout     → clearCookie
```

Rate limited: 10 req/15min on `/login` and `/register` only.

### `server/middleware/auth.js` — JWT Middleware

Reads `Authorization: Bearer <token>`, verifies with `JWT_SECRET`, attaches `req.user = { id, email }`.

### `server/routes/users.js` — User Routes

```
GET /api/users/me/orders  → verifyToken → orders WHERE user_id = req.user.id (with items)
```

### Auth Data Flow

```
Register:
  RegisterPage → AuthService.register() → POST /api/auth/register
  → auto-login → AuthService.login() → POST /api/auth/login
  → { accessToken, user } stored → Router.goTo('account')

Login:
  LoginPage → AuthService.login() → POST /api/auth/login
  → accessToken → localStorage
  → refreshToken → httpOnly cookie (server-set)
  → user { id, email } → localStorage
  → HeaderComponent.render() → shows username

Checkout (logged-in):
  CheckoutPage → OrderAPI.create(order, token)
  → POST /api/orders with Authorization header
  → server reads token → user_id attached to order

Order History:
  AccountPage → AuthService.getOrders()
  → GET /api/users/me/orders with Bearer token
  → renders order list with items
```

---

## Phase 5: Security + Performance Layer

### `server/middleware/validate.js` — Input Validation

express-validator schemas for all mutating routes:

```javascript
validateOrder     // name, email, address, items[], total
validateRegister  // email, password (min 6)
handleValidationErrors  // 422 + field-level error array
```

Applied as middleware chains:
```javascript
router.post('/', validateOrder, handleValidationErrors, async (req, res) => { ... })
router.post('/register', validateRegister, handleValidationErrors, async (req, res) => { ... })
```

### API Response Caching (`server/routes/products.js`)

In-memory cache for GET /api/products (no-filter):

```javascript
const cache = { data: null, ts: 0, TTL: 5 * 60 * 1000 };
// Cache bypassed when ?category= filter is present
```

### Frontend Lazy Loading (`js/components/products.js`)

`loading="lazy"` on all `<img>` tags. IntersectionObserver adds fade-in animation as product cards enter viewport:

```javascript
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(..., { rootMargin: '50px' });
  // images start opacity:0, transition to 1 on load + intersection
}
```

### Security Headers (`server/app.js`)

```javascript
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      ...helmet.contentSecurityPolicy.getDefaultDirectives(),
      'img-src': ["'self'", 'data:', 'https://images.unsplash.com'],
    }
  }
}));
app.use(express.json({ limit: '10kb' }));  // prevent large payload attacks
```

---

## Phase 6: Docker 三容器架构

### `docker-compose.yml` — 服务编排

三个服务通过 `vibe-network` 内部通信，只有 frontend 暴露端口到宿主机：

```yaml
services:
  db:       postgres:16-alpine  # 仅容器内可访问
  backend:  node:22-alpine      # 仅容器内可访问（通过 nginx 代理）
  frontend: nginx:alpine        # 暴露 ${FRONTEND_PORT:-80}:80
```

`db` 服务配置 healthcheck，`backend` 使用 `depends_on: db: condition: service_healthy`，确保数据库就绪后再启动后端。

### `docker/frontend/nginx.conf` — 反向代理

```nginx
location /api/ { proxy_pass http://backend:3001; }  # API 代理
location /      { try_files $uri $uri/ /index.html; }  # SPA fallback
```

容器名 `backend` 在 Docker network 内自动解析为 IP，无需硬编码。

### `Makefile` — 学员操作入口

```bash
make up     # cp .env.example .env (if not exists) + docker compose up -d --build
make down   # docker compose down
make reset  # docker compose down -v + up（清空 volume，重新 seed）
make logs   # docker compose logs -f
make ps     # docker compose ps
```

### 环境变量（`.env.example`）

| 变量 | 默认值 | 说明 |
|------|--------|------|
| `POSTGRES_DB` | `vibe_shop` | 数据库名 |
| `POSTGRES_USER` | `vibe` | 数据库用户 |
| `POSTGRES_PASSWORD` | `vibepass` | 数据库密码 |
| `JWT_SECRET` | `local-dev-secret-...` | JWT 签名密钥（生产必须修改）|
| `FRONTEND_PORT` | `80` | 前端暴露端口（冲突时改为 8081 等）|

---

## Known Technical Debt

| Item | Location | Notes |
|------|----------|-------|
| Cart state is client-only (localStorage) | `js/store.js` | 演示项目可接受 |
| No password reset / account recovery | `server/routes/auth.js` | 需要邮件服务 |
| No email verification | `server/routes/auth.js` | 需要邮件服务 |
| No real payment processing | `js/components/checkout.js` | 演示项目可接受 |
| accessToken stored in localStorage (XSS risk) | `js/auth.js` | 演示项目可接受 |
| Rate limiting in-memory only (no Redis) | `server/app.js` | 单进程够用 |
| JWT logout doesn't invalidate token (no blacklist) | `server/routes/auth.js` | 15min 自动过期 |
| No unit/integration tests | — | 手动验收覆盖关键路径 |
| `server/node_modules/` in git history | git | Accepted debt |

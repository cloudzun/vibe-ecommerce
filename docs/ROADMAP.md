# Roadmap

Full evolution plan for vibe-ecommerce, from vanilla JS prototype to full-stack production app.

---

## Architecture Evolution

```
Phase 1-2 (Current)
┌─────────────────────────────┐
│  Vercel (Static Hosting)    │
│  Vanilla JS SPA             │
│  localStorage (cart state)  │
└─────────────────────────────┘

Phase 3-4
┌─────────────────────────────┐    ┌──────────────────────────────┐
│  Vercel (Frontend)          │───▶│  Linux Server (Backend)      │
│  Vanilla JS SPA             │    │  Node.js + Express           │
│  fetch() API calls          │    │  SQLite → PostgreSQL         │
└─────────────────────────────┘    └──────────────────────────────┘

Phase 5+
┌─────────────────────────────┐    ┌──────────────────────────────┐
│  Vercel (Frontend)          │───▶│  Linux Server (Backend)      │
│  JWT auth headers           │    │  Auth middleware (JWT)       │
│  Optimized assets           │    │  PostgreSQL                  │
└─────────────────────────────┘    │  Redis (cache/sessions)      │
                                   └──────────────────────────────┘
```

---

## Phase 1 — Vibe Coding Prototype ✅

**Goal**: Working shopping flow in minimum time.

**Delivered**:
- 10 electronics products with categories
- Product listing with category filter
- Product detail page
- Shopping cart with localStorage persistence
- Checkout form
- Hash-based SPA routing
- XSS protection (`escapeHtml()`)
- localStorage crash protection (try/catch + in-memory fallback)
- 404 route handling

**Stats**: 927 lines, 11 files, 12 commits

**Known issues going in**: No search, no sort, placeholder images, no order confirmation, no tests.

---

## Phase 2 — Frontend Polish ✅

**Goal**: Make it feel like a real store, not a demo.

**Delivered**:
- Product cards clickable (navigate to detail page)
- Search bar with real-time filtering
- Sort by: price low→high, price high→low, top rated
- Order confirmation page with order ID, item list, total
- Real product images (Unsplash, matched to product names)
- `sessionStorage` for order data (auto-clears on tab close)

**Context document**: [`docs/briefs/2026-03-04-phase2-frontend.md`](briefs/2026-03-04-phase2-frontend.md)

---

## Phase 3 — Backend API ✅

**Goal**: Replace hardcoded data with a real API. First server-side state.

**Tech stack**:
- Runtime: Node.js v22
- Framework: Express.js
- Database: SQLite (via `better-sqlite3`)
- Deployment: existing Linux server (not Vercel serverless)

**Why Node.js + SQLite over alternatives?**
- Same language as frontend — lower context switching cost
- SQLite: zero config, file-based, sufficient for < 10k products/orders
- No additional cloud costs
- Straightforward migration path to PostgreSQL when needed

**API endpoints to build**:

```
GET  /api/products          → list all products (with filter/sort params)
GET  /api/products/:id      → single product
POST /api/orders            → submit order, returns orderId
GET  /api/orders/:id        → order details (for confirmation page)
```

**Frontend changes**:
- `js/data.js` → replaced by `fetch('/api/products')`
- `js/store.js` → cart still localStorage (server cart in Phase 4)
- `js/components/checkout.js` → POST to `/api/orders`
- `js/components/order-confirmation.js` → GET from `/api/orders/:id` (drop sessionStorage)

**Database schema**:

```sql
CREATE TABLE products (
    id          INTEGER PRIMARY KEY,
    name        TEXT NOT NULL,
    category    TEXT NOT NULL,
    price       REAL NOT NULL,
    image       TEXT,
    description TEXT,
    rating      REAL DEFAULT 0
);

CREATE TABLE orders (
    id         TEXT PRIMARY KEY,      -- ORD-<timestamp>-<random>
    name       TEXT NOT NULL,
    email      TEXT NOT NULL,
    address    TEXT NOT NULL,
    total      REAL NOT NULL,
    created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE order_items (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id   TEXT REFERENCES orders(id),
    product_id INTEGER REFERENCES products(id),
    quantity   INTEGER NOT NULL,
    price      REAL NOT NULL           -- snapshot price at order time
);
```

**Delivered**:
- `server/` — Express + Knex + SQLite backend (4 API endpoints)
- `https://shop-api.huaqloud.com` — public HTTPS API via Nginx Proxy Manager
- Frontend fully migrated to `fetch()` — no hardcoded product data
- Checkout POSTs to API, order confirmation GETs from API
- pm2 process management + systemd auto-start
- iptables rule: Docker network → port 3001 only (not public)

**Context document**: [`docs/briefs/2026-03-05-phase3-backend.md`](briefs/2026-03-05-phase3-backend.md)  
**Retrospective**: [`docs/retrospectives/2026-03-05-phase3-retrospective.md`](retrospectives/2026-03-05-phase3-retrospective.md)

---

## Phase 4 — User Authentication ✅

**Goal**: Users can register, log in, and see their order history.

**Auth approach**: JWT (JSON Web Tokens)
- Access token: 15-minute expiry
- Refresh token: 7-day expiry, stored in httpOnly cookie
- Passwords: bcrypt (cost factor 12)

**New API endpoints**:

```
POST /api/auth/register     → create account
POST /api/auth/login        → returns access + refresh tokens
POST /api/auth/refresh      → exchange refresh token for new access token
POST /api/auth/logout       → invalidate refresh token
GET  /api/users/me/orders   → authenticated user's order history
```

**Database additions**:

```sql
CREATE TABLE users (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    email         TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at    TEXT DEFAULT (datetime('now'))
);

ALTER TABLE orders ADD COLUMN user_id INTEGER REFERENCES users(id);
-- NULL = guest order (backward compatible)
```

**Frontend changes**:
- New pages: `#login`, `#register`, `#account` (order history)
- Header: show username when logged in, logout button
- Checkout: pre-fill name/email if logged in; associate order with user
- Cart: migrate to server-side when logged in (localStorage for guests)

**Security requirements** (Gate 5 checklist):
- [x] Passwords never stored or logged in plaintext (bcrypt cost 12)
- [x] JWT secret in environment variable via pm2 ecosystem.config.js
- [x] All authenticated endpoints validate token on every request
- [x] Refresh tokens invalidated on logout (cookie cleared)
- [x] Rate limiting on `/api/auth/login` and `/api/auth/register` (10 req/15min)
- [x] CORS restricted to known frontend origin

**Delivered**:
- `server/routes/auth.js` — register / login / refresh / logout
- `server/middleware/auth.js` — JWT verifyToken middleware
- `server/routes/users.js` — GET /api/users/me/orders
- `server/ecosystem.config.js` — pm2 env config with JWT_SECRET
- `js/auth.js` — AuthService (token storage, login, logout, getOrders)
- `js/components/login.js` — #login page
- `js/components/register.js` — #register page (auto-login after register)
- `js/components/account.js` — #account order history page
- Guest orders remain valid (user_id = NULL, backward compatible)
- 15/15 acceptance tests passed

**Context document**: [`docs/briefs/2026-03-05-phase4-auth.md`](briefs/2026-03-05-phase4-auth.md)

---

## Phase 5 — Performance + Security Hardening ✅

**Delivered** (2026-03-06, commit `8e819e6`):

**Module A — Input Security**:
- `express-validator` installed; validation chains on all routes
- POST /api/orders: validates name (1-100), email, address (1-200), items (non-empty array), total (>0)
- POST /api/auth/register: validates email format + password min 6 chars (replaced manual checks)
- JSON request body limit: 10kb (prevent large payload attacks)
- helmet CSP customized: `img-src` allows `https://images.unsplash.com`
- 422 responses with field-level error messages

**Module B — Frontend Performance + Image Fixes**:
- `loading="lazy"` on all `<img>` tags (products, product-detail, cart)
- `IntersectionObserver` in products page: images fade in as they enter viewport
- GET /api/products: in-memory cache (5-minute TTL); category filter bypasses cache
- 4 wrong product images fixed (USB-C Hub, Webcam HD, Portable SSD, Monitor Stand)

**Acceptance results**: 7/7 tasks, all GATE 3+4 checks passed

**Context document**: [`docs/briefs/2026-03-06-phase5-security-performance.md`](briefs/2026-03-06-phase5-security-performance.md)

---

## Phase 6 — SDD-Driven Refactor 🔜

**Trigger condition**: Any of:
- Codebase exceeds 5,000 lines
- A new contributor joins
- Adding a feature requires touching 5+ files

**Approach**: Brownfield SDD (Specification-Driven Development)

Four-layer document structure:

| Layer | Name | Content |
|-------|------|---------|
| L1 | Constitution | System-wide invariants ("all API endpoints require auth except /products") |
| L2 | Specification | Module-level contracts and data schemas |
| L3 | Plan | Refactor plan with module boundaries |
| L4 | Tasks | Concrete file-level task list |

**Likely refactor targets**:
- Extract API client layer (`js/api.js`) — currently fetch() calls scattered in components
- Separate business logic from rendering in components
- Standardize error handling across all async operations

---

## Decision Log

Key architectural decisions and their rationale, for future reference:

| Decision | Choice | Reason | Revisit When |
|----------|--------|--------|--------------|
| Frontend framework | None (Vanilla JS) | Simplicity, no build tools | Phase 6 if complexity warrants |
| Routing | Hash-based | Works without server | Phase 5 (consider history API) |
| Cart persistence | localStorage | No backend in Phase 1-2 | Phase 4 (server cart for logged-in users) |
| Order temp storage | ~~sessionStorage~~ → API (Phase 3) | Replaced with real order API | ✅ Done |
| Backend runtime | Node.js | Same language as frontend | — |
| Database | SQLite | Zero config; Knex abstracts dialect for future migration | Phase 5/6 → Azure SQL DB |
| Query builder | Knex.js | SQLite + MSSQL dialect — migration = config change only | — |
| Process manager | pm2 + systemd | Auto-restart, log management | — |
| Reverse proxy | Nginx Proxy Manager (Docker) | Already running, Web UI, auto SSL | — |
| API domain | shop-api.huaqloud.com | Dedicated subdomain, clean separation | — |
| Auth | JWT (access 15min + refresh 7d httpOnly cookie) | Stateless; refresh cookie prevents XSS token theft | ✅ Done |
| Password hashing | bcrypt cost 12 | Industry standard, tuned for ~100ms hash time | — |
| Rate limiting scope | login + register only (not refresh/logout) | refresh/logout are low-risk; over-limiting breaks UX | ✅ Done |
| Deployment | Vercel (frontend) + Linux (backend) | No Vercel serverless costs | — |

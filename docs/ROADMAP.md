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

## Phase 3 — Backend API 🔜

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

**Quality gates**: Spec review against Phase 3 BRIEF, security review (SQL injection, CORS config, input validation).

---

## Phase 4 — User Authentication 🔜

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
- [ ] Passwords never stored or logged in plaintext
- [ ] JWT secret in environment variable, not in code
- [ ] All authenticated endpoints validate token on every request
- [ ] Refresh tokens invalidated on logout
- [ ] Rate limiting on `/api/auth/login` (prevent brute force)
- [ ] CORS restricted to known frontend origin

---

## Phase 5 — Performance + Security Hardening 🔜

**Performance targets**:

| Metric | Current | Target |
|--------|---------|--------|
| First Contentful Paint | ~800ms | < 500ms |
| Image load (10 products) | all at once | lazy load |
| API response time | N/A | < 200ms p95 |

**Planned optimizations**:
- Image lazy loading via `IntersectionObserver`
- Product API response caching (in-memory, 5-minute TTL)
- CSS minification (manual or simple build step)
- `loading="lazy"` on all `<img>` tags

**Security additions**:
- HTTP security headers (`helmet.js`): CSP, HSTS, X-Frame-Options
- API rate limiting (`express-rate-limit`)
- Request size limits (prevent large payload attacks)
- HTTPS on backend (Let's Encrypt / nginx termination)
- Dependency audit (`npm audit`) as part of deploy checklist

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
| Routing | Hash-based | Works without server | Phase 3 (consider history API) |
| Cart persistence | localStorage | No backend in Phase 1-2 | Phase 4 (server cart for logged-in users) |
| Order temp storage | sessionStorage | Semantic match, auto-clears | Phase 3 (replace with order API) |
| Backend runtime | Node.js | Same language as frontend | — |
| Database | SQLite | Zero config, sufficient scale | Phase 5 if concurrent writes become an issue |
| Auth | JWT | Stateless, standard | — |
| Deployment | Vercel (frontend) + Linux (backend) | No Vercel serverless costs | — |

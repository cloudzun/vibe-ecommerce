# Phase 3 Implementation Plan — Backend API

**Date**: 2026-03-05  
**Status**: ✅ Complete  
**Context document**: [`docs/briefs/2026-03-05-phase3-backend.md`](../briefs/2026-03-05-phase3-backend.md)

---

## Task Breakdown

### E1 — Initialize server/ directory

```
server/
├── app.js              # Express entry point
├── db.js               # Knex + SQLite init + seed
├── package.json
└── routes/
    ├── products.js
    └── orders.js
```

Dependencies: `express`, `knex`, `better-sqlite3`, `cors`

### E2 — `server/db.js` — Database init + seed

- Knex config: `client: 'better-sqlite3'`, `connection: { filename: './data/shop.db' }`
- `initDb()`: create tables if not exist, seed 10 products on first run
- Tables: `products`, `orders`, `order_items`
- `order_items.price` = snapshot price at order time (not FK to current price)

### E3 — `server/routes/products.js`

```
GET /api/products
  ?category=<cat>   → WHERE category = ?
  ?search=<q>       → WHERE name LIKE ?
  ?sort=price_asc   → ORDER BY price ASC
  ?sort=price_desc  → ORDER BY price DESC
  ?sort=rating      → ORDER BY rating DESC

GET /api/products/:id  → 404 if not found
```

### E4 — `server/routes/orders.js`

```
POST /api/orders
  body: { name, email, address, items[], total }
  → knex.transaction(): INSERT orders + INSERT order_items
  → returns { orderId }

GET /api/orders/:id
  → JOIN order_items + products
  → returns { order + items[] }
```

### E5 — `server/app.js` — Express entry point

- `helmet()` security headers
- `cors({ origin: ['https://vibe-ecommerce-seven.vercel.app'] })`
- `express.json()`
- Mount routes
- `GET /health` endpoint

### E6 — Frontend migration

- `js/data.js`: replace hardcoded `PRODUCTS` array with `ProductAPI.getAll()` / `ProductAPI.getById()`
- `js/components/checkout.js`: POST to `/api/orders`
- `js/components/order-confirmation.js`: GET from `/api/orders/:id` (drop sessionStorage)

### E7 — Deployment

- `npm install` on Azure VM
- `server/ecosystem.config.js` for pm2
- `pm2 start ecosystem.config.js && pm2 save`
- `systemctl enable pm2-<user>`
- Nginx Proxy Manager: new proxy host `shop-api.huaqloud.com` → `localhost:3001`
- iptables: allow Docker network (172.17.0.0/16) → port 3001

---

## Verification Steps

```bash
# API endpoints
curl https://shop-api.huaqloud.com/health
curl https://shop-api.huaqloud.com/api/products
curl https://shop-api.huaqloud.com/api/products/1
curl -X POST https://shop-api.huaqloud.com/api/orders \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"t@t.com","address":"123","items":[{"id":1,"quantity":1,"price":79.99}],"total":79.99}'

# Frontend regression
# - Products load from API (not hardcoded)
# - Checkout submits to API
# - Order confirmation reads from API
```

---

## Constraints

- Do NOT change frontend routing or component structure
- Do NOT break Phase 1-2 features (search, sort, cart, order confirmation)
- Do NOT expose port 3001 to public internet directly
- SQLite only — no PostgreSQL yet (Phase 6)
- Knex query builder required (not raw SQL) — enables future dialect migration

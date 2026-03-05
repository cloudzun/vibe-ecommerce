# Phase 3 Context Document — Backend API

**Date**: 2026-03-05  
**Phase**: 3 of 6  
**Status**: ✅ Complete

---

## Project Background

vibe-ecommerce is a vanilla JS SPA e-commerce prototype, built in Phase 1 via Vibe Coding and polished in Phase 2 with search/sort/order confirmation. After Phase 2, the app was fully functional but entirely client-side: product data was hardcoded in `js/data.js`, cart state lived in localStorage, and order data was stored temporarily in sessionStorage.

The app had no server-side state, no persistence beyond the browser, and no path to multi-user or containerized deployment.

## What Was Tried Before

- **Phase 1**: 927-line Vibe Coding prototype. Full shopping flow, but hardcoded data and no backend.
- **Phase 2**: Frontend polish — clickable cards, search, sort, order confirmation page. Introduced sessionStorage for order data as a deliberate temporary measure, with a note to replace in Phase 3.
- **Considered but rejected**: Vercel Postgres (Neon) — locks into Vercel ecosystem, incompatible with future containerization goal. Azure SQL DB — available but premature; adds connection complexity without benefit at current scale.

## Definition of Done / Failure

**Success**:
- `GET /api/products` returns all 10 products from SQLite
- `GET /api/products/:id` returns single product
- `POST /api/orders` creates order + items in DB, returns orderId
- `GET /api/orders/:id` returns order with items
- Frontend loads products via `fetch()` — no hardcoded PRODUCTS array
- Checkout POSTs to API, confirmation page GETs from API
- `https://shop-api.huaqloud.com` accessible from public internet with HTTPS

**Failure lines**:
- Must not break existing cart (localStorage) behavior
- Must not introduce new XSS vectors
- Must not expose 3001 port directly to internet (nginx proxy only)
- sessionStorage for order data must be replaced (not supplemented)

## Who Is Affected

- `js/data.js` — complete rewrite (PRODUCTS array → ProductAPI + OrderAPI)
- `js/components/products.js` — async fetch, loading state
- `js/components/product-detail.js` — async fetch by ID
- `js/components/checkout.js` — POST to API, drop sessionStorage write
- `js/components/order-confirmation.js` — GET from API, drop sessionStorage read
- `js/store.js` — untouched (cart stays localStorage until Phase 4)
- `js/router.js`, `js/utils.js`, `css/styles.css` — untouched

## Constraints

- Vanilla JS frontend — no build tools, no bundler
- Backend: Node.js v22, CommonJS (`require()`), no TypeScript
- Database: SQLite via `better-sqlite3` + Knex query builder
- **Knex required** (not raw SQL) — enables zero-code migration to Azure SQL DB in Phase 5/6
- CORS: allow Vercel frontend origin + localhost for dev
- Port 3001 must not be exposed to internet — nginx proxy manager handles SSL termination
- iptables rule: allow Docker network (172.17.0.0/16) → port 3001 only
- pm2 manages process lifecycle + systemd startup

## Infrastructure Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Database | SQLite | Zero config, sufficient for current scale, Knex abstracts dialect |
| ORM/Query | Knex.js | Supports SQLite + MSSQL dialects — Phase 5/6 migration = config change only |
| Process manager | pm2 | Auto-restart, systemd integration, log management |
| Reverse proxy | Nginx Proxy Manager (Docker) | Already running, Web UI, auto SSL via Let's Encrypt |
| API domain | shop-api.huaqloud.com | Dedicated subdomain, clean separation from frontend |
| CORS | Whitelist Vercel origin | Security — not wildcard |

# Phase 3 Retrospective — Backend API

**Date**: 2026-03-05  
**Duration**: ~2 hours  
**Status**: ✅ Complete

---

## What We Built

Introduced a Node.js + Express backend with SQLite database, replacing all hardcoded frontend data with real API calls. The frontend now fetches products and submits orders through a public HTTPS API endpoint.

**Deliverables**:
- `server/app.js` — Express entry point with CORS, helmet, routing
- `server/db.js` — Knex + SQLite init, schema creation, seed data
- `server/routes/products.js` — GET /api/products (filter/sort/search), GET /api/products/:id
- `server/routes/orders.js` — POST /api/orders (transaction), GET /api/orders/:id
- `js/data.js` — rewritten as `ProductAPI` + `OrderAPI` fetch wrappers
- All 4 frontend components updated to async API calls
- `https://shop-api.huaqloud.com` live with HTTPS

---

## What Went Well

**Knex abstraction paid off immediately**  
The query builder made filter/sort/search composition clean and readable. Adding `whereILike`, `orderBy`, and `where` chains took 10 minutes. More importantly, the mssql dialect is already supported — Phase 5/6 migration to Azure SQL DB is genuinely a config change.

**pm2 + systemd integration was smooth**  
`pm2 startup` generated the correct systemd unit file. The process manager handles crash recovery and log rotation out of the box. No manual service file writing.

**Transaction for order creation**  
Using `knex.transaction()` for the order + order_items insert ensures atomicity. If the items insert fails, the order row is rolled back. This is the correct pattern and was implemented from the start, not as a fix.

**Frontend async refactor was clean**  
The component architecture (each component owns its `mount()`) made the async conversion straightforward. `products.js` got a `fetchAndRender()` pattern with a loading state and debounced search — no race conditions.

---

## What Was Hard

**iptables + Docker networking**  
The most unexpected blocker. The backend was running on port 3001, DNS resolved correctly, NPM config was correct — but HTTPS requests timed out. Root cause: iptables INPUT chain defaulted to DROP, blocking Docker container (NPM) from reaching the host on 3001. Fix: `iptables -I INPUT -p tcp --dport 3001 -s 172.17.0.0/16 -j ACCEPT`. Persistence handled via `/etc/network/if-up.d/` hook.

**Lesson**: When a service runs behind a Docker reverse proxy, always check iptables INPUT policy before debugging the proxy config. The proxy was fine — the firewall was the issue.

**node_modules committed to git**  
`server/node_modules/` was accidentally committed (2,453 files). Should have added `server/node_modules/` to `.gitignore` before the first commit. This bloated the repo history. Mitigation: add `.gitignore` now, but the history is permanent.

---

## Decisions Made

### Why SQLite over Azure SQL DB (for now)

Azure SQL DB is available and production-grade. But Phase 3's goal was to validate the API layer, not the database layer. SQLite eliminates connection string management, firewall rules, and network latency from the debugging surface. When Phase 5/6 introduces containerization, the database migration is one Knex config change.

**Rule**: Don't solve Phase 5 problems in Phase 3.

### Why Knex over raw SQL

Raw SQL would have been faster to write for 4 simple queries. But Knex provides:
1. Dialect portability (SQLite ↔ MSSQL ↔ PostgreSQL)
2. Query composition (filter + sort + search as chainable conditions)
3. Transaction API that works identically across dialects

The 10-minute overhead of learning Knex's API pays back on the first migration.

### Why not expose port 3001 directly

Even with Azure NSG allowing it, direct port exposure means:
- No SSL termination (HTTPS requires cert management)
- No access logging at the proxy layer
- Port number visible in API URLs (bad UX, bad security posture)

NPM handles SSL, logging, and clean URLs. Port 3001 stays internal.

---

## Technical Debt Created

| Item | Location | Plan |
|------|----------|------|
| `server/node_modules/` in git | git history | Add .gitignore, accept history debt |
| Cart still in localStorage | `js/store.js` | Phase 4: server-side cart for logged-in users |
| No API authentication | `server/app.js` | Phase 4: JWT middleware |
| No rate limiting | `server/app.js` | Phase 5: `express-rate-limit` |
| No input sanitization beyond type checks | `server/routes/` | Phase 5: `express-validator` |
| iptables rule not persisted via proper tool | `/etc/network/if-up.d/` | Phase 5/6: migrate to ufw or proper iptables-persistent |

---

## Metrics

| Metric | Value |
|--------|-------|
| Backend files | 4 (app.js, db.js, routes/products.js, routes/orders.js) |
| Backend lines of code | ~180 |
| Frontend files changed | 5 |
| Frontend lines changed | ~200 |
| API endpoints | 4 |
| End-to-end test | ✅ products → order → confirmation |
| Time to first working API | ~45 min |
| Time to full integration | ~2 hours |

---

## What Phase 4 Should Do Differently

1. **Add `.gitignore` before `npm install`** — never commit node_modules
2. **Write infrastructure checklist** — iptables, DNS, NPM config — verify before coding
3. **Test CORS from actual Vercel domain** before declaring done — we tested with curl, not browser

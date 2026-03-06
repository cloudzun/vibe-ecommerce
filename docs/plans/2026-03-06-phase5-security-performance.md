# Phase 5 Implementation Plan — Security + Performance + Image Fixes

**Date**: 2026-03-06  
**Author**: HuaQloud (Architect)

---

## Module A — Input Security (Backend)

### Task A1: Install express-validator + create validation middleware
- **Input**: `server/package.json`
- **Output**: `server/middleware/validate.js` (new file)
- **Steps**:
  1. `cd server && npm install express-validator`
  2. Create `server/middleware/validate.js` with two schemas:
     - `validateOrder`: name(1-100), email(valid), address(1-200), items(array, min 1), total(float, >0)
     - `validateRegister`: email(valid), password(min 6)
  3. Export `{ validateOrder, validateRegister, handleValidationErrors }`
  4. `handleValidationErrors`: middleware that checks `validationResult(req)`, returns 422 `{ success: false, errors: [{field, message}] }` if invalid
- **Verification**: `node --check server/middleware/validate.js`
- **Estimated time**: 10 min

### Task A2: Apply validation to orders route
- **Input**: `server/routes/orders.js`, `server/middleware/validate.js`
- **Output**: `server/routes/orders.js` (modified)
- **Steps**:
  1. Import `{ validateOrder, handleValidationErrors }` from `../middleware/validate`
  2. Add to POST /api/orders: `router.post('/', validateOrder, handleValidationErrors, async (req, res) => ...)`
  3. Do NOT change any other logic
- **Verification**: 
  - `curl -X POST http://localhost:3001/api/orders -H "Content-Type: application/json" -d '{}' → 422`
  - `curl -X POST http://localhost:3001/api/orders -H "Content-Type: application/json" -d '{"name":"","email":"bad","address":"","items":[],"total":-1}' → 422 with field errors`
- **Estimated time**: 5 min

### Task A3: Apply validation to auth register route
- **Input**: `server/routes/auth.js`, `server/middleware/validate.js`
- **Output**: `server/routes/auth.js` (modified)
- **Steps**:
  1. Import `{ validateRegister, handleValidationErrors }` from `../middleware/validate`
  2. Replace manual email/password checks in POST /api/auth/register with middleware
  3. Keep bcrypt, duplicate-email check, and response format unchanged
- **Verification**:
  - `curl -X POST http://localhost:3001/api/auth/register -H "Content-Type: application/json" -d '{"email":"bad","password":"123"}' → 422`
- **Estimated time**: 8 min

### Task A4: Update app.js — body size limit + helmet CSP
- **Input**: `server/app.js`
- **Output**: `server/app.js` (modified)
- **Steps**:
  1. Change `app.use(express.json())` to `app.use(express.json({ limit: '10kb' }))`
  2. Change `app.use(helmet())` to:
     ```javascript
     app.use(helmet({
       contentSecurityPolicy: {
         directives: {
           ...helmet.contentSecurityPolicy.getDefaultDirectives(),
           'img-src': ["'self'", 'data:', 'https://images.unsplash.com'],
         }
       }
     }));
     ```
  3. Do NOT change any other code in app.js
- **Verification**:
  - `curl -s http://localhost:3001/api/products -I | grep -i content-security`
  - Response headers should include `img-src` with unsplash domain
- **Estimated time**: 5 min

---

## Module B — Performance + Image Fixes

### Task B1: Fix wrong product images (database migration)
- **Input**: `server/data/shop.db` (production DB)
- **Output**: `server/migrations/fix-product-images.js` (new file), DB updated
- **Steps**:
  1. Create `server/migrations/fix-product-images.js`:
     ```javascript
     // Idempotent migration — safe to run multiple times
     const knex = require('../db');
     const fixes = [
       { id: 3, image: 'https://images.unsplash.com/photo-1601524909162-ae8725290836?w=400&h=300&fit=crop' },
       { id: 4, image: 'https://images.unsplash.com/photo-1535303311164-664fc9ec6532?w=400&h=300&fit=crop' },
       { id: 5, image: 'https://images.unsplash.com/photo-1639322537228-f710d846310a?w=400&h=300&fit=crop' },
       { id: 9, image: 'https://images.unsplash.com/photo-1616763355548-1b606f439f86?w=400&h=300&fit=crop' },
     ];
     async function run() {
       for (const fix of fixes) {
         await knex('products').where({ id: fix.id }).update({ image: fix.image });
         console.log(`Updated product ${fix.id}`);
       }
       process.exit(0);
     }
     run();
     ```
  2. Run: `node server/migrations/fix-product-images.js`
  3. Verify: `curl http://localhost:3001/api/products | python3 -c "import sys,json; [print(p['id'],p['name'],p['image'][:50]) for p in json.load(sys.stdin)['data'] if p['id'] in [3,4,5,9]]"`
- **Verification**: Products 3, 4, 5, 9 return updated image URLs
- **Estimated time**: 8 min

### Task B2: Add API response caching to products route
- **Input**: `server/routes/products.js`
- **Output**: `server/routes/products.js` (modified)
- **Steps**:
  1. Add simple in-memory cache at top of file:
     ```javascript
     const cache = { data: null, ts: 0, TTL: 5 * 60 * 1000 };
     ```
  2. In GET /api/products handler, check cache before DB query:
     ```javascript
     if (cache.data && Date.now() - cache.ts < cache.TTL) {
       return res.json({ success: true, data: cache.data });
     }
     // ... existing DB query ...
     cache.data = products; cache.ts = Date.now();
     ```
  3. Cache only the all-products list (not individual product queries)
  4. Do NOT cache filtered results (category filter bypasses cache)
- **Verification**:
  - Two consecutive `curl http://localhost:3001/api/products` calls both return 200
  - Second call noticeably faster (check with `-w "%{time_total}"`)
- **Estimated time**: 8 min

### Task B3: Add loading="lazy" to all product images
- **Input**: `js/components/products.js`, `js/components/product-detail.js`, `js/components/cart.js`
- **Output**: Same files modified
- **Steps**:
  1. In `products.js`: change `<img src="..." alt="...">` to `<img src="..." alt="..." loading="lazy">`
  2. In `product-detail.js`: same change
  3. In `cart.js`: same change
  4. In `products.js` mount(): add IntersectionObserver for `.product-card img`:
     ```javascript
     const observer = new IntersectionObserver((entries) => {
       entries.forEach(e => { if (e.isIntersecting) { e.target.src = e.target.dataset.src; observer.unobserve(e.target); }});
     }, { rootMargin: '100px' });
     document.querySelectorAll('.product-card img[data-src]').forEach(img => observer.observe(img));
     ```
  5. In products.js render(): change img to use `data-src` instead of `src` for lazy targets
- **Verification**:
  - Open DevTools Network tab → images load only when scrolled into view
  - `node --check js/components/products.js`
- **Estimated time**: 12 min

---

## Execution Order

```
A1 → A2 → A3 → A4 (sequential, each depends on previous)
B1 (independent, run first — DB fix)
B2 → B3 (sequential)

Suggested order: B1, A1, A2, A3, A4, B2, B3
```

## Post-Execution Checklist (GATE 3+4)

```bash
# Restart service
cd server && pm2 restart ecosystem.config.js --update-env

# Smoke tests
curl http://localhost:3001/health
curl http://localhost:3001/api/products | python3 -c "import sys,json; d=json.load(sys.stdin); print(len(d['data']),'products')"

# Validation tests
curl -s -X POST http://localhost:3001/api/orders -H "Content-Type: application/json" -d '{}' | python3 -m json.tool
# → 422 with errors

curl -s -X POST http://localhost:3001/api/auth/register -H "Content-Type: application/json" -d '{"email":"bad","password":"1"}' | python3 -m json.tool
# → 422 with errors

# Image fix verification
curl -s http://localhost:3001/api/products | python3 -c "
import sys,json
for p in json.load(sys.stdin)['data']:
    if p['id'] in [3,4,5,9]: print(p['id'], p['name'], p['image'][43:75])
"

# CSP header check
curl -s -I http://localhost:3001/api/products | grep -i content-security
```

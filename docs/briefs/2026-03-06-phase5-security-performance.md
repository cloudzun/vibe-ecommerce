# Phase 5 BRIEF — Security Hardening + Performance + Image Fixes

**Date**: 2026-03-06  
**Author**: HuaQloud (Architect)  
**Status**: Confirmed

---

## Project Background

Phase 4 delivered JWT authentication. Phase 5 addresses two categories of remaining issues:

1. **Security gaps**: No input validation on orders/products routes, no explicit request body size limits, helmet CSP blocks Unsplash images
2. **Frontend issues**: No image lazy loading, 4 products showing wrong/broken images, no API response caching

## Current State

| Item | Status |
|------|--------|
| npm audit | ✅ 0 vulnerabilities |
| helmet | ✅ installed, default config (CSP too strict) |
| express-validator | ❌ not installed |
| Request body size limit | ⚠️ Express default 100kb, not explicit |
| Image lazy loading | ❌ none |
| API caching | ❌ none |
| Broken/wrong images | ❌ 4 products affected |

## Definition of Done

### Module A — Input Security (Backend)
- [ ] `express-validator` installed
- [ ] POST /api/orders validates: name (1-100 chars), email (valid format), address (1-200 chars), items (array, non-empty), total (positive number)
- [ ] POST /api/auth/register validates: email (valid), password (min 6 chars) — replace current manual checks
- [ ] Request body size limit: 10kb for JSON
- [ ] helmet CSP updated to allow `images.unsplash.com`
- [ ] Invalid input returns 422 with field-level error messages

### Module B — Frontend Performance + Image Fixes
- [ ] All `<img>` tags have `loading="lazy"`
- [ ] Product list images use IntersectionObserver for progressive loading
- [ ] GET /api/products cached in-memory (5-minute TTL, invalidated on restart)
- [ ] 4 wrong images fixed in database:
  - USB-C Hub (id=3) → `photo-1601524909162-ae8725290836`
  - Webcam HD (id=4) → `photo-1535303311164-664fc9ec6532`
  - Portable SSD (id=5) → `photo-1639322537228-f710d846310a`
  - Monitor Stand (id=9) → `photo-1616763355548-1b606f439f86`

## Failure Lines (Must Not Break)
- All Phase 3 API endpoints continue working
- All Phase 4 auth flows continue working
- Guest checkout still works
- Vercel frontend still loads

## Affected Files

### New files
- `server/middleware/validate.js` — express-validator schemas

### Modified files
- `server/app.js` — body size limit, helmet CSP config
- `server/routes/orders.js` — add validation middleware
- `server/routes/auth.js` — replace manual checks with express-validator
- `server/routes/products.js` — add response caching
- `js/components/products.js` — IntersectionObserver lazy load
- `js/components/product-detail.js` — loading="lazy"
- `js/components/cart.js` — loading="lazy"

### Database change
- UPDATE products SET image = '...' WHERE id IN (3, 4, 5, 9)
- Applied via migration script in `server/migrations/fix-product-images.js`

## Constraints
- No new npm packages except `express-validator`
- No TypeScript, no ESM
- CommonJS (require) style throughout
- Database migration must be idempotent (safe to run twice)
- Cache must not persist across server restarts (in-memory only)

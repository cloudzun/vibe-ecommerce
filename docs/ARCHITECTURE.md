# Architecture

Technical deep-dive into vibe-ecommerce's design decisions, module responsibilities, and data flow.

---

## Overview

A single-page application (SPA) built with vanilla JavaScript. No framework, no build tools, no bundler. The entire app loads from `index.html` and runs in the browser.

```
index.html
  └── loads scripts in order:
      data.js → utils.js → store.js → router.js
      → components/* → app.js
```

---

## Module Responsibilities

### `js/data.js` — Product Catalog

Static product data. 10 electronics items with:
- `id`, `name`, `category`, `price`, `image`, `description`, `rating`

**Current limitation**: hardcoded. Phase 3 will replace with API call.

**Image strategy**: Unsplash CDN URLs with fixed dimensions (`?w=400&h=300&fit=crop`). Chosen over:
- `picsum.photos` — random images, no semantic match to product names
- Self-hosted — adds storage cost and maintenance
- Placeholder SVGs — poor UX

---

### `js/utils.js` — Security Utilities

```javascript
function escapeHtml(str) { ... }
```

**Why this exists**: All user-facing strings rendered via `innerHTML` must be escaped to prevent XSS. This was identified as a CRITICAL bug in Phase 1's code quality review and fixed before deployment.

**Rule**: Every component that renders user-controlled data (product names, form inputs, order details) must call `escapeHtml()`. No exceptions.

---

### `js/store.js` — Cart State

Single source of truth for cart state. API:

```javascript
CartStore.addItem(product, quantity)
CartStore.removeItem(productId)
CartStore.updateQuantity(productId, quantity)
CartStore.getCart()           // returns array of cart items
CartStore.getCartTotal()      // returns number
CartStore.clearCart()
```

**Persistence**: localStorage with try/catch fallback to in-memory array.

```javascript
// Why try/catch?
// localStorage throws in private/incognito mode.
// Without this, the entire app crashes on first load.
try {
    localStorage.setItem('cart', JSON.stringify(cart));
} catch (e) {
    inMemoryCart = cart; // graceful degradation
}
```

**Phase 3 migration**: `CartStore` interface will remain identical. The implementation will switch from localStorage to API calls. Components won't need to change.

---

### `js/router.js` — Hash-Based SPA Router

Routes map to component `mount()` functions:

```
#products                → ProductsPage.mount()
#product-detail?id=N     → ProductDetailPage.mount({id: N})
#cart                    → CartPage.mount()
#checkout                → CheckoutPage.mount()
#order-confirmation      → OrderConfirmationPage.mount()
```

**Why hash-based?**
- Works without a server (can open `index.html` directly from filesystem)
- No server-side routing configuration needed for Vercel deployment
- Browser back/forward navigation works natively

**404 handling**: Unknown routes render a "Page not found" state. This was missing in Phase 1 and added after the systematic debugging pass.

---

### `js/components/products.js` — Product Listing

State managed within the component:

```javascript
const ProductsPage = {
    currentCategory: 'all',
    searchQuery: '',
    sortOrder: 'default',
    ...
}
```

**Why unified state?** Search, category filter, and sort all feed into a single `getFilteredProducts()` function, and `mount()` is the single render entry point. This prevents state desync bugs (e.g., "search clears when you change category").

**Card click behavior**: The entire card is clickable (navigates to detail page). The "Add to Cart" button uses `event.stopPropagation()` to prevent the click from bubbling up to the card handler.

---

### `js/components/checkout.js` + `js/components/order-confirmation.js`

**Order data flow**:

```
CheckoutPage.handleSubmit()
  → generates orderId (timestamp + random suffix)
  → saves order to sessionStorage
  → clears cart
  → Router.goTo('order-confirmation')

OrderConfirmationPage.mount()
  → reads order from sessionStorage
  → renders confirmation with order details
```

**Why sessionStorage, not localStorage or URL params?**

| Option | Problem |
|--------|---------|
| URL params | Order data exposed in browser history and server logs |
| localStorage | Data persists indefinitely; semantically wrong for a one-time confirmation |
| **sessionStorage** | Auto-clears when tab closes; matches "temporary view" semantics |

**Phase 4 migration**: sessionStorage will be replaced by a real order API. The `orderId` format (`ORD-<timestamp>-<random>`) will be replaced by database-generated IDs.

---

## Data Flow: Add to Cart

```
User clicks "Add to Cart"
  → ProductsPage.addToCart(productId)
  → CartStore.addItem(product, 1)
    → updates in-memory cart array
    → persists to localStorage (with try/catch)
  → HeaderComponent.updateCartBadge()
    → reads CartStore.getCart().length
    → updates badge number
```

---

## Data Flow: Checkout

```
User submits checkout form
  → CheckoutPage.handleSubmit(event)
  → validates: cart not empty (redirect if empty)
  → generates orderId
  → saves {id, name, email, items, total} to sessionStorage
  → CartStore.clearCart()
  → Router.goTo('order-confirmation')
  → OrderConfirmationPage reads sessionStorage
  → renders order summary table
```

---

## Security Decisions

### XSS Prevention

All `innerHTML` assignments use `escapeHtml()`:

```javascript
// ❌ Vulnerable (Phase 1 original)
element.innerHTML = `<h3>${product.name}</h3>`;

// ✅ Fixed
element.innerHTML = `<h3>${escapeHtml(product.name)}</h3>`;
```

Affected locations: `products.js`, `product-detail.js`, `cart.js`, `checkout.js`, `order-confirmation.js`.

### Input Validation

- `productId` in URL params: validated with `parseInt()` + `isNaN()` check before lookup
- Cart quantities: clamped with `Math.max(1, quantity)` — no negative quantities
- Checkout form: HTML5 `required` + `type="email"` + `pattern` for card number

### localStorage Error Handling

Private/incognito mode throws `SecurityError` on localStorage access. All read/write operations are wrapped in try/catch with in-memory fallback.

---

## Known Technical Debt

| Item | Location | Phase to Fix |
|------|----------|-------------|
| Product data is hardcoded | `js/data.js` | Phase 3 |
| Cart state is client-only | `js/store.js` | Phase 3 |
| No real payment processing | `js/components/checkout.js` | Phase 4+ |
| No user authentication | — | Phase 4 |
| No unit tests | — | Phase 3+ |
| Images are external CDN links | `js/data.js` | Phase 5 |
| No image lazy loading | `css/styles.css` | Phase 5 |

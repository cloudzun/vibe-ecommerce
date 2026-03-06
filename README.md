# vibe-ecommerce

> A progressive e-commerce SPA built with vanilla JavaScript, evolving from a Vibe Coding prototype to a full-stack production app — documented at every step.

**Live Demo**: https://vibe-ecommerce-seven.vercel.app  
**API**: https://shop-api.huaqloud.com/api/products  
**Blog Series**: https://blog.huaqloud.com/tags/vibe-coding/

---

## What This Project Is

This is not just an e-commerce app. It's a **documented engineering journey** — from a 40-minute AI-generated prototype to a production-ready full-stack application, following the [LAB-14 Capstone framework](https://github.com/cloudzun/opencode-labs/blob/main/LAB-14-capstone-project.md).

Every architectural decision, quality gate, and iteration is recorded. The goal is to show how AI-assisted development (OpenCode + Superpowers) can be done with engineering discipline, not just speed.

---

## Current Status

| Phase | Status | Description |
|-------|--------|-------------|
| Phase 1 | ✅ Complete | Vibe Coding prototype — 927 lines, full shopping flow |
| Phase 2 | ✅ Complete | Frontend polish — search, sort, card navigation, order confirmation |
| Phase 3 | ✅ Complete | Backend API — Node.js + Express + SQLite, live at shop-api.huaqloud.com |
| Phase 4 | ✅ Complete | User auth — JWT, register/login, order history |
| Phase 5 | ✅ Complete | Security hardening + performance — input validation, lazy loading, API cache |
| Phase 6 | 🔜 Planned | SDD-driven refactor, containerization, Azure SQL DB migration |

---

## Quick Start

### Frontend only (no backend needed)

```bash
git clone https://github.com/cloudzun/vibe-ecommerce.git
cd vibe-ecommerce

# Option 1: Python
python3 -m http.server 8080

# Option 2: Node.js
npx serve .
```

Then open http://localhost:8080 — the frontend connects to the live API at `https://shop-api.huaqloud.com`.

### Run backend locally

```bash
cd server
npm install
node app.js   # starts on port 3001
```

---

## Tech Stack

### Frontend
| Layer | Technology | Reason |
|-------|-----------|--------|
| UI | Vanilla HTML/CSS/JS | No build tools, maximum simplicity |
| Routing | Hash-based SPA (`#products`, `#cart`, etc.) | Works without a server |
| State | `js/store.js` + localStorage | Persistent cart, zero backend |
| Auth | JWT (localStorage) + httpOnly cookie | Phase 4 addition |
| Images | Unsplash CDN + `loading="lazy"` | Real photos, lazy-loaded |
| Deployment | Vercel | Static hosting, automatic deploys |

### Backend
| Layer | Technology | Reason |
|-------|-----------|--------|
| Runtime | Node.js v22 | Same language as frontend |
| Framework | Express.js | Lightweight, well-known |
| Database | SQLite via `better-sqlite3` | Zero config; Knex abstracts dialect |
| Query builder | Knex.js | SQLite → MSSQL migration = config change only |
| Auth | JWT (jsonwebtoken) + bcrypt | Industry standard |
| Validation | express-validator | Declarative, field-level errors |
| Security | helmet + CORS + rate-limit | Defense in depth |
| Process | pm2 + systemd | Auto-restart, log management |
| Proxy | Nginx Proxy Manager (Docker) | SSL termination, subdomain routing |
| Deployment | Azure Linux VM | Full control, persistent storage |

---

## Project Structure

```
vibe-ecommerce/
├── index.html                    # Entry point, loads all scripts
├── css/
│   └── styles.css                # All styles (responsive, no framework)
├── js/
│   ├── auth.js                   # AuthService — token lifecycle, login/logout
│   ├── data.js                   # API clients (ProductAPI, OrderAPI)
│   ├── store.js                  # Cart state + localStorage persistence
│   ├── router.js                 # Hash-based SPA router
│   ├── utils.js                  # escapeHtml() and shared utilities
│   ├── app.js                    # App initialization
│   └── components/
│       ├── header.js             # Nav bar with cart badge + auth state
│       ├── products.js           # Product listing — search/sort/filter + lazy load
│       ├── product-detail.js     # Single product view + add to cart
│       ├── cart.js               # Cart management
│       ├── checkout.js           # Checkout form + order submission
│       ├── order-confirmation.js # Post-checkout confirmation page
│       ├── login.js              # #login page
│       ├── register.js           # #register page (auto-login after register)
│       └── account.js            # #account — order history
├── server/
│   ├── app.js                    # Express entry point (helmet, CORS, routes)
│   ├── db.js                     # Knex + SQLite init, table creation, seed data
│   ├── ecosystem.config.js       # pm2 config (JWT_SECRET env var)
│   ├── middleware/
│   │   ├── auth.js               # JWT verifyToken middleware
│   │   └── validate.js           # express-validator schemas (order, register)
│   ├── routes/
│   │   ├── products.js           # GET /api/products, GET /api/products/:id
│   │   ├── orders.js             # POST /api/orders, GET /api/orders/:id
│   │   ├── auth.js               # register / login / refresh / logout
│   │   └── users.js              # GET /api/users/me/orders
│   ├── migrations/
│   │   └── fix-product-images.js # Idempotent image URL migration (Phase 5)
│   └── data/
│       └── shop.db               # SQLite database
└── docs/
    ├── ARCHITECTURE.md           # Technical deep-dive
    ├── ROADMAP.md                # Evolution plan (all phases)
    ├── CONTRIBUTING.md           # Workflow, code standards, PR process
    ├── briefs/                   # Context documents (one per phase)
    ├── plans/                    # Implementation plans (one per phase)
    └── retrospectives/           # Phase retrospectives
```

---

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/products` | — | List products (filter/sort/search) |
| GET | `/api/products/:id` | — | Single product |
| POST | `/api/orders` | Optional | Submit order |
| GET | `/api/orders/:id` | — | Order details |
| POST | `/api/auth/register` | — | Create account |
| POST | `/api/auth/login` | — | Login → access token + refresh cookie |
| POST | `/api/auth/refresh` | Cookie | Renew access token |
| POST | `/api/auth/logout` | — | Clear refresh cookie |
| GET | `/api/users/me/orders` | Bearer | Authenticated user's orders |

**Base URL**: `https://shop-api.huaqloud.com`

---

## Documentation

- **[Architecture](docs/ARCHITECTURE.md)** — Module design, data flow, security, technical debt
- **[Roadmap](docs/ROADMAP.md)** — Full phase-by-phase evolution with decisions and specs
- **[Contributing](docs/CONTRIBUTING.md)** — 7-Gate workflow, code standards, OpenCode prompt template
- **[Process](PROCESS.md)** — Architect/Executor role definitions, recovery procedures

---

## Blog Series

| Article | Phase | Topic |
|---------|-------|-------|
| [Vibe Coding with OpenCode + Superpowers](https://blog.huaqloud.com/posts/2026-03-04-vibe-coding-opencode-superpowers/) | 1 | Build process, Superpowers integration |
| [Why You Need 7 Quality Gates](https://blog.huaqloud.com/posts/2026-03-04-vibe-coding-qa-gates/) | 1 | QA methodology for AI-assisted dev |
| [Iteration Series #1: Phase 2](https://blog.huaqloud.com/posts/2026-03-04-vibe-ecommerce-iteration-phase2/) | 2 | Planning framework + frontend polish |
| [Iteration Series #2: Phase 3](https://blog.huaqloud.com/posts/2026-03-05-vibe-ecommerce-phase3-backend/) | 3 | Backend architecture + tech decisions |
| [Iteration Series #3: Phase 4](https://blog.huaqloud.com/posts/2026-03-05-vibe-ecommerce-phase4-auth/) | 4 | JWT auth, OpenCode deviation recovery |

---

## Development Workflow

This project follows a **7-Gate quality process**. Every phase goes through all gates — no skipping.

```
GATE 0: BRIEF confirmed
GATE 1: Implementation plan written
GATE 2: OpenCode executes (Architect monitors)
GATE 3: Service restart + smoke test
GATE 4: Functional acceptance (all test cases pass)
GATE 5: Security checklist
GATE 6: Documentation updated
GATE 7: Deployment verified
```

See [CONTRIBUTING.md](docs/CONTRIBUTING.md) for the full workflow and OpenCode prompt template.

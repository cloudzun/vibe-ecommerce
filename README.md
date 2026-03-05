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
| Phase 4 | 🔜 Planned | User auth — JWT, order history, permissions |
| Phase 5 | 🔜 Planned | Performance + security hardening |
| Phase 6 | 🔜 Planned | SDD-driven refactor |

---

## Quick Start

No build tools. No dependencies. Open directly in browser:

```bash
git clone https://github.com/cloudzun/vibe-ecommerce.git
cd vibe-ecommerce

# Option 1: Python
python3 -m http.server 8080

# Option 2: Node.js
npx serve .
```

Then open http://localhost:8080

---

## Tech Stack

| Layer | Technology | Reason |
|-------|-----------|--------|
| UI | Vanilla HTML/CSS/JS | No build tools, maximum simplicity |
| Routing | Hash-based SPA (`#products`, `#cart`, etc.) | Works without a server |
| State | `js/store.js` + localStorage | Persistent cart, zero backend |
| Images | Unsplash CDN | Real product photos, no hosting cost |
| Deployment | Vercel | Static hosting, automatic deploys |

---

## Project Structure

```
vibe-ecommerce/
├── index.html                  # Entry point, loads all scripts
├── css/
│   └── styles.css              # All styles (responsive, no framework)
├── js/
│   ├── data.js                 # Product catalog (10 items, mock data)
│   ├── store.js                # Cart state + localStorage persistence
│   ├── router.js               # Hash-based router
│   ├── utils.js                # escapeHtml() and shared utilities
│   ├── app.js                  # App initialization
│   └── components/
│       ├── header.js           # Nav bar with cart badge
│       ├── products.js         # Product listing with search/sort/filter
│       ├── product-detail.js   # Single product view + add to cart
│       ├── cart.js             # Cart management
│       ├── checkout.js         # Checkout form + order submission
│       └── order-confirmation.js  # Post-checkout confirmation page
└── docs/
    ├── ARCHITECTURE.md         # Technical deep-dive
    ├── ROADMAP.md              # Evolution plan (all 6 phases)
    ├── CONTRIBUTING.md         # How to contribute
    ├── briefs/                 # Context documents (one per phase)
    └── plans/                  # Implementation plans (one per phase)
```

---

## Documentation

- **[Architecture](docs/ARCHITECTURE.md)** — Module design, data flow, key decisions
- **[Roadmap](docs/ROADMAP.md)** — Full 6-phase evolution plan with technical specs
- **[Contributing](docs/CONTRIBUTING.md)** — Code standards, workflow, PR process

---

## Blog Series

| Article | Topic |
|---------|-------|
| [Vibe Coding with OpenCode + Superpowers](https://blog.huaqloud.com/posts/2026-03-04-vibe-coding-opencode-superpowers/) | Phase 1 build process |
| [Why You Need 7 Quality Gates](https://blog.huaqloud.com/posts/2026-03-04-vibe-coding-qa-gates/) | QA methodology |
| [Iteration Series #1: Phase 2](https://blog.huaqloud.com/posts/2026-03-04-vibe-ecommerce-iteration-phase2/) | Planning framework + Phase 2 |
| [Iteration Series #2: Phase 3](https://blog.huaqloud.com/posts/2026-03-05-vibe-ecommerce-phase3-backend/) | Backend intro — architecture + tech decisions |

---

## Development Workflow

This project follows a **7-Gate quality process** with context documents at each phase:

```
[Context Doc] → [BRIEF] → [Plan] → [Execute] → [Struct Check]
                                              → [Spec Review]
                                              → [Quality Review]
                                              → [Fix & Verify]
                                              → [Deploy]
```

See [CONTRIBUTING.md](docs/CONTRIBUTING.md) for details.

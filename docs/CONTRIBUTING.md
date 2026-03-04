# Contributing

This project follows a structured workflow designed for AI-assisted development. Whether you're contributing code or reviewing, this document explains the process.

---

## Development Workflow

Every change — no matter how small — follows this sequence:

```
1. Write Context Document (BRIEF)
2. Generate Implementation Plan
3. Execute (with per-task verification)
4. Structural Check
5. Spec Review
6. Code Quality Review
7. Fix & Verify
8. Deploy
```

For small changes (single file, clear scope, no security impact), steps 1-2 can be skipped. Steps 5-6 are never skipped for anything touching user input or external data.

---

## Context Document (BRIEF)

Before writing any code, create `docs/briefs/YYYY-MM-DD-<feature>.md`:

```markdown
## Project Background
[Current system state: what exists, what works, what's broken]

## What Was Tried Before
[Previous phase outcomes, known issues, existing technical debt]

## Definition of Done / Failure
- Success: [measurable criteria]
- Failure lines: [things that must not break]

## Who Is Affected
- Affected modules: [list]
- Regression test scope: [what to re-verify]

## Constraints
- Tech constraints: [language, framework, interfaces that can't change]
- Quality constraints: [performance targets, security requirements]
```

**Why this matters**: The BRIEF is not just for you — it becomes the prompt context for OpenCode. A well-written BRIEF produces significantly better AI output than an ad-hoc prompt.

---

## Implementation Plan

After the BRIEF is confirmed, create `docs/plans/YYYY-MM-DD-<feature>.md`:

```markdown
## Task N: <verb + noun>
- Input: which files/interfaces this depends on
- Output: which files are created/modified
- Verification: exact command or check to confirm completion
- Estimated time: X minutes
```

**Task size rule**: Each task should take 2-5 minutes. If a task takes longer, split it.

**Plan vs execution**: Plans are guidance, not contracts. If two tasks naturally merge during execution, merge them — but document why.

---

## Code Standards

### Security (non-negotiable)

- All `innerHTML` assignments must use `escapeHtml()` from `js/utils.js`
- All localStorage/sessionStorage access must be wrapped in try/catch
- All URL parameter IDs must be validated before use (`parseInt()` + `isNaN()` check)
- No hardcoded secrets or API keys

### JavaScript Style

- No `var` — use `const` and `let`
- No empty catch blocks — at minimum, log the error
- No functions longer than 50 lines — split into smaller functions
- Component files follow the pattern: `const XxxPage = { render(), mount(), ... }`

### Comments

Write comments that explain **why**, not **what**:

```javascript
// ❌ Bad: restates the code
// Escape the product name to prevent XSS
element.innerHTML = `<h3>${escapeHtml(product.name)}</h3>`;

// ✅ Good: explains the constraint
// escapeHtml() required — product names come from data.js but will
// eventually come from user-submitted API data in Phase 3
element.innerHTML = `<h3>${escapeHtml(product.name)}</h3>`;
```

---

## Verification Commands

Run these before submitting a PR:

```bash
# Syntax check all JS files
for f in js/**/*.js js/*.js; do node --check "$f" && echo "OK: $f"; done

# Verify all components register their routes
grep -c "Router.register" js/components/*.js

# Verify escapeHtml is used wherever innerHTML is used
grep -n "innerHTML" js/components/*.js | grep -v "escapeHtml"
# ^ this should return nothing (all innerHTML uses escapeHtml)

# Verify no hardcoded secrets
grep -rn "api_key\|apiKey\|secret\|password" js/ --include="*.js"
# ^ should return nothing sensitive
```

---

## Pull Request Checklist

- [ ] Context document exists in `docs/briefs/`
- [ ] Implementation plan exists in `docs/plans/`
- [ ] All verification commands pass
- [ ] No new `innerHTML` without `escapeHtml()`
- [ ] No new localStorage access without try/catch
- [ ] Technical decisions documented (in BRIEF, plan, or code comments)
- [ ] `ROADMAP.md` Decision Log updated if a new architectural decision was made

---

## Project Structure Rules

| Directory | Purpose | Rule |
|-----------|---------|------|
| `js/components/` | Page components | One file per route; must call `Router.register()` |
| `js/` (root) | Core modules | `data.js`, `store.js`, `router.js`, `utils.js`, `app.js` only |
| `docs/briefs/` | Context documents | One per phase/feature, named `YYYY-MM-DD-<name>.md` |
| `docs/plans/` | Implementation plans | One per phase/feature, same naming |
| `docs/retrospectives/` | Phase retrospectives | Created at end of each phase |

---

## Reporting Issues

When filing an issue, include:
1. **What you expected** to happen
2. **What actually happened** (with browser console output if relevant)
3. **Steps to reproduce**
4. **Which phase** introduced the behavior (check git log)

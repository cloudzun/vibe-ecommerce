# Phase 4 Retrospective — User Authentication

**Date**: 2026-03-05  
**Duration**: ~6 hours (including recovery from OpenCode deviation)  
**Status**: ✅ Complete — 15/15 acceptance tests passed

---

## What Went Well

### Architecture Clarity
- BRIEF and plan were clear enough that recovery was fast
- Role separation (Architect → Design, OpenCode → Execute) worked well once enforced
- JWT + bcrypt + httpOnly cookie pattern is solid and secure

### Test Coverage
- 15-item acceptance test suite caught the rate-limit issue before deployment
- Comprehensive flow: register → login → checkout → order history

### Documentation
- Documented failure mode (OpenCode skill triggering) for future reference
- Updated CONTRIBUTING.md with clear role boundaries

---

## What Went Wrong

### OpenCode Skill Triggering (Critical)
**Problem**: OpenCode autonomously triggered `writing-plans` skill, which then triggered `subagent-driven-development`. Result: task replaced with Phase 1 prototype rebuild instead of Phase 4 auth.

**Root Cause**: Superpowers' `using-superpowers` skill has a rule: *"If 1% chance a skill applies, MUST invoke it."* This is designed for collaborative work but breaks in a pure executor role.

**Fix Applied**: 
- Killed the OpenCode session
- Architect took over and wrote Phase 4 code directly
- Added constraint to future OpenCode prompts: "不要触发任何 skill"

**Lesson**: Superpowers skills are Architect reference material, NOT OpenCode automation triggers. This was a fundamental misunderstanding of role boundaries.

### Rate Limiter Over-Scope
**Problem**: Rate limiter was applied to `/api/auth/*` which includes `refresh` and `logout`. Testing triggered the limiter on harmless operations.

**Fix**: Rate limit only `/api/auth/login` and `/api/auth/register`. `refresh` and `logout` are low-risk.

---

## Technical Debt Added

| Item | Severity | Plan |
|------|----------|------|
| No password reset | Low | Phase 5 |
| No email verification | Low | Phase 5 |
| No server-side cart migration | Medium | Phase 5 |
| Cart still localStorage for guests | Low | Accept (backward compat) |

---

## Key Metrics

| Metric | Value |
|--------|-------|
| Acceptance tests passed | 15/15 (100%) |
| Security checklist items | 6/6 (100%) |
| New files | 6 |
| Modified files | 4 |
| Backend LOC | ~200 |
| Frontend LOC | ~150 |
| Total gates completed | 7/7 |
| Gates needing rework after OpenCode failure | 1 (GATE 2) |

---

## Deployment Checklist

- [x] Unit tests (15 manual curl tests)
- [x] Security audit (JWT, bcrypt, CORS, rate limit)
- [x] Service restart + smoke test
- [x] Vercel deployment successful
- [x] Backend API responding on https://shop-api.huaqloud.com
- [x] Frontend updated with auth pages

---

## Knowledge Transfer

### For Next Phases

1. **OpenCode Prompt Template**: Always include the constraint header to prevent skill triggering
2. **Rate Limiting Strategy**: Only protect high-risk endpoints (login, register)
3. **Authentication Pattern**: JWT + httpOnly cookie pattern is proven; use for Phase 5+ features

### For Team

- Superpowers skills are tools for the Architect, not for OpenCode autonomous execution
- Clear role boundaries: Architect designs, OpenCode executes
- When OpenCode deviates, kill it and reassign to Architect (don't let it continue broken execution)

---

## Follow-Up Issues

- [ ] Write Phase 5 spec (performance + security hardening)
- [ ] Evaluate server-side cart migration for logged-in users
- [ ] Add password reset endpoint (can be Phase 5)
- [ ] Review iptables rule persistence strategy (potential Phase 5/6)

---

## Lessons Learned

**Process Insight**: The 7-Gate workflow is effective, but gate 2 (OpenCode execution) requires tight control to prevent executor autonomy from overriding architect decisions.

**Skill-Based Development**: Superpowers work great when used by Architect for reference, but dangerous when OpenCode triggers them autonomously. Treat skills as "architect's handbook", not "AI agent's operating procedure".

**Recovery Strategy**: Clear GATE structure made recovery fast. Once we killed the bad OpenCode run and restarted, the path was clear.

# PROCESS.md — Architect + OpenCode Workflow

**Last Updated**: 2026-03-06  
**Status**: Finalized after Phase 5 (ACP path fix, image validation pattern)

---

## Role Definition

### Architect (HuaQloud)
**Owns**: Strategy, specification, quality, architecture decisions

**Responsibilities**:
- Read Superpowers skills as **reference material** (not execution rules)
- Write BRIEF (Definition of Done, constraints)
- Write implementation plan (task breakdown, verification steps)
- Translate plan into OpenCode prompts with tight constraints
- Monitor OpenCode execution (check logs every 2-3 min)
- Kill OpenCode immediately if deviating
- Review all output before merge
- Update documentation after phase completion

**Never does**: Write production code directly (except critical security issues)

### OpenCode (Executor)
**Owns**: Coding, file creation/modification

**Responsibilities**:
- Receive precise task prompt from Architect
- Create/modify **only files listed in prompt**
- Execute without re-planning or re-architecting
- Report completion: what changed, any blockers

**Never does**: Trigger skills, make architectural decisions, deviate from task spec

---

## 7-Gate Workflow

Every phase strictly follows these gates:

```
GATE 0: BRIEF confirmed
   ↓
GATE 1: Implementation plan written
   ↓
GATE 2: OpenCode execution (Architect monitors)
   ↓
GATE 3: Service restart + smoke test
   ↓
GATE 4: Functional acceptance (all test cases)
   ↓
GATE 5: Security checklist
   ↓
GATE 6: Documentation (ROADMAP, ARCHITECTURE, CONTRIBUTING)
   ↓
GATE 7: Deployment verified
```

**No gate skipping. Ever.**

---

## GATE 0: BRIEF

Create `docs/briefs/YYYY-MM-DD-<feature>.md`.

**Must include**:
- Current system state
- What was tried before (prior phases)
- Definition of Done (measurable success criteria)
- Failure lines (things that must not break)
- Who is affected (new/modified/untouched files)
- Constraints (tech, security, backward compat)

**Before proceeding**: User/product owner confirms BRIEF.

---

## GATE 1: Implementation Plan

Create `docs/plans/YYYY-MM-DD-<feature>.md`.

**Task rules**:
- Size: 5–20 minutes per task (larger = split it)
- Each task: Input → Output → Verification
- Verification: exact shell command or checklist item

**Example**:
```markdown
## Task 1: Create users table migration
- Input: server/db.js (existing knex setup)
- Output: users table with email/password_hash columns
- Verification: `node --check server/db.js` + check SQLite schema
```

---

## GATE 2: OpenCode Execution

### Prompt Template

```
【执行约束】
- 不要触发任何 skill（writing-plans、subagent-driven-development 等）
- 不要重新规划，直接执行以下任务
- 只创建/修改以下文件（其他文件不要动）：
  - [新建] server/middleware/auth.js
  - [修改] server/app.js （仅加路由，不改其他）

【项目上下文】
- 项目位置：~/projects/vibe-ecommerce/
- 现有文件不要重建
- 代码风格：CommonJS（require），无 TypeScript，无 ESM

【任务】
[Task 1 from plan]
[Task 2 from plan]
...

【完成标准】
- node --check 通过所有文件
- [具体验证命令]

【完成后汇报】
做了什么、改了哪些文件、有什么注意事项
```

### Monitoring

Check OpenCode output every 2–3 minutes:

```bash
process action:log sessionId:<id> limit:30
```

**Red flags**:
- Mentions "using skill"
- Mentions "plan" or "brainstorm"
- Creates files not in the prompt
- Modifies files that should stay untouched

**If red flag**: Kill immediately
```bash
process action:kill sessionId:<id>
```

Then: diagnose root cause → rewrite prompt → restart OpenCode

---

## GATE 3: Service Restart + Smoke Test

```bash
# Restart
pm2 restart ecosystem.config.js --update-env

# Smoke test
curl http://localhost:3001/health

# Syntax check all new JS files
for f in <new-files>; do node --check "$f"; done
```

---

## GATE 4: Functional Acceptance

Run all test cases from BRIEF's "Definition of Done". Every case must pass.

Document results:
```markdown
## Test Results
[ ] Test case 1: register new user → PASS
[ ] Test case 2: duplicate email → 409 → PASS
[ ] Test case 3: login with wrong password → 401 → PASS
...
```

---

## GATE 5: Security Checklist

```markdown
[ ] No hardcoded secrets (API keys, passwords)
[ ] All innerHTML uses escapeHtml()
[ ] All localStorage/sessionStorage has try/catch
[ ] All URL params validated (parseInt + isNaN check)
[ ] Auth endpoints rate-limited
[ ] JWT secret from environment variable only
[ ] CORS not wildcard
[ ] Passwords never in API responses or logs
[ ] httpOnly cookie set server-side (if used)
```

---

## GATE 6: Documentation

After every phase:

```
[ ] docs/ROADMAP.md
    - Phase status updated to ✅
    - Decision Log updated
    - New modules documented
    
[ ] docs/ARCHITECTURE.md
    - New modules/flows documented
    - Data flow diagrams (if needed)
    - Technical debt cleared/updated
    
[ ] README.md
    - Status table updated (phase ✅)
    - Tech stack table updated (new dependencies)
    - Project structure updated (new files/dirs)
    - API endpoints table updated
    - Blog series table updated (new article link)

[ ] PROCESS.md
    - Last Updated date updated
    - Lessons/patterns added if workflow changed

[ ] docs/retrospectives/YYYY-MM-DD-phase-N.md
    - What went well
    - What went wrong
    - Metrics
    - Lessons learned
```

### Known Patterns (Phase 5)

**OpenCode via PTY (not ACP)**  
`sessions_spawn(runtime="acp")` requires `opencode` in system PATH. If it fails silently, use:
```bash
exec pty=true background=true command="export PATH=$HOME/.opencode/bin:$PATH && opencode run '...'"
```

**Image validation before DB update**  
Always verify candidate Unsplash photo IDs with:
1. HTTP 200 check: `curl -s -o /dev/null -w "%{http_code}" https://images.unsplash.com/<photo-id>?w=400`
2. AI image analysis: `image` tool to confirm content matches product name
3. Only then pass IDs to OpenCode migration script

---

## GATE 7: Deployment

```bash
git add -A && git commit -m "feat: Phase N - <description>"
git push origin master

# Wait for Vercel build, then verify:
curl -s -o /dev/null -w "%{http_code}" https://vibe-ecommerce-seven.vercel.app/js/<new-file>.js
# Should return 200
```

---

## Recovery Procedure (If OpenCode Deviates)

1. **Kill immediately**
   ```bash
   process action:kill sessionId:<id>
   ```

2. **Diagnose**
   - Read the last 50 lines of logs
   - Check which files were created/modified
   - Identify the deviation point

3. **Rewrite prompt**
   - Add explicit "don't do X" constraint
   - List files again with [新建] vs [修改]
   - Include `【执行约束】` header

4. **Restart OpenCode**
   - Same task, new prompt
   - If still deviates: Architect takes over (GATE 2 → manual coding)

---

## When Architect Codes (Exceptions Only)

Architect takes direct control only for:
- **Critical security issues** (e.g., XSS vulnerability)
- **OpenCode unable to proceed** (after 2 failed attempts)
- **Pilot/research code** (validating new patterns)

Document why:
```
NOTE: Architect-written code (security fix / recovery from OpenCode deviation)
Location: server/middleware/auth.js
Reason: Rate-limit scope correction after Phase 4 testing
```

---

## Superpowers Skills — Reference Only

| Skill | How Architect uses it |
|-------|----------------------|
| `writing-plans` | Read the structure; then write plan manually |
| `subagent-driven-development` | Read parallel task decomposition; apply in GATE 1 |
| `systematic-debugging` | Use checklist for diagnosing issues |
| `verification-before-completion` | Use checklist for GATE 4 |

**Rule**: Do NOT let OpenCode trigger skills. Architect extracts the wisdom, applies it to the plan, then hands OpenCode a clean task prompt.

---

## Code Style Rules

### JavaScript
- `const` / `let` only (no `var`)
- CommonJS only (`require` / `module.exports`)
- No empty catch blocks — log errors
- Components: `const XxxPage = { render(), mount(), ... }`

### Security
- All `innerHTML` → `escapeHtml()`
- All localStorage/sessionStorage → try/catch
- All URL params → `parseInt() + isNaN()` check
- No hardcoded secrets

### Comments
Explain **why**, not **what**:
```javascript
// ✅ Good: Product names will come from API in Phase 3
// escapeHtml() required to prevent XSS
element.innerHTML = `<h3>${escapeHtml(product.name)}</h3>`;
```

---

## File Naming Conventions

| Type | Pattern | Example |
|------|---------|---------|
| Components | Camel, matches route | `LoginPage`, `AccountPage` |
| Routes | Lowercase, plural for collections | `server/routes/users.js` |
| Middleware | Clear name | `server/middleware/auth.js` |
| Documentation | Date + topic | `docs/briefs/2026-03-05-phase4-auth.md` |

---

## Commit Message Format

```
type: brief description

Optional body explaining why/what changed.
```

**Types**: `feat`, `fix`, `docs`, `refactor`, `test`

**Examples**:
```
feat: Phase 4 - user auth (JWT, register/login/logout, order history)
fix: rate limit only on login/register, not refresh/logout
docs: Phase 4 complete - update ROADMAP/ARCHITECTURE/CONTRIBUTING
```

---

## Questions?

This process evolved from Phase 4 recovery. It works. Follow it.

Key insight: **Architect controls the plan, OpenCode controls the implementation. Not the other way around.**

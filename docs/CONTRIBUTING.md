# Contributing

This project follows a structured workflow designed for AI-assisted development with a clear Architect / Executor separation.

---

## Role Definitions

### Architect (HuaQloud)
Owns the **what** and **how**:
- Reads and interprets Superpowers skills as reference material
- Writes BRIEF and implementation plan before any code is written
- Translates plans into precise OpenCode prompts
- Monitors OpenCode execution and intervenes when off-track
- Reviews all output for correctness, security, and spec compliance
- Makes all architectural decisions
- Updates documentation and ROADMAP after each phase

**Does NOT**: write production code directly (except critical security issues)

### Executor (OpenCode)
Owns the **doing**:
- Receives precise task prompts from Architect
- Creates/modifies only the files listed in the prompt
- Does NOT trigger skills autonomously
- Does NOT re-plan or re-architect
- Reports: what was done, which files changed, any blockers

**Does NOT**: make architectural decisions, trigger skill chains, deviate from the task spec

---

## Superpowers Skills — How We Use Them

Superpowers skills (`~/.config/opencode/superpowers/skills/`) are **Architect reference material**, not OpenCode automation triggers.

| Skill | How Architect uses it |
|-------|-----------------------|
| `writing-plans` | Architect reads it, then writes the plan manually (GATE 1) |
| `subagent-driven-development` | Architect uses the parallel task decomposition pattern when designing the plan |
| `systematic-debugging` | Architect uses the checklist when diagnosing issues |
| `verification-before-completion` | Architect uses the checklist for GATE 3/4 |

**Rule**: OpenCode prompts must include this header to prevent autonomous skill triggering:
```
【执行约束】
- 不要触发任何 skill
- 不要重新规划，直接执行以下任务
- 只创建/修改以下指定文件：[列表]
- 完成后汇报：做了什么、改了哪些文件、有什么注意事项
```

---

## Development Workflow (7 Gates)

Every phase follows this sequence. Gates are never skipped.

```
GATE 0 → BRIEF confirmed by user
GATE 1 → Implementation plan written by Architect
GATE 2 → OpenCode executes (Architect monitors)
GATE 3 → Service restart + smoke test
GATE 4 → Functional acceptance (all test cases pass)
GATE 5 → Security review
GATE 6 → Documentation updated (ROADMAP, ARCHITECTURE, CONTRIBUTING)
GATE 7 → Deployment verified
```

### GATE 0 — BRIEF
Create `docs/briefs/YYYY-MM-DD-<feature>.md`:

```markdown
## Project Background
[Current system state]

## What Was Tried Before
[Previous outcomes, known issues, existing debt]

## Definition of Done / Failure
- Success: [measurable criteria]
- Failure lines: [things that must not break]

## Who Is Affected
- New files: [list]
- Modified files: [list]
- Untouched files: [list — equally important]

## Constraints
[Tech, security, backward-compat constraints]
```

### GATE 1 — Implementation Plan
Create `docs/plans/YYYY-MM-DD-<feature>.md`.

Each task:
```markdown
## Task N: <verb + noun>
- Input: [files/interfaces this depends on]
- Output: [files created/modified]
- Verification: [exact command to confirm]
```

Task size: 5–20 minutes each. Larger = split it.

### GATE 2 — OpenCode Execution
Architect writes the prompt. OpenCode executes.

**If OpenCode deviates**:
1. Kill the session immediately (`process action:kill`)
2. Diagnose root cause (wrong context? skill triggered? ambiguous prompt?)
3. Rewrite the prompt with tighter constraints
4. Re-run OpenCode — do NOT take over the coding yourself

**Monitoring**: check `process action:log` every 2–3 minutes. If output doesn't match expected files within 5 minutes, intervene.

### GATE 3 — Smoke Test
```bash
# Restart service
pm2 restart ecosystem.config.js --update-env

# Verify health
curl -s http://localhost:3001/health

# Syntax check all new JS files
node --check <file>
```

### GATE 4 — Functional Acceptance
Run all test cases from the BRIEF's "Definition of Done". Every case must pass before proceeding.

### GATE 5 — Security Review
Checklist (non-negotiable):
- [ ] No hardcoded secrets or API keys
- [ ] All `innerHTML` uses `escapeHtml()`
- [ ] All localStorage/sessionStorage access has try/catch
- [ ] All URL params validated before use
- [ ] Auth endpoints have rate limiting
- [ ] JWT secret from environment variable only
- [ ] CORS not wildcard

### GATE 6 — Documentation
After every phase:
- [ ] `docs/ROADMAP.md` — phase status updated to ✅, Decision Log updated
- [ ] `docs/ARCHITECTURE.md` — new modules/flows documented
- [ ] `README.md` — status table and links updated
- [ ] Retrospective written: `docs/retrospectives/YYYY-MM-DD-<phase>.md`

### GATE 7 — Deployment
```bash
git add -A && git commit -m "feat: Phase N - <description>"
git push origin master
# Wait for Vercel deploy, then verify:
curl -s -o /dev/null -w "%{http_code}" https://vibe-ecommerce-seven.vercel.app/js/<new-file>.js
```

---

## OpenCode Prompt Template

```
【执行约束】
- 不要触发任何 skill
- 不要重新规划，直接执行以下任务
- 只创建/修改以下指定文件（其他文件不要动）：
  - [新建] server/routes/xxx.js
  - [修改] server/app.js（只加路由挂载，不改其他）

【项目上下文】
- 项目位置：~/projects/vibe-ecommerce/
- 现有文件不要重建，只做指定修改
- 代码风格：CommonJS require()，无 TypeScript，无 ESM

【任务】
[具体任务描述]

【完成标准】
- node --check 通过
- [具体验证命令]

【完成后汇报】
做了什么、改了哪些文件、有什么注意事项
```

---

## Code Standards

### Security (non-negotiable)
- All `innerHTML` → `escapeHtml()` from `js/utils.js`
- All localStorage/sessionStorage → try/catch
- All URL param IDs → `parseInt()` + `isNaN()` check
- No hardcoded secrets

### JavaScript Style
- No `var` — use `const` and `let`
- No empty catch blocks — log the error
- Component files: `const XxxPage = { render(), mount(), ... }`
- CommonJS only — no ESM (`import`/`export`)

---

## Project Structure Rules

| Directory | Purpose | Rule |
|-----------|---------|------|
| `js/components/` | Page components | One file per route; must call `Router.register()` |
| `js/` (root) | Core modules | `data.js`, `store.js`, `router.js`, `utils.js`, `auth.js`, `app.js` only |
| `server/routes/` | API route handlers | One file per resource |
| `server/middleware/` | Express middleware | Auth, rate-limit, validation |
| `docs/briefs/` | Context documents | `YYYY-MM-DD-<name>.md` |
| `docs/plans/` | Implementation plans | `YYYY-MM-DD-<name>.md` |
| `docs/retrospectives/` | Phase retrospectives | End of each phase |

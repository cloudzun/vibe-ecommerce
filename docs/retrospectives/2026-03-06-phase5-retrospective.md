# Phase 5 Retrospective — Security + Performance Hardening

**Date**: 2026-03-06  
**Duration**: ~2 hours (planning + execution + verification)  
**Commit**: `8e819e6`

---

## What We Built

Phase 5 addressed two categories of remaining issues after Phase 4 authentication:

1. **Security gaps**: No input validation on orders/products routes, no explicit body size limits, helmet CSP blocking Unsplash images
2. **Frontend quality**: Wrong/broken images on 4 products, no lazy loading, no API caching

---

## What Went Well

### OpenCode 执行质量
7 个任务全部一次性完成，无需人工干预。代码风格与现有代码库一致（CommonJS、单引号、缩进风格）。特别是 A3 任务（替换手动校验为 express-validator）处理得很干净——正确识别并删除了 `EMAIL_RE` 正则校验和密码长度检查，保留了 bcrypt 和 duplicate email 逻辑。

### 分工清晰
架构师（我）负责：
- 图片候选验证（AI 图片分析 + HTTP 可访问性检查）
- BRIEF 和 PLAN 文档编写
- 验收测试设计和执行
- 最终 git commit

OpenCode 负责：
- 所有文件创建和修改
- 依赖安装
- 数据库迁移执行
- PM2 重启

### 约束头部有效
`【执行约束】` 头部防止了 skill 触发。OpenCode 没有偏离任务，没有尝试重新规划，直接按顺序执行了 7 个任务。

---

## What Was Tricky

### ACP Session 启动失败
`sessions_spawn(runtime="acp")` 没有正常启动，因为 `opencode` 不在系统 PATH 中。需要改用 `exec(pty=true, background=true)` 直接调用 `~/.opencode/bin/opencode`。

**根本原因**：ACP harness 依赖系统 PATH 中的 `opencode` 命令，而 opencode 安装在 `~/.opencode/bin/`，没有添加到全局 PATH。

**解决方案**：在 exec 命令前加 `export PATH="$HOME/.opencode/bin:$PATH"` 或使用完整路径。

### 图片选型耗时
验证 4 个商品的正确图片花了较长时间：
- Unsplash `source.unsplash.com` 已弃用，无法按关键词直接获取
- 图片分析工具（image model）出现 403 错误，需要多次尝试
- 最终通过已知 photo ID + HTTP 可访问性验证 + AI 分析组合完成

**改进方向**：建立一个小型 Unsplash photo ID 库，按产品类别预存已验证的图片 ID。

---

## Technical Decisions

### 缓存策略：category 过滤时绕过缓存
GET /api/products 的缓存只对无过滤的全量请求生效。带 `?category=` 参数时直接查数据库。

**理由**：缓存多个过滤组合的复杂度不值得（只有 10 个商品，过滤查询本身已经很快）。全量缓存覆盖了最常见的首页加载场景。

### IntersectionObserver：渐入动画而非 data-src 替换
选择了渐入动画（opacity 0→1）而非 data-src 懒加载方案。

**理由**：`loading="lazy"` 已经处理了真正的延迟加载，IntersectionObserver 只是增加视觉反馈。data-src 方案需要修改所有图片渲染逻辑，风险更高，收益相同。

### express-validator 替换手动校验
完全替换了 auth.js 中的手动 `EMAIL_RE` 正则和密码长度检查，而不是并行保留。

**理由**：两套校验逻辑并存会造成混乱，且 express-validator 的 `isEmail()` 比简单正则更健壮。

---

## Acceptance Results

| Test | Expected | Result |
|------|----------|--------|
| Empty body POST /api/orders | 422 + 5 field errors | ✅ |
| Invalid email + short password | 422 | ✅ |
| Valid order | 200 + orderId | ✅ |
| Products 3,4,5,9 image URLs | Updated Unsplash IDs | ✅ |
| CSP header allows unsplash.com | img-src includes domain | ✅ |
| API cache hit | Second request faster | ✅ |
| Phase 3/4 login regression | login: true | ✅ |

---

## Technical Debt Added

None. Phase 5 cleared debt from Phase 4 without introducing new items.

---

## Phase 6 Candidates

Based on current state, Phase 6 priorities (in order):

1. **Email verification** — currently register creates account with no email confirmation
2. **Password reset flow** — no account recovery path
3. **JWT blacklist on logout** — tokens remain valid until expiry after logout
4. **SDD refactor** — codebase approaching complexity threshold (5,000 lines)
5. **Containerization** — Docker Compose for local dev parity with production
6. **Azure SQL DB migration** — Knex dialect change (SQLite → MSSQL), zero code changes in routes

---

## Series Summary (Phase 1–5)

| Phase | Core Question | Answer |
|-------|--------------|--------|
| 1 | Can we build a working store in one session? | Yes (927 lines, 11 files) |
| 2 | Can we make it feel like a real store? | Yes (search, sort, real images, order confirm) |
| 3 | Can we add a real backend without breaking the frontend? | Yes (4 API endpoints, Knex + SQLite, zero frontend breakage) |
| 4 | Can we add auth without making guest checkout worse? | Yes (nullable user_id, backward compatible) |
| 5 | Can we harden it without slowing it down? | Yes (validation + cache + lazy load, all regressions pass) |

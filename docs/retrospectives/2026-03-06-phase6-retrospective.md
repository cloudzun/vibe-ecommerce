# Phase 6 Retrospective — Docker 三容器本地开发环境

**Date**: 2026-03-06  
**Duration**: ~1.5 hours (planning + execution + verification)  
**Commit**: `b6d4a03`

---

## What We Built

Phase 6 的目标从最初的「SDD 重构」调整为「Docker 三容器本地开发环境」。

**调整原因**：
- 代码库只有 1,972 行，远低于 SDD 触发阈值（5,000 行）
- 项目定位是教学演示，学员能快速复现比代码架构重构更有价值
- Docker 三容器架构本身就能带入微服务、容器编排、反向代理等教学内容

**最终交付**：
- `make up` 一键启动 nginx + Node.js + PostgreSQL 三容器
- 生产环境（Azure + SQLite + pm2）完全不受影响
- 无 Docker 模式（`node app.js`）继续有效
- README 完整的三种运行方式说明

---

## What Went Well

### 双模式设计干净
`server/db.js` 的环境变量切换方案非常简洁：

```javascript
const isPg = !!process.env.DATABASE_URL;
```

一行判断，两种行为，Knex 抽象层保证路由代码零改动。生产环境没有 `DATABASE_URL`，永远走 SQLite，不需要任何配置变更。

### OpenCode 7/7 一次通过
所有文件创建和修改均一次完成，无偏离，无人工干预。`【执行约束】` 头部 + 精确的代码片段规格，执行质量稳定。

### Makefile 设计实用
`make up` 自动处理 `.env` 复制（`cp -n .env.example .env`），学员第一次运行不需要任何额外步骤。`make reset` 清空 volume 重新 seed，演示重置非常方便。

### 安全设计正确
- DB 和 Backend 端口不暴露到宿主机（只通过 nginx 访问）
- `.env` 加入 `.gitignore`，不会意外提交密码
- `.env.example` 的默认值足够运行，不需要学员修改任何配置

---

## What Was Tricky

### 端口冲突（服务器特有）
服务器上 80 端口被 Nginx Proxy Manager 占用，8080 被 SearxNG 占用。需要用 8081 验证。

**解决方案**：`FRONTEND_PORT` 环境变量，默认 80，冲突时改一行配置。学员本地机器通常 80 端口空闲，不受影响。

**经验**：在服务器上验证 Docker 配置时，先检查端口占用情况（`ss -tlnp`），再决定测试端口。

### docker-compose.yml `version` 字段过时
Docker Compose v2 不再需要 `version` 字段，保留会产生警告。执行完成后手动清理。

**经验**：新建 docker-compose.yml 不需要加 `version` 字段。

---

## Architecture Decisions

### 为什么选 nginx:alpine 而不是 node serve？
nginx 是生产标准的静态文件服务器，性能更好，镜像更小（~5MB vs ~50MB），且能同时承担反向代理角色。用 Node.js 服务静态文件是反模式。

### 为什么 backend 不暴露端口？
学员只需要访问 `http://localhost/api/...`，不需要直接访问 backend 容器。通过 nginx 代理统一入口，更接近真实生产架构（所有流量经过反向代理）。

### 为什么用 healthcheck + depends_on？
PostgreSQL 启动后需要几秒才能接受连接。没有 healthcheck 的情况下，backend 可能在 db 就绪前就尝试连接，导致启动失败。`condition: service_healthy` 确保顺序正确。

### 为什么保留无 Docker 模式？
降低学员门槛。不熟悉 Docker 的学员可以先用 `node app.js` 跑起来看效果，再学 Docker 部署。两种模式共存，不互相干扰。

---

## Acceptance Results

| Test | Expected | Result |
|------|----------|--------|
| `make up` 启动三容器 | 全部 Up | ✅ |
| `http://localhost:8081` 前端页面 | HTTP 200 | ✅ |
| 健康检查（nginx → backend）| `{"status":"ok"}` | ✅ |
| 商品列表（nginx → backend → PostgreSQL）| 10 products | ✅ |
| 输入校验 | 422 + 5 errors | ✅ |
| 注册 → 登录 → 下单 → 订单历史 | 完整流程 | ✅ |
| 生产环境回归 | status: ok | ✅ |
| 无 Docker 模式（SQLite）| isPg: false | ✅ |
| DB/Backend 端口不暴露 | 无 ports 配置 | ✅ |
| .env 不在 git | git ls-files 为空 | ✅ |
| npm audit | 0 vulnerabilities | ✅ |

---

## Series Summary（Phase 1–6 完整回顾）

| Phase | 核心问题 | 答案 |
|-------|----------|------|
| 1 | AI 能多快生成可用原型？ | 40 分钟，927 行，能跑 |
| 2 | 如何在 AI 代码上做有质量的迭代？ | 7-Gate 流程 |
| 3 | 如何引入后端而不破坏前端？ | 向后兼容设计 + Knex 抽象层 |
| 4 | 如何在 AI 协作中保持架构师控制权？ | 清晰的角色边界 + 约束头部 |
| 5 | 如何硬化安全而不降低性能？ | express-validator + 缓存 + lazy load |
| 6 | 如何让任何人都能一键复现？ | Docker 三容器 + Makefile + 双模式 |

**最终状态**：一个从 Vibe Coding 原型演进到完整工程实践的全栈应用，具备：
- 完整的购物流程（浏览/购物车/结账/订单确认）
- 用户认证（JWT 双 token + bcrypt）
- 后端安全（输入校验/CSP/限流/body limit）
- 前端性能（lazy loading/API 缓存）
- 双运行环境（生产 SQLite + 本地 Docker PostgreSQL）
- 完整文档（ARCHITECTURE/ROADMAP/CONTRIBUTING/PROCESS + 6 篇博客）

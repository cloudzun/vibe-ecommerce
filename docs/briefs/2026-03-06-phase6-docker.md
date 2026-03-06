# Phase 6 BRIEF — Docker 三容器本地开发环境

**Date**: 2026-03-06  
**Author**: HuaQloud (Architect)  
**Status**: Confirmed

---

## 核心原则

**生产环境（Azure + SQLite + pm2）完全不动。**

Phase 6 只新增文件，不修改任何现有代码。唯一例外：`server/db.js` 加一层环境变量判断（SQLite vs PostgreSQL），向后完全兼容。

---

## 目标

让学员能用 `make up` 一键在本地跑起完整的三容器应用，同时：
- 生产环境（shop-api.huaqloud.com）不受任何影响
- 无 Docker 的运行方式（`node app.js`）继续有效
- README 有清晰的 Quick Start 指引

---

## 架构

```
学员本地机器 (Docker Compose)
─────────────────────────────────────────────────────
┌─────────────────────────────────────────────────────┐
│  Docker network: vibe-network                        │
│                                                      │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────┐  │
│  │  frontend    │  │  backend     │  │    db     │  │
│  │ nginx:alpine │  │ node:22-alpine│  │ postgres:16│ │
│  │ port 80      │  │ port 3001    │  │ port 5432 │  │
│  │ 静态文件      │  │ Express API  │  │ PostgreSQL│  │
│  └──────┬───────┘  └──────┬───────┘  └─────┬─────┘  │
│         │                 │                │        │
│  学员访问 http://localhost  │  容器内通信     │        │
└─────────────────────────────────────────────────────┘

数据持久化: Docker volume → postgres_data
环境变量:   .env 文件（学员复制 .env.example 修改）
```

---

## Definition of Done

### 新增文件（不修改任何现有文件，除 db.js）

- [ ] `docker/frontend/Dockerfile` — nginx:alpine 服务静态文件
- [ ] `docker/frontend/nginx.conf` — 静态文件 + API 代理配置
- [ ] `docker/backend/Dockerfile` — node:22-alpine 运行 Express
- [ ] `docker-compose.yml` — 三服务编排（根目录）
- [ ] `.env.example` — 环境变量模板
- [ ] `Makefile` — up/down/logs/seed/reset 命令
- [ ] `server/db.js` — 加 PostgreSQL 支持（环境变量切换，SQLite 默认保留）

### 功能验收

- [ ] `make up` 启动三容器，无报错
- [ ] `http://localhost` 加载前端页面
- [ ] 前端能调用后端 API（通过 nginx 代理）
- [ ] 后端能连接 PostgreSQL
- [ ] 数据库自动初始化（表 + 种子数据）
- [ ] `make down` 停止所有容器
- [ ] `make reset` 清空数据后重新 seed
- [ ] 无 Docker 模式仍然有效：`cd server && node app.js`（SQLite）
- [ ] 生产 API `https://shop-api.huaqloud.com/health` 仍然返回 200

---

## 关键技术决策

### db.js 双模式设计

```javascript
// 有 DATABASE_URL → PostgreSQL（Docker 环境）
// 无 DATABASE_URL → SQLite（生产/本地无 Docker）
const isPg = !!process.env.DATABASE_URL;

const knex = require('knex')(isPg ? {
  client: 'pg',
  connection: process.env.DATABASE_URL,
} : {
  client: 'better-sqlite3',
  connection: { filename: './data/shop.db' },
  useNullAsDefault: true
});
```

### nginx.conf 路由规则

```nginx
# /api/* → 代理到 backend 容器
location /api/ {
  proxy_pass http://backend:3001;
}
# 其他 → 静态文件（SPA fallback）
location / {
  try_files $uri $uri/ /index.html;
}
```

### CORS 更新

`server/app.js` 的 CORS origin 需要加 `http://localhost`（Docker 前端访问）。
这是唯一需要修改的现有文件（除 db.js）。

---

## 失败线（Failure Lines）

- ❌ 生产 API 不能受影响（shop-api.huaqloud.com 必须继续工作）
- ❌ 无 Docker 的 `node app.js` 不能 break
- ❌ 不能修改任何 routes/*.js、middleware/*.js
- ❌ 不能修改 Vercel 前端代码

---

## 约束

- PostgreSQL 版本：16（LTS）
- Node.js 版本：22-alpine（与生产一致）
- nginx 版本：alpine（最新稳定）
- 新增 npm 依赖：`pg`（PostgreSQL 驱动）
- `.env` 不提交到 git（加入 .gitignore）
- `.env.example` 提交到 git（模板）

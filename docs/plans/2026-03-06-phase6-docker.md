# Phase 6 Implementation Plan — Docker 三容器

**Date**: 2026-03-06  
**Author**: HuaQloud (Architect)

执行顺序：E1 → E2 → E3 → E4 → E5 → E6 → E7（顺序依赖）

---

## Task E1：修改 server/db.js — 双模式支持

**Input**: `server/db.js`（现有）  
**Output**: `server/db.js`（修改）  
**改动范围**: 仅修改 knex 初始化部分，其余代码不动

将文件顶部的 knex 初始化替换为：

```javascript
const isPg = !!process.env.DATABASE_URL;

const knexConfig = isPg
  ? {
      client: 'pg',
      connection: process.env.DATABASE_URL,
    }
  : {
      client: 'better-sqlite3',
      connection: { filename: './data/shop.db' },
      useNullAsDefault: true,
    };

const knex = require('knex')(knexConfig);

// 只在 SQLite 模式下创建 data 目录
if (!isPg) {
  const fs = require('fs');
  if (!fs.existsSync('./data')) fs.mkdirSync('./data');
}
```

`initDb()` 函数内容完全不变（Knex 抽象层保证 SQLite/PG 兼容）。

**Verification**:
```bash
# SQLite 模式（无环境变量）
cd server && node -e "const {knex} = require('./db'); console.log(knex.client.config.client)"
# 输出: better-sqlite3

# PG 模式（有环境变量）
DATABASE_URL=postgresql://x:x@localhost/x node -e "const {knex} = require('./db'); console.log(knex.client.config.client)"
# 输出: pg
```

---

## Task E2：修改 server/app.js — 添加 localhost CORS

**Input**: `server/app.js`  
**Output**: `server/app.js`（仅修改 CORS origin 数组）

在 origin 数组中加入 `'http://localhost'`：

```javascript
app.use(cors({
  origin: [
    'https://vibe-ecommerce-seven.vercel.app',
    'http://localhost:8080',
    'http://localhost:3000',
    'http://localhost',        // ← 新增：Docker 前端容器
  ],
  // ... 其余不变
}));
```

**Verification**: `node --check server/app.js`

---

## Task E3：安装 pg 驱动

**Input**: `server/package.json`  
**Output**: `server/package.json`（更新）

```bash
cd server && npm install pg
```

**Verification**: `grep '"pg"' server/package.json`

---

## Task E4：创建后端 Dockerfile

**Output**: `docker/backend/Dockerfile`（新建）

```dockerfile
FROM node:22-alpine

WORKDIR /app

# 先复制依赖文件，利用 Docker layer cache
COPY server/package*.json ./

RUN npm install --omit=dev

# 复制服务端代码
COPY server/ .

EXPOSE 3001

CMD ["node", "app.js"]
```

**注意**: COPY 路径相对于 docker-compose.yml 所在目录（项目根目录），所以是 `server/`。

**Verification**: `docker build -f docker/backend/Dockerfile -t vibe-backend . && echo "BUILD OK"`

---

## Task E5：创建前端 Dockerfile + nginx.conf

**Output**: 
- `docker/frontend/Dockerfile`（新建）
- `docker/frontend/nginx.conf`（新建）

**Dockerfile**:
```dockerfile
FROM nginx:alpine

# 复制静态文件
COPY index.html /usr/share/nginx/html/
COPY css/ /usr/share/nginx/html/css/
COPY js/ /usr/share/nginx/html/js/

# 复制 nginx 配置
COPY docker/frontend/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
```

**nginx.conf**:
```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    # API 请求代理到后端容器
    location /api/ {
        proxy_pass http://backend:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # 健康检查代理
    location /health {
        proxy_pass http://backend:3001;
    }

    # SPA fallback — 所有路由返回 index.html
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

**Verification**: `docker build -f docker/frontend/Dockerfile -t vibe-frontend . && echo "BUILD OK"`

---

## Task E6：创建 docker-compose.yml + .env.example

**Output**:
- `docker-compose.yml`（根目录，新建）
- `.env.example`（根目录，新建）

**docker-compose.yml**:
```yaml
version: '3.9'

services:
  db:
    image: postgres:16-alpine
    container_name: vibe-db
    environment:
      POSTGRES_DB: ${POSTGRES_DB:-vibe_shop}
      POSTGRES_USER: ${POSTGRES_USER:-vibe}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-vibepass}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - vibe-network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER:-vibe}"]
      interval: 5s
      timeout: 5s
      retries: 5

  backend:
    build:
      context: .
      dockerfile: docker/backend/Dockerfile
    container_name: vibe-backend
    environment:
      PORT: 3001
      DATABASE_URL: postgresql://${POSTGRES_USER:-vibe}:${POSTGRES_PASSWORD:-vibepass}@db:5432/${POSTGRES_DB:-vibe_shop}
      JWT_SECRET: ${JWT_SECRET:-local-dev-secret-change-in-production}
      NODE_ENV: development
    depends_on:
      db:
        condition: service_healthy
    networks:
      - vibe-network

  frontend:
    build:
      context: .
      dockerfile: docker/frontend/Dockerfile
    container_name: vibe-frontend
    ports:
      - "80:80"
    depends_on:
      - backend
    networks:
      - vibe-network

volumes:
  postgres_data:

networks:
  vibe-network:
    driver: bridge
```

**.env.example**:
```bash
# Database
POSTGRES_DB=vibe_shop
POSTGRES_USER=vibe
POSTGRES_PASSWORD=vibepass

# JWT (change this in any real environment!)
JWT_SECRET=local-dev-secret-change-in-production

# Backend port (optional, default 3001)
PORT=3001
```

---

## Task E7：创建 Makefile + 更新 .gitignore

**Output**:
- `Makefile`（根目录，新建）
- `.gitignore`（修改，加入 `.env`）

**Makefile**:
```makefile
.PHONY: up down logs seed reset build ps help

## 启动所有容器（后台运行）
up:
	cp -n .env.example .env 2>/dev/null || true
	docker compose up -d --build
	@echo "✅ Started. Open http://localhost"

## 停止所有容器
down:
	docker compose down

## 查看日志（实时）
logs:
	docker compose logs -f

## 仅查看后端日志
logs-backend:
	docker compose logs -f backend

## 重新初始化数据库（清空数据 + 重新 seed）
reset:
	docker compose down -v
	docker compose up -d --build
	@echo "✅ Database reset. Open http://localhost"

## 构建镜像（不启动）
build:
	docker compose build

## 查看容器状态
ps:
	docker compose ps

## 显示帮助
help:
	@echo ""
	@echo "vibe-ecommerce Docker commands:"
	@echo "  make up       - Start all containers"
	@echo "  make down     - Stop all containers"
	@echo "  make logs     - Follow all logs"
	@echo "  make reset    - Reset database (clear all data)"
	@echo "  make build    - Build images only"
	@echo "  make ps       - Show container status"
	@echo ""
```

**.gitignore 追加**:
```
.env
```

---

## Post-Execution Checklist (GATE 3+4)

```bash
# 1. 启动
make up

# 2. 等待约 15 秒后检查容器状态
make ps
# 期望: vibe-db, vibe-backend, vibe-frontend 全部 Up

# 3. 前端可访问
curl -s -o /dev/null -w "%{http_code}" http://localhost
# 期望: 200

# 4. 后端健康检查（通过 nginx 代理）
curl -s http://localhost/health
# 期望: {"status":"ok",...}

# 5. API 可访问
curl -s http://localhost/api/products | python3 -c "import sys,json; d=json.load(sys.stdin); print(len(d['data']),'products')"
# 期望: 10 products

# 6. 端到端：注册 + 下单
curl -s -X POST http://localhost/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"docker@test.com","password":"test123456"}' | python3 -m json.tool

# 7. 生产环境回归（最重要）
curl -s https://shop-api.huaqloud.com/health
# 期望: {"status":"ok",...}

# 8. 无 Docker 模式回归
cd server && node -e "require('./db'); console.log('SQLite mode OK')"
```

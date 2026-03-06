# vibe-ecommerce

> LAB-14 毕业项目参考实现 — 一个从 Vibe Coding 原型演进到生产级全栈应用的完整工程案例

[![Live Demo](https://img.shields.io/badge/Demo-在线预览-blue)](https://vibe-ecommerce-seven.vercel.app)
[![API](https://img.shields.io/badge/API-生产环境-green)](https://shop-api.huaqloud.com/health)
[![Blog](https://img.shields.io/badge/Blog-系列文章-orange)](https://blog.huaqloud.com/tags/vibe-coding/)

---

## 这是什么

这是 [OpenCode Labs LAB-14](https://github.com/cloudzun/opencode-labs/blob/main/LAB-14-capstone-project.md) 毕业项目的参考实现。

项目本身是一个电商 SPA，但重点不是电商功能本身，而是**完整记录了一个产品从 40 分钟原型到生产级应用的演进过程**——每个阶段的架构决策、质量门控、技术债权衡都有据可查。

如果你正在学习 LAB-14，这个仓库可以帮你：
- 理解每个阶段「上下文文档」应该写到什么程度
- 看到真实的 7-Gate 质量流程是如何执行的
- 参考各阶段的技术选型和决策理由

---

## 演进历程

| 阶段 | 状态 | 核心内容 | 对应 LAB |
|------|------|----------|---------|
| Phase 1 | ✅ | Vibe Coding 原型，40 分钟，927 行，完整购物流程 | LAB-06 |
| Phase 2 | ✅ | 前端迭代：搜索、排序、商品详情、订单确认 | LAB-03 |
| Phase 3 | ✅ | 后端 API：Node.js + Express + SQLite，上线至 Azure | LAB-03 |
| Phase 4 | ✅ | 用户认证：JWT 双 Token + bcrypt，订单历史 | LAB-03/09 |
| Phase 5 | ✅ | 安全加固 + 性能优化：输入校验、懒加载、API 缓存 | LAB-10/11 |
| Phase 6 | ✅ | Docker 三容器本地开发环境：nginx + Node.js + PostgreSQL | LAB-13 |

---

## 快速开始

### 方式一：Docker（推荐）

**前提**：已安装 [Docker Desktop](https://www.docker.com/products/docker-desktop/)（Mac/Windows）或 Docker Engine（Linux）

```bash
git clone https://github.com/cloudzun/vibe-ecommerce.git
cd vibe-ecommerce
make up
```

启动后访问 http://localhost，三个容器自动就绪：前端（nginx）、后端（Node.js）、数据库（PostgreSQL）。

```bash
make down     # 停止
make reset    # 清空数据库重新初始化
make logs     # 查看日志
make help     # 所有命令
```

> **端口冲突？** 在项目根目录创建 `.env` 文件，加一行 `FRONTEND_PORT=8081`，再运行 `make up`。

### 方式二：仅前端

无需后端，前端直接连接线上生产 API：

```bash
git clone https://github.com/cloudzun/vibe-ecommerce.git
cd vibe-ecommerce
python3 -m http.server 8080
# 或：npx serve .
```

访问 http://localhost:8080

### 方式三：本地后端（无 Docker）

```bash
git clone https://github.com/cloudzun/vibe-ecommerce.git
cd vibe-ecommerce/server
npm install
node app.js        # 后端启动在 3001 端口

# 另开终端
cd ..
python3 -m http.server 8080   # 前端
```

---

## 技术栈

| 层 | 技术 | 说明 |
|----|------|------|
| 前端 | Vanilla JS + HTML/CSS | 无构建工具，零依赖 |
| 后端 | Node.js + Express | 轻量，易读 |
| 数据库 | SQLite（生产）/ PostgreSQL（Docker）| Knex 抽象层，代码零改动切换 |
| 认证 | JWT + bcrypt | 双 Token（access + refresh） |
| 安全 | helmet + express-validator + rate-limit | 纵深防御 |
| 部署 | Vercel（前端）+ Azure Linux VM（后端）| 生产环境 |
| 容器 | Docker Compose（三容器）| 本地开发 |

---

## 项目文档

| 文档 | 内容 |
|------|------|
| [ARCHITECTURE.md](docs/ARCHITECTURE.md) | 架构设计、模块说明、数据流、技术债 |
| [ROADMAP.md](docs/ROADMAP.md) | 各阶段演进计划与决策记录 |
| [CONTRIBUTING.md](docs/CONTRIBUTING.md) | 7-Gate 工作流、OpenCode 提示词模板 |
| [PROCESS.md](PROCESS.md) | 架构师 / 执行者角色定义、异常处理 |
| [docs/briefs/](docs/briefs/) | 各阶段上下文文档（BRIEF） |
| [docs/plans/](docs/plans/) | 各阶段实现计划 |
| [docs/retrospectives/](docs/retrospectives/) | 各阶段复盘 |

---

## 配套博客

| 文章 | 阶段 |
|------|------|
| [Vibe Coding with OpenCode + Superpowers](https://blog.huaqloud.com/posts/2026-03-04-vibe-coding-opencode-superpowers/) | Phase 1 |
| [为什么需要 7 个质量门控](https://blog.huaqloud.com/posts/2026-03-04-vibe-coding-qa-gates/) | Phase 1 |
| [迭代系列 #1：Phase 2 前端打磨](https://blog.huaqloud.com/posts/2026-03-04-vibe-ecommerce-iteration-phase2/) | Phase 2 |
| [迭代系列 #2：Phase 3 后端架构](https://blog.huaqloud.com/posts/2026-03-05-vibe-ecommerce-phase3-backend/) | Phase 3 |
| [迭代系列 #3：Phase 4 用户认证](https://blog.huaqloud.com/posts/2026-03-05-vibe-ecommerce-phase4-auth/) | Phase 4 |
| [迭代系列 #4：Phase 5 安全与性能](https://blog.huaqloud.com/posts/2026-03-06-vibe-ecommerce-phase5-security/) | Phase 5 |

---

## 质量流程

每个阶段都经过完整的 7-Gate 验收，不跳过任何一关：

```
GATE 0  确认 BRIEF（目标、约束、验收标准）
GATE 1  写实现计划（任务分解、验证步骤）
GATE 2  OpenCode 执行（架构师监控，偏离立即干预）
GATE 3  服务重启 + 冒烟测试
GATE 4  功能验收（所有用例通过）
GATE 5  安全检查清单
GATE 6  文档更新
GATE 7  部署验证（生产环境回归）
```

详见 [CONTRIBUTING.md](docs/CONTRIBUTING.md)。

---

## 继续探索

项目到这里是一个里程碑，但不是终点。

[FUTURE.md](FUTURE.md) 列出了已知的安全问题和 6 个后续功能 Phase（Phase 7–12），每个都有明确的学习目标和验收标准。感兴趣的同学可以把它当作自己的下一个项目继续做。

---

## License

MIT

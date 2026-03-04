# 上下文文档 - Phase 2 前端功能完善

## 项目背景
纯前端 Vanilla JS SPA，hash-based 路由，10 个电子产品，localStorage 购物车。
已修复：XSS、localStorage 崩溃、路由 404、负数数量。
刚加了：商品描述显示、Unsplash 真实图片（Mechanical Keyboard 图片待修）。

## 之前尝试过什么
Phase 1 完成了完整的购物流程（浏览→详情→加购→结账），但存在以下问题：
- 产品列表卡片没有点击进入详情页的入口（只有 Add to Cart 按钮）
- Mechanical Keyboard 的 Unsplash 图片链接无效
- 没有搜索功能
- 没有商品排序
- Checkout 后没有订单确认页

## 成功与失败的定义
- 成功标准：
  1. 所有商品卡片可点击进入详情页
  2. Mechanical Keyboard 图片正常显示
  3. 搜索框可实时过滤商品
  4. 支持按价格/评分排序
  5. Checkout 后显示订单确认页（含订单号、商品清单、总价）
- 失败红线：
  - 不能破坏现有购物车逻辑
  - 不能破坏现有路由（#products, #product-detail, #cart, #checkout）
  - 不能引入新的 XSS 漏洞

## 谁会受影响
- 受影响文件：js/components/products.js、js/components/checkout.js、js/data.js、css/styles.css
- 需要新增：js/components/order-confirmation.js
- 需要回归测试：购物车加减、结账流程、路由跳转

## 约束条件
- 技术约束：纯 Vanilla JS，无框架，无构建工具
- 不能动：js/router.js 的核心路由逻辑、js/store.js 的 CartStore 接口
- 质量约束：所有用户输入必须经过 escapeHtml()

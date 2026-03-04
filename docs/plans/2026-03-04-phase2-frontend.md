# 实现计划 - Phase 2 前端功能完善

## Task 1: 修复 Mechanical Keyboard 图片
- 输入：js/data.js
- 输出：修改 id=8 的 image URL 为可用的键盘图片
- 验证：curl 图片 URL 返回 200
- 预计时间：2 分钟

## Task 2: 商品卡片点击进入详情页
- 输入：js/components/products.js、css/styles.css
- 输出：卡片整体可点击，cursor:pointer，跳转 #product-detail?id=N
- 验证：点击卡片（非按钮区域）能进入详情页
- 预计时间：5 分钟

## Task 3: 搜索框 + 实时过滤
- 输入：js/components/products.js、css/styles.css
- 输出：filter-bar 上方加搜索框，输入时实时过滤商品名称
- 验证：输入 "head" 只显示 Headphones 和 Earbuds
- 预计时间：5 分钟

## Task 4: 商品排序
- 输入：js/components/products.js、css/styles.css
- 输出：排序下拉框（默认/价格低→高/价格高→低/评分高→低）
- 验证：选择"价格低→高"后商品按价格升序排列
- 预计时间：5 分钟

## Task 5: 订单确认页
- 输入：js/components/checkout.js、js/router.js、css/styles.css
- 输出：新增 #order-confirmation 路由，显示订单号、商品清单、总价、返回首页按钮；checkout 成功后跳转到此页并清空购物车
- 验证：完成结账后跳转到确认页，购物车清空，刷新页面确认页仍可访问（含订单数据）
- 预计时间：10 分钟

const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const { knex } = require('../db');
const { validateOrder, handleValidationErrors } = require("../middleware/validate");

// POST /api/orders
router.post("/", validateOrder, handleValidationErrors, async (req, res) => {
  try {
    const { name, email, address, items, total } = req.body;

    // Validate
    if (!name || !email || !address || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }
    if (typeof total !== 'number' || total <= 0) {
      return res.status(400).json({ success: false, error: 'Invalid total' });
    }

    // 可选：从 Authorization header 读取 user_id（登录用户）
    let user_id = null;
    const auth = req.headers.authorization;
    if (auth && auth.startsWith('Bearer ')) {
      try {
        const payload = jwt.verify(auth.slice(7), process.env.JWT_SECRET);
        user_id = payload.id;
      } catch (e) { /* 游客订单，忽略 */ }
    }

    const orderId = 'ORD-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).substr(2, 4).toUpperCase();

    await knex.transaction(async trx => {
      await trx('orders').insert({ id: orderId, name, email, address, total, user_id });
      await trx('order_items').insert(
        items.map(item => ({
          order_id: orderId,
          product_id: item.id,
          quantity: item.quantity,
          price: item.price
        }))
      );
    });

    res.status(201).json({ success: true, data: { orderId } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Failed to create order' });
  }
});

// GET /api/orders/:id
router.get('/:id', async (req, res) => {
  try {
    const order = await knex('orders').where('id', req.params.id).first();
    if (!order) return res.status(404).json({ success: false, error: 'Order not found' });

    const items = await knex('order_items as oi')
      .join('products as p', 'oi.product_id', 'p.id')
      .where('oi.order_id', req.params.id)
      .select('p.name', 'oi.quantity', 'oi.price');

    res.json({ success: true, data: { ...order, items } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Failed to fetch order' });
  }
});

module.exports = router;

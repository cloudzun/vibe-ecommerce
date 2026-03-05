const express = require('express');
const verifyToken = require('../middleware/auth');
const { knex } = require('../db');

const router = express.Router();

// GET /api/users/me/orders — authenticated
router.get('/me/orders', verifyToken, async (req, res) => {
  try {
    const orders = await knex('orders')
      .where({ user_id: req.user.id })
      .orderBy('created_at', 'desc');

    // Attach items to each order
    const result = await Promise.all(orders.map(async (order) => {
      const items = await knex('order_items')
        .join('products', 'order_items.product_id', 'products.id')
        .where('order_items.order_id', order.id)
        .select(
          'order_items.product_id',
          'products.name',
          'order_items.quantity',
          'order_items.price'
        );
      return { ...order, items };
    }));

    res.json({ success: true, data: result });
  } catch (e) {
    console.error('Get orders error:', e.message);
    res.status(500).json({ success: false, error: 'Failed to fetch orders' });
  }
});

module.exports = router;

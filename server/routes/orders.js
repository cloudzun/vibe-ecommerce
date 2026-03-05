const express = require('express');
const router = express.Router();
const { knex } = require('../db');

// POST /api/orders
router.post('/', async (req, res) => {
  try {
    const { name, email, address, items, total } = req.body;

    // Validate
    if (!name || !email || !address || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }
    if (typeof total !== 'number' || total <= 0) {
      return res.status(400).json({ success: false, error: 'Invalid total' });
    }

    const orderId = 'ORD-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).substr(2, 4).toUpperCase();

    await knex.transaction(async trx => {
      await trx('orders').insert({ id: orderId, name, email, address, total });
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

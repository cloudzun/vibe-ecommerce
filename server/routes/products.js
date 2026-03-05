const express = require('express');
const router = express.Router();
const { knex } = require('../db');

// GET /api/products?category=audio&search=head&sort=price_asc
router.get('/', async (req, res) => {
  try {
    const { category, search, sort } = req.query;
    let query = knex('products');

    if (category && category !== 'all') {
      query = query.where('category', category);
    }
    if (search) {
      query = query.whereILike('name', `%${search}%`);
    }
    if (sort === 'price_asc')  query = query.orderBy('price', 'asc');
    else if (sort === 'price_desc') query = query.orderBy('price', 'desc');
    else if (sort === 'rating_desc') query = query.orderBy('rating', 'desc');

    const products = await query.select();
    res.json({ success: true, data: products });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Failed to fetch products' });
  }
});

// GET /api/products/:id
router.get('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ success: false, error: 'Invalid product id' });

    const product = await knex('products').where('id', id).first();
    if (!product) return res.status(404).json({ success: false, error: 'Product not found' });

    res.json({ success: true, data: product });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Failed to fetch product' });
  }
});

module.exports = router;

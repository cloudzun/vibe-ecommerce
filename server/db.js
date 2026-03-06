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

if (!isPg) {
  const fs = require('fs');
  if (!fs.existsSync('./data')) fs.mkdirSync('./data');
}

async function initDb() {
  // Products table
  const hasProducts = await knex.schema.hasTable('products');
  if (!hasProducts) {
    await knex.schema.createTable('products', t => {
      t.integer('id').primary();
      t.string('name').notNullable();
      t.string('category').notNullable();
      t.float('price').notNullable();
      t.string('image');
      t.text('description');
      t.float('rating').defaultTo(0);
    });

    // Seed products (same as js/data.js)
    await knex('products').insert([
      { id: 1, name: 'Wireless Headphones', category: 'audio', price: 79.99, rating: 4.5, description: 'Premium sound quality with active noise cancellation and 30-hour battery life.', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop' },
      { id: 2, name: 'Mechanical Keyboard', category: 'computers', price: 129.99, rating: 4.7, description: 'Tactile mechanical switches with RGB backlighting and programmable macros.', image: 'https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=400&h=300&fit=crop' },
      { id: 3, name: 'USB-C Hub', category: 'accessories', price: 49.99, rating: 4.3, description: '7-in-1 hub with 4K HDMI, 100W PD charging, and USB 3.0 ports.', image: 'https://images.unsplash.com/photo-1625895197185-efcec01cffe0?w=400&h=300&fit=crop' },
      { id: 4, name: 'Webcam HD', category: 'computers', price: 89.99, rating: 4.4, description: '1080p webcam with built-in ring light and noise-canceling microphone.', image: 'https://images.unsplash.com/photo-1587826080692-f439cd0b70da?w=400&h=300&fit=crop' },
      { id: 5, name: 'Portable SSD', category: 'storage', price: 109.99, rating: 4.6, description: '1TB portable SSD with USB 3.2 Gen 2, up to 1050MB/s read speed.', image: 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=400&h=300&fit=crop' },
      { id: 6, name: 'Smart Watch', category: 'wearables', price: 199.99, rating: 4.2, description: 'Health tracking, GPS, and 5-day battery with always-on display.', image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=300&fit=crop' },
      { id: 7, name: 'Bluetooth Speaker', category: 'audio', price: 59.99, rating: 4.4, description: 'Waterproof portable speaker with 360° sound and 12-hour playtime.', image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400&h=300&fit=crop' },
      { id: 8, name: 'Gaming Mouse', category: 'accessories', price: 69.99, rating: 4.6, description: 'Precision gaming mouse with 16000 DPI sensor and 7 programmable buttons.', image: 'https://images.unsplash.com/photo-1527814050087-3793815479db?w=400&h=300&fit=crop' },
      { id: 9, name: 'Monitor Stand', category: 'accessories', price: 39.99, rating: 4.1, description: 'Ergonomic monitor stand with cable management and USB hub.', image: 'https://images.unsplash.com/photo-1593640408182-31c228b29b5e?w=400&h=300&fit=crop' },
      { id: 10, name: 'Laptop Backpack', category: 'accessories', price: 89.99, rating: 4.5, description: 'Water-resistant backpack with dedicated 15.6" laptop compartment and USB charging port.', image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=300&fit=crop' }
    ]);
    console.log('✅ Products seeded');
  }

  // Orders table
  const hasOrders = await knex.schema.hasTable('orders');
  if (!hasOrders) {
    await knex.schema.createTable('orders', t => {
      t.string('id').primary();
      t.string('name').notNullable();
      t.string('email').notNullable();
      t.string('address').notNullable();
      t.float('total').notNullable();
      t.timestamp('created_at').defaultTo(knex.fn.now());
    });
    console.log('✅ Orders table created');
  }

  // Order items table
  const hasItems = await knex.schema.hasTable('order_items');
  if (!hasItems) {
    await knex.schema.createTable('order_items', t => {
      t.increments('id');
      t.string('order_id').references('id').inTable('orders');
      t.integer('product_id').references('id').inTable('products');
      t.integer('quantity').notNullable();
      t.float('price').notNullable(); // snapshot price at order time
    });
    console.log('✅ Order items table created');
  }

  // Users table (Phase 4)
  const hasUsers = await knex.schema.hasTable('users');
  if (!hasUsers) {
    await knex.schema.createTable('users', t => {
      t.increments('id');
      t.string('email').unique().notNullable();
      t.string('password_hash').notNullable();
      t.timestamp('created_at').defaultTo(knex.fn.now());
    });
    console.log('✅ Users table created');
  }

  // Add user_id to orders (Phase 4, nullable for backward compat)
  const hasUserId = await knex.schema.hasColumn('orders', 'user_id');
  if (!hasUserId) {
    await knex.schema.table('orders', t => {
      t.integer('user_id').references('id').inTable('users').nullable();
    });
    console.log('✅ orders.user_id column added');
  }
}

module.exports = { knex, initDb };

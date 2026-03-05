const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { initDb } = require('./db');

const app = express();
const PORT = process.env.PORT || 3001;

// Security headers
app.use(helmet());

// CORS — allow Vercel frontend + local dev
app.use(cors({
  origin: [
    'https://vibe-ecommerce-seven.vercel.app',
    'http://localhost:8080',
    'http://localhost:3000',
    'null' // allow file:// for local dev
  ],
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
}));

app.use(express.json());

// Routes
app.use('/api/products', require('./routes/products'));
app.use('/api/orders', require('./routes/orders'));

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

// 404
app.use((req, res) => res.status(404).json({ success: false, error: 'Not found' }));

// Start
initDb().then(() => {
  app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
  });
}).catch(err => {
  console.error('❌ DB init failed:', err);
  process.exit(1);
});

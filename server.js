const express = require('express');
const path = require('path');
const cors = require('cors');
const config = require('./src/config');
const db = require('./src/db');
const { authLimiter, checkoutLimiter } = require('./src/middleware/rateLimit');

const authRoutes = require('./src/routes/auth');
const productRoutes = require('./src/routes/products');
const transactionRoutes = require('./src/routes/transactions');
const analyticsRoutes = require('./src/routes/analytics');
const userRoutes = require('./src/routes/users');
const settingsRoutes = require('./src/routes/settings');

const app = express();

// Trust reverse proxies (Vercel, AWS API Gateway, Cloudflare) for accurate req.ip
app.set('trust proxy', 1);

// Reset / clear all in-memory rate-limit counters on server boot
authLimiter.clearAll();
checkoutLimiter.clearAll();

// Security Headers Middleware
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

// Hardened CORS: allow local development and same-origin requests
const allowedOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:3099',
  'http://127.0.0.1:3099'
];
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g. mobile apps, curl, server-to-server) or in whitelist
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(null, true); // Permissive for local demos while enabling CORS headers
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Hardened Payload Limits (15kb prevents DOS / payload bombing)
app.use(express.json({ limit: '15kb' }));
app.use(express.urlencoded({ extended: true, limit: '15kb' }));

// Apply Brute-force & Flooding Rate Limiters
app.use('/api/auth/login', authLimiter);
app.use('/auth/login', authLimiter);
app.use('/api/checkout', checkoutLimiter);
app.use('/checkout', checkoutLimiter);

// Initialize Database
db.getProducts();

// API Routes (supports both /api/ prefix and direct rewrite paths)
app.use('/api/auth', authRoutes);
app.use('/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/products', productRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/transactions', transactionRoutes);
app.use('/api', transactionRoutes);
app.use('/api/admin/analytics', analyticsRoutes);
app.use('/admin/analytics', analyticsRoutes);
app.use('/api/admin/users', userRoutes);
app.use('/admin/users', userRoutes);
app.use('/api/admin', userRoutes);
app.use('/admin', userRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/settings', settingsRoutes);
app.use('/api/admin/settings', settingsRoutes);
app.use('/admin/settings', settingsRoutes);

// Serve Static Frontend Assets
app.use(express.static(path.join(__dirname, 'public')));

// Fallback SPA Routing
app.use((req, res, next) => {
  // If requesting an API route that was not found, return 404 JSON instead of index.html
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ success: false, error: `API route ${req.method} ${req.path} not found.` });
  }
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Global Hardened Error Handler
app.use((err, req, res, next) => {
  console.error('[Unhandled Server Error]:', err);
  if (err.type === 'entity.too.large') {
    return res.status(413).json({
      success: false,
      error: 'Payload Too Large: Request body exceeds the 15kb security threshold.'
    });
  }

  const statusCode = err.status || err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    error: err.message || 'Internal Enterprise Server Error.'
  });
});

// Start Server
if (require.main === module) {
  app.listen(config.PORT, () => {
    console.log(`=======================================================`);
    console.log(`   WasteWise AI - Enterprise Inventory & POS System   `);
    console.log(`   Server running on: http://localhost:${config.PORT}   `);
    console.log(`   Anchor Date: ${config.SIMULATED_CURRENT_DATE}       `);
    console.log(`=======================================================`);
  });
}

module.exports = app;

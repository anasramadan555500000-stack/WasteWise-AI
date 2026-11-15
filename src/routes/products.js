const express = require('express');
const router = express.Router();
const db = require('../db');
const config = require('../config');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { validateProduct } = require('../middleware/validate');
const { enrichProductWithExpiry } = require('../utils/expiry');
const { fetchProductsFromSupabase, syncProductToSupabase } = require('../supabase');
const { getClientIp } = require('../utils/ip');

function isValidId(id) {
  return typeof id === 'string' && /^[a-zA-Z0-9_-]{2,64}$/.test(id);
}

// GET /api/products (Cashiers & Admins)
router.get('/', authenticateToken, async (req, res) => {
  let products = db.getProducts();

  // Dynamically fetch from Supabase with robust fallback
  try {
    const supabaseProducts = await fetchProductsFromSupabase();
    if (supabaseProducts && supabaseProducts.length > 0) {
      supabaseProducts.forEach(sp => {
        const local = products.find(p => p.id === sp.id);
        if (local) {
          local.stock = sp.stock;
          local.sellingPrice = sp.sellingPrice;
          local.price = sp.sellingPrice;
          local.expiryDate = sp.expiryDate;
        } else {
          products.push(sp);
        }
      });
    }
  } catch (err) {
    // Non-blocking fallback to local verified mock data
    console.info('[Products] Supabase sync fallback active.');
  }

  const isAdmin = req.user && req.user.role === 'admin';

  const enriched = products.map(p => {
    const product = enrichProductWithExpiry(p, config.SIMULATED_CURRENT_DATE);
    if (!isAdmin) {
      // CASHIER ROLE RESTRICTION: Cashier CANNOT view financial margins or cost prices
      delete product.costPrice;
    }
    return product;
  });

  res.json({
    success: true,
    count: enriched.length,
    currentDate: config.SIMULATED_CURRENT_DATE,
    products: enriched
  });
});

// GET /api/products/:id
router.get('/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  if (!isValidId(id)) {
    return res.status(400).json({ success: false, error: 'Invalid product ID format.' });
  }

  const product = db.getProductById(id);
  if (!product) {
    return res.status(404).json({ success: false, error: 'Product not found.' });
  }

  const isAdmin = req.user && req.user.role === 'admin';
  const enriched = enrichProductWithExpiry(product, config.SIMULATED_CURRENT_DATE);
  if (!isAdmin) {
    delete enriched.costPrice;
  }

  res.json({ success: true, product: enriched });
});

// POST /api/products (Admin Only)
router.post('/', authenticateToken, requireRole('admin'), validateProduct, async (req, res) => {
  try {
    const auditUser = {
      id: req.user.id,
      name: req.user.name,
      ip: getClientIp(req)
    };

    const newProduct = db.addProduct(req.body, auditUser);
    const enriched = enrichProductWithExpiry(newProduct, config.SIMULATED_CURRENT_DATE);
    
    // Asynchronously sync with Supabase
    syncProductToSupabase(newProduct).catch(() => {});

    res.status(201).json({
      success: true,
      message: `Product "${newProduct.name}" added successfully.`,
      product: enriched
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /api/products/:id (Admin Only)
router.put('/:id', authenticateToken, requireRole('admin'), validateProduct, async (req, res) => {
  const { id } = req.params;
  if (!isValidId(id)) {
    return res.status(400).json({ success: false, error: 'Invalid product ID format.' });
  }

  try {
    const auditUser = {
      id: req.user.id,
      name: req.user.name,
      ip: getClientIp(req)
    };

    const updated = db.updateProduct(id, req.body, auditUser);
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Product not found.' });
    }
    const enriched = enrichProductWithExpiry(updated, config.SIMULATED_CURRENT_DATE);

    // Asynchronously sync with Supabase
    syncProductToSupabase(updated).catch(() => {});

    res.json({
      success: true,
      message: `Product "${updated.name}" updated successfully.`,
      product: enriched
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /api/products/:id (Admin Only)
router.delete('/:id', authenticateToken, requireRole('admin'), (req, res) => {
  const { id } = req.params;
  if (!isValidId(id)) {
    return res.status(400).json({ success: false, error: 'Invalid product ID format.' });
  }

  const auditUser = {
    id: req.user.id,
    name: req.user.name,
    ip: getClientIp(req)
  };

  const success = db.deleteProduct(id, auditUser);
  if (!success) {
    return res.status(404).json({ success: false, error: 'Product not found.' });
  }
  res.json({
    success: true,
    message: 'Product removed from inventory successfully.'
  });
});

// PATCH /api/products/:id/markdown (Admin Only - AI Smart Markdown)
router.patch('/:id/markdown', authenticateToken, requireRole('admin'), (req, res) => {
  const { id } = req.params;
  if (!isValidId(id)) {
    return res.status(400).json({ success: false, error: 'Invalid product ID format.' });
  }

  const { discountPercentage } = req.body;
  if (discountPercentage === undefined || isNaN(Number(discountPercentage))) {
    return res.status(400).json({ success: false, error: 'Valid discount percentage is required.' });
  }

  const pct = Number(discountPercentage);
  if (pct < 0 || pct > 90) {
    return res.status(400).json({ success: false, error: 'Discount percentage must be between 1% and 90% (or 0% to clear).' });
  }
  if (pct > 0 && pct < 1) {
    return res.status(400).json({ success: false, error: 'Discount percentage must be at least 1%.' });
  }

  try {
    const auditUser = {
      id: req.user.id,
      name: req.user.name,
      ip: getClientIp(req)
    };

    const updated = db.applyMarkdown(id, pct, auditUser);
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Product not found.' });
    }

    const enriched = enrichProductWithExpiry(updated, config.SIMULATED_CURRENT_DATE);
    res.json({
      success: true,
      message: pct === 0 ? `Removed markdown discount from ${updated.name}.` : `Applied ${pct}% markdown to ${updated.name}.`,
      product: enriched
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { validateCheckout } = require('../middleware/validate');
const { updateSupabaseStock } = require('../supabase');

// POST /api/checkout (Cashier & Admin - Real-time Stock Deduction)
router.post('/checkout', authenticateToken, validateCheckout, async (req, res) => {
  try {
    const { items, paymentMethod, amountTendered } = req.body;

    const result = db.recordCheckout({
      cashierId: req.user.id,
      cashierName: req.user.name,
      items,
      paymentMethod,
      amountTendered
    });

    // Real-time Supabase stock deduction for all sold items
    if (result.updatedProducts) {
      for (const item of items) {
        const prod = result.updatedProducts.find(p => p.id === item.productId);
        if (prod) {
          updateSupabaseStock(prod.id, prod.stock).catch(() => {});
        }
      }
    }

    res.status(201).json({
      success: true,
      message: 'Transaction completed successfully. Database stock updated.',
      transaction: result.transaction,
      updatedProducts: result.updatedProducts
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message || 'Transaction failed due to an inventory conflict.'
    });
  }
});

// GET /api/transactions (Admin Only)
router.get('/', authenticateToken, requireRole('admin'), (req, res) => {
  const txns = db.getTransactions();
  res.json({
    success: true,
    count: txns.length,
    transactions: txns
  });
});

module.exports = router;

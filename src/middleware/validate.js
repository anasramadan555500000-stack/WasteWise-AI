const config = require('../config');
const { calculateDaysUntilExpiry } = require('../utils/expiry');

function sanitizeString(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/[<>]/g, '') // strip direct script / tag injection
    .trim();
}

function validateLogin(req, res, next) {
  const { email, password } = req.body || {};

  if (!email || typeof email !== 'string') {
    return res.status(400).json({ success: false, error: 'Email is required and must be a string.' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return res.status(400).json({ success: false, error: 'Please enter a valid email address.' });
  }

  if (!password || typeof password !== 'string' || password.length < 4) {
    return res.status(400).json({ success: false, error: 'Password is required (min 4 characters).' });
  }

  req.body.email = email.trim().toLowerCase();
  next();
}

function validateProduct(req, res, next) {
  let { name, category, costPrice, sellingPrice, price, stock, expiryDate, expiry_date, alertDaysBefore, image, image_url } = req.body || {};

  // Harmonize Supabase column aliases
  sellingPrice = sellingPrice !== undefined ? sellingPrice : price;
  expiryDate = expiryDate || expiry_date;
  image = image || image_url;

  if (!name || typeof name !== 'string' || name.trim().length < 2 || name.trim().length > 100) {
    return res.status(400).json({ success: false, error: 'Product name is required (2-100 characters).' });
  }

  if (costPrice !== undefined && (isNaN(Number(costPrice)) || Number(costPrice) < 0)) {
    return res.status(400).json({ success: false, error: 'Cost price must be a non-negative number.' });
  }

  if (isNaN(Number(sellingPrice)) || Number(sellingPrice) <= 0) {
    return res.status(400).json({ success: false, error: 'Selling price must be a positive number greater than 0.' });
  }

  if (isNaN(parseInt(stock, 10)) || parseInt(stock, 10) < 0) {
    return res.status(400).json({ success: false, error: 'Stock must be a non-negative integer.' });
  }

  if (!expiryDate || isNaN(Date.parse(expiryDate))) {
    return res.status(400).json({ success: false, error: 'Valid expiry date (YYYY-MM-DD) is required.' });
  }

  // Reject creating product with already expired date relative to system anchor date
  const daysUntilExpiry = calculateDaysUntilExpiry(expiryDate, config.SIMULATED_CURRENT_DATE);
  if (daysUntilExpiry <= 0) {
    return res.status(400).json({
      success: false,
      error: `Cannot add product with past or expired date (${expiryDate}). Expiry date must be in the future.`
    });
  }

  if (alertDaysBefore !== undefined && (isNaN(parseInt(alertDaysBefore, 10)) || parseInt(alertDaysBefore, 10) < 1)) {
    return res.status(400).json({ success: false, error: 'Alert days threshold must be at least 1 day.' });
  }

  // Sanitize fields and attach harmonized properties
  req.body.name = sanitizeString(name);
  req.body.category = sanitizeString(category || 'General');
  req.body.sellingPrice = Number(sellingPrice);
  req.body.price = Number(sellingPrice);
  req.body.expiryDate = expiryDate;
  req.body.expiry_date = expiryDate;
  req.body.image = image || 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=600&auto=format&fit=crop&q=80';
  req.body.image_url = req.body.image;

  if (req.body.description) {
    req.body.description = sanitizeString(req.body.description);
  }

  next();
}

function validateCheckout(req, res, next) {
  const { items, paymentMethod, amountTendered } = req.body || {};

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ success: false, error: 'Cart is empty. At least one item is required for checkout.' });
  }

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (!item.productId || typeof item.productId !== 'string') {
      return res.status(400).json({ success: false, error: `Item at index ${i} has an invalid or missing productId.` });
    }
    const qty = parseInt(item.quantity, 10);
    if (isNaN(qty) || qty <= 0) {
      return res.status(400).json({ success: false, error: `Item quantity at index ${i} must be a positive integer.` });
    }
  }

  const validPaymentMethods = ['cash', 'card', 'visa', 'mobile_wallet', 'wallet', 'digital_wallet'];
  if (paymentMethod && !validPaymentMethods.includes(paymentMethod.toLowerCase())) {
    return res.status(400).json({ success: false, error: 'Invalid payment method. Allowed: Cash, Visa/Card, Mobile Wallet.' });
  }

  if (amountTendered !== undefined && (isNaN(Number(amountTendered)) || Number(amountTendered) < 0)) {
    return res.status(400).json({ success: false, error: 'Amount tendered must be a non-negative number.' });
  }

  next();
}

module.exports = {
  sanitizeString,
  validateLogin,
  validateProduct,
  validateCheckout
};

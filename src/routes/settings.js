const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { getClientIp } = require('../utils/ip');

// GET /api/settings or /api/admin/settings (Cashiers & Admins)
router.get('/', authenticateToken, (req, res) => {
  try {
    const settings = db.getSettings();
    res.json({
      success: true,
      settings
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message || 'Failed to retrieve settings.'
    });
  }
});

// PUT /api/admin/settings (Admin Only)
router.put('/', authenticateToken, requireRole('admin'), (req, res) => {
  try {
    const updates = req.body || {};

    // Validate taxRate if provided
    if (updates.taxRate !== undefined) {
      const rate = Number(updates.taxRate);
      if (isNaN(rate) || rate < 0 || rate > 0.5) {
        return res.status(400).json({
          success: false,
          error: 'Sales tax rate must be a decimal between 0 and 0.50 (0% - 50%).'
        });
      }
    }

    // Validate thresholds if provided
    if (updates.warningDaysBefore !== undefined) {
      const warn = parseInt(updates.warningDaysBefore, 10);
      if (isNaN(warn) || warn < 1 || warn > 30) {
        return res.status(400).json({
          success: false,
          error: 'Warning threshold must be between 1 and 30 days.'
        });
      }
    }

    if (updates.criticalDaysBefore !== undefined) {
      const crit = parseInt(updates.criticalDaysBefore, 10);
      if (isNaN(crit) || crit < 0 || crit > 15) {
        return res.status(400).json({
          success: false,
          error: 'Critical threshold must be between 0 and 15 days.'
        });
      }
    }

    if (updates.defaultMinStockThreshold !== undefined) {
      const minStock = parseInt(updates.defaultMinStockThreshold, 10);
      if (isNaN(minStock) || minStock < 1 || minStock > 500) {
        return res.status(400).json({
          success: false,
          error: 'Default minimum stock threshold must be between 1 and 500.'
        });
      }
    }

    const auditUser = {
      id: req.user.id,
      name: req.user.name,
      ip: getClientIp(req)
    };

    const updatedSettings = db.updateSettings(updates, auditUser);

    res.json({
      success: true,
      message: 'System settings saved successfully.',
      settings: updatedSettings
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message || 'Failed to update system settings.'
    });
  }
});

module.exports = router;

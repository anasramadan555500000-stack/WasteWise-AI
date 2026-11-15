const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticateToken, requireRole } = require('../middleware/auth');

// GET /api/admin/users (Admin Only)
router.get('/', authenticateToken, requireRole('admin'), (req, res) => {
  const users = db.getUsers();
  res.json({
    success: true,
    count: users.length,
    users
  });
});

// GET /api/admin/audit-logs (Admin Only)
router.get('/audit-logs', authenticateToken, requireRole('admin'), (req, res) => {
  const logs = db.getAuditLogs();
  res.json({
    success: true,
    count: logs.length,
    auditLogs: logs
  });
});

// GET /api/admin/export (Admin Only - Full System Backup)
router.get('/export', authenticateToken, requireRole('admin'), (req, res) => {
  const exportData = db.getExportData();

  db.addAuditLog({
    userId: req.user.id,
    userName: req.user.name,
    action: 'EXPORT_DATABASE_BACKUP',
    entityType: 'DATABASE',
    entityId: null,
    details: { totalProducts: exportData.products.length, totalTransactions: exportData.transactions.length },
    ip: req.ip || req.connection.remoteAddress || '127.0.0.1'
  });

  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', `attachment; filename="wastewise-backup-${new Date().toISOString().split('T')[0]}.json"`);
  res.json(exportData);
});

// POST /api/admin/reset (Admin Only - Reset to pre-seeded mock state)
router.post('/reset', authenticateToken, requireRole('admin'), (req, res) => {
  try {
    const auditUser = {
      id: req.user.id,
      name: req.user.name,
      ip: req.ip || req.connection.remoteAddress || '127.0.0.1'
    };

    db.resetToMockData(auditUser);
    res.json({
      success: true,
      message: 'Database reset to original enterprise mock state successfully.'
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;

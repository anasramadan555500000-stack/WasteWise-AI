const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config');
const db = require('../db');
const { validateLogin } = require('../middleware/validate');
const { authenticateToken } = require('../middleware/auth');

// POST /api/auth/login
router.post('/login', validateLogin, (req, res) => {
  const { email, password } = req.body;
  const user = db.getUserByEmail(email);

  if (!user) {
    return res.status(401).json({
      success: false,
      error: 'Invalid credentials. User with this email was not found.'
    });
  }

  const isMatch = bcrypt.compareSync(password, user.passwordHash);
  if (!isMatch) {
    return res.status(401).json({
      success: false,
      error: 'Invalid credentials. Password does not match.'
    });
  }

  const payload = {
    id: user.id,
    email: user.email,
    role: user.role,
    name: user.name
  };

  const token = jwt.sign(payload, config.JWT_SECRET, { expiresIn: config.JWT_EXPIRY });

  const { passwordHash, ...safeUser } = user;

  // Log successful login
  db.addAuditLog({
    userId: user.id,
    userName: user.name,
    action: 'USER_LOGIN',
    entityType: 'USER',
    entityId: user.id,
    details: { email: user.email, role: user.role },
    ip: req.ip || req.connection.remoteAddress || '127.0.0.1'
  });

  res.json({
    success: true,
    message: `Welcome back, ${user.name}!`,
    token,
    user: safeUser
  });
});

// GET /api/auth/me
router.get('/me', authenticateToken, (req, res) => {
  res.json({
    success: true,
    user: req.user
  });
});

// POST /api/auth/logout
router.post('/logout', authenticateToken, (req, res) => {
  if (req.token) {
    db.revokeToken(req.token);
  }

  if (req.user) {
    db.addAuditLog({
      userId: req.user.id,
      userName: req.user.name,
      action: 'USER_LOGOUT',
      entityType: 'USER',
      entityId: req.user.id,
      details: { email: req.user.email },
      ip: req.ip || req.connection.remoteAddress || '127.0.0.1'
    });
  }

  res.json({
    success: true,
    message: 'Logged out successfully. Session token has been revoked.'
  });
});

module.exports = router;

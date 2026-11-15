const jwt = require('jsonwebtoken');
const config = require('../config');
const db = require('../db');

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required. No Bearer token provided.'
    });
  }

  // Check if token has been explicitly revoked via logout
  if (db.isTokenRevoked(token)) {
    return res.status(401).json({
      success: false,
      error: 'Session token has been revoked or logged out. Please sign in again.'
    });
  }

  jwt.verify(token, config.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({
        success: false,
        error: 'Invalid or expired session token. Please re-authenticate.'
      });
    }

    // Verify user still exists in DB
    const user = db.getUserById(decoded.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'User account not found or deactivated.'
      });
    }

    req.user = user;
    req.token = token;
    next();
  });
}

function requireRole(roles) {
  const allowed = Array.isArray(roles) ? roles : [roles];
  return (req, res, next) => {
    if (!req.user || !allowed.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: `Access Denied: Requires [${allowed.join(', ')}] role. Current role: '${req.user ? req.user.role : 'none'}'.`
      });
    }
    next();
  };
}

module.exports = {
  authenticateToken,
  requireRole
};

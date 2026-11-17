/**
 * In-memory sliding window rate limiting middleware for WasteWise AI.
 * Protects auth and checkout routes from brute-force and flood attacks.
 */
const { getClientIp } = require('../utils/ip');

function createRateLimiter({ windowMs = 5 * 60 * 1000, maxRequests, max, message, skipSuccessfulRequests = false }) {
  const limit = max || maxRequests || 30;
  const ipRequests = new Map();

  // Periodically clean up expired entries every 2 minutes
  const cleanupInterval = setInterval(() => {
    const now = Date.now();
    for (const [ip, data] of ipRequests.entries()) {
      if (now - data.windowStart > windowMs) {
        ipRequests.delete(ip);
      }
    }
  }, 120000);
  if (cleanupInterval.unref) cleanupInterval.unref();

  const limiter = (req, res, next) => {
    const ip = getClientIp(req);
    const now = Date.now();

    let record = ipRequests.get(ip);
    if (!record || now - record.windowStart > windowMs) {
      record = { windowStart: now, count: 0 };
      ipRequests.set(ip, record);
    }

    if (record.count >= limit) {
      const retryAfterSeconds = Math.ceil((record.windowStart + windowMs - now) / 1000);
      res.setHeader('Retry-After', retryAfterSeconds);
      return res.status(429).json({
        success: false,
        error: message || 'Too many login attempts from this IP. Please try again in 5 minutes.'
      });
    }

    // Increment attempt counter
    record.count++;

    // Only count failed attempts when skipSuccessfulRequests is true
    if (skipSuccessfulRequests) {
      res.on('finish', () => {
        if (res.statusCode < 400 && record) {
          record.count = Math.max(0, record.count - 1);
        }
      });
    }

    next();
  };

  limiter.resetIp = (ip) => {
    ipRequests.delete(ip);
  };

  limiter.clearAll = () => {
    ipRequests.clear();
  };

  return limiter;
}

// Auth Rate Limiter: 30 attempts per 5 minutes per IP, skip successful logins
const authLimiter = createRateLimiter({
  windowMs: 5 * 60 * 1000,
  max: 30,
  maxRequests: 30,
  skipSuccessfulRequests: true,
  message: 'Too many login attempts from this IP. Please try again in 5 minutes.'
});

// Checkout Rate Limiter: max 30 requests per 1 minute per IP
const checkoutLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 30,
  maxRequests: 30,
  message: 'Checkout rate limit exceeded. Please wait before submitting more orders.'
});

// Reset / clear all in-memory counters on server boot
authLimiter.clearAll();
checkoutLimiter.clearAll();

module.exports = {
  createRateLimiter,
  authLimiter,
  checkoutLimiter,
  getClientIp
};

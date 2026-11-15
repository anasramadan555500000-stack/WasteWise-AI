/**
 * In-memory sliding window rate limiting middleware for WasteWise AI.
 * Protects auth and checkout routes from brute-force and flood attacks.
 */

function createRateLimiter({ windowMs, maxRequests, message }) {
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
    const ip = req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for'] || '127.0.0.1';
    const now = Date.now();

    let record = ipRequests.get(ip);
    if (!record || now - record.windowStart > windowMs) {
      record = { windowStart: now, count: 1 };
      ipRequests.set(ip, record);
      return next();
    }

    record.count++;
    if (record.count > maxRequests) {
      const retryAfterSeconds = Math.ceil((record.windowStart + windowMs - now) / 1000);
      res.setHeader('Retry-After', retryAfterSeconds);
      return res.status(429).json({
        success: false,
        error: message || 'Too many requests. Please try again later.'
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

// Auth: max 10 attempts per 15 minutes per IP
const authLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  maxRequests: 10,
  message: 'Too many login attempts from this IP. Please try again in 15 minutes.'
});

// Checkout: max 30 requests per 1 minute per IP
const checkoutLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  maxRequests: 30,
  message: 'Checkout rate limit exceeded. Please wait before submitting more orders.'
});

module.exports = {
  createRateLimiter,
  authLimiter,
  checkoutLimiter
};

/**
 * Safely extracts client IP address across standard Node, Express,
 * and serverless platforms (Vercel, AWS Lambda, Cloudflare).
 * Never throws TypeError on undefined req.connection or req.socket.
 */
function getClientIp(req) {
  if (!req) return '127.0.0.1';

  // 1. Check standard reverse proxy headers (e.g. Vercel, Cloudflare, AWS ALB)
  const xForwardedFor = req.headers && (req.headers['x-forwarded-for'] || req.headers['x-real-ip']);
  if (xForwardedFor) {
    const ipString = Array.isArray(xForwardedFor) ? xForwardedFor[0] : xForwardedFor;
    const clientIp = ipString.split(',')[0].trim();
    if (clientIp) return clientIp;
  }

  // 2. Fall back to Express req.ip (populated when 'trust proxy' is enabled)
  if (req.ip) {
    return req.ip;
  }

  // 3. Fall back to socket / connection with safe optional chaining
  if (req.socket && req.socket.remoteAddress) {
    return req.socket.remoteAddress;
  }
  if (req.connection && req.connection.remoteAddress) {
    return req.connection.remoteAddress;
  }

  return '127.0.0.1';
}

module.exports = { getClientIp };

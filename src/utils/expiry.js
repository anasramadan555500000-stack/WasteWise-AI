const config = require('../config');

/**
 * Normalizes any date string or Date object to UTC midnight (00:00:00.000)
 * to prevent timezone-based off-by-one errors.
 */
function normalizeUtcMidnight(dateInput) {
  if (!dateInput) return null;
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return null;
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 0, 0, 0, 0));
}

/**
 * Calculates exact integer days until expiry relative to anchor date.
 */
function calculateDaysUntilExpiry(expiryDateInput, referenceDateInput = config.SIMULATED_CURRENT_DATE) {
  const refMidnight = normalizeUtcMidnight(referenceDateInput) || normalizeUtcMidnight(new Date());
  const expMidnight = normalizeUtcMidnight(expiryDateInput);

  if (!expMidnight || !refMidnight) return 0;

  const diffMs = expMidnight.getTime() - refMidnight.getTime();
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * Classifies expiry into safe, warning, or expired (critical) states.
 */
function classifyExpiryStatus(daysUntilExpiry, alertThreshold = 2) {
  let status = 'safe';
  let statusText = `${daysUntilExpiry} days left (Safe)`;

  if (daysUntilExpiry <= 0) {
    status = 'expired';
    statusText = daysUntilExpiry === 0 ? 'Expires Today (Critical)' : `Expired ${Math.abs(daysUntilExpiry)} day${Math.abs(daysUntilExpiry) === 1 ? '' : 's'} ago`;
  } else if (daysUntilExpiry === 1) {
    // 1 day: Critical Expiry (Red danger)
    status = 'expired';
    statusText = '1 day left (Critical Expiry)';
  } else if (daysUntilExpiry <= alertThreshold) {
    // 2 days: Warning (Amber warning)
    status = 'warning';
    statusText = `Expires in ${daysUntilExpiry} day${daysUntilExpiry === 1 ? '' : 's'} (Warning)`;
  }

  return {
    status,
    statusText,
    isExpired: status === 'expired',
    isExpiringSoon: status === 'warning',
    isCriticalPulse: daysUntilExpiry <= 2 && daysUntilExpiry >= 0
  };
}

/**
 * Standard product enrichment with consistent expiry metadata.
 */
function enrichProductWithExpiry(p, refDateStr = config.SIMULATED_CURRENT_DATE) {
  const daysUntilExpiry = calculateDaysUntilExpiry(p.expiryDate || p.expiry_date, refDateStr);
  const classification = classifyExpiryStatus(daysUntilExpiry, p.alertDaysBefore || 2);

  let stockStatus = 'in_stock';
  const stock = parseInt(p.stock, 10) || 0;
  const minThreshold = parseInt(p.minStockThreshold, 10) || 15;

  if (stock === 0) {
    stockStatus = 'out_of_stock';
  } else if (stock <= minThreshold) {
    stockStatus = 'low_stock';
  }

  const sellingPrice = Number(p.price || p.sellingPrice) || 0;
  const effectivePrice = p.discountPrice !== null && p.discountPrice !== undefined ? Number(p.discountPrice) : sellingPrice;

  return {
    ...p,
    price: sellingPrice,
    sellingPrice,
    effectivePrice,
    stock,
    daysUntilExpiry,
    status: classification.status,
    statusText: classification.statusText,
    stockStatus,
    isExpiringSoon: classification.isExpiringSoon,
    isCriticalPulse: classification.isCriticalPulse
  };
}

module.exports = {
  normalizeUtcMidnight,
  calculateDaysUntilExpiry,
  classifyExpiryStatus,
  enrichProductWithExpiry
};

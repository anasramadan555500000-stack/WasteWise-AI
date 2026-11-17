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
 * Calculates total shelf life and half-life (50% remaining) metrics.
 */
function calculateHalfLife(expiryDateInput, createdAtInput, referenceDateInput = config.SIMULATED_CURRENT_DATE) {
  const refMidnight = normalizeUtcMidnight(referenceDateInput) || normalizeUtcMidnight(new Date());
  const expMidnight = normalizeUtcMidnight(expiryDateInput);

  if (!expMidnight || !refMidnight) {
    return { totalDays: 8, daysLeft: 8, halfLifeThreshold: 4, isHalfLife: false, isCriticalNearExpiry: false };
  }

  // If createdAtInput is missing, estimate standard 8-day batch shelf life
  const createdMidnight = normalizeUtcMidnight(createdAtInput) || new Date(expMidnight.getTime() - (8 * 24 * 60 * 60 * 1000));
  const totalDays = Math.max(1, Math.round((expMidnight.getTime() - createdMidnight.getTime()) / (1000 * 60 * 60 * 24)));
  const daysLeft = Math.round((expMidnight.getTime() - refMidnight.getTime()) / (1000 * 60 * 60 * 24));
  const halfLifeThreshold = Math.floor(totalDays / 2);
  const isHalfLife = daysLeft <= halfLifeThreshold && daysLeft > 2;
  const isCriticalNearExpiry = daysLeft <= 2 && daysLeft >= 0;

  return {
    totalDays,
    daysLeft,
    halfLifeThreshold,
    isHalfLife,
    isCriticalNearExpiry
  };
}

/**
 * Classifies expiry into safe, warning, or expired (critical) states, incorporating 50% half-life.
 */
function classifyExpiryStatus(daysUntilExpiry, alertThreshold = 2, halfLifeInfo = null) {
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
  } else if (halfLifeInfo && halfLifeInfo.isHalfLife) {
    // 50% Half-life threshold reached
    status = 'warning';
    statusText = `Half-Life Reached (${daysUntilExpiry}d / ${halfLifeInfo.totalDays}d shelf life)`;
  }

  return {
    status,
    statusText,
    isExpired: status === 'expired',
    isExpiringSoon: status === 'warning',
    isHalfLife: halfLifeInfo ? halfLifeInfo.isHalfLife : false,
    isCriticalNearExpiry: daysUntilExpiry <= 2 && daysUntilExpiry >= 0,
    isCriticalPulse: daysUntilExpiry <= 2 && daysUntilExpiry >= 0
  };
}

/**
 * Standard product enrichment with consistent expiry & half-life metadata.
 */
function enrichProductWithExpiry(p, refDateStr = config.SIMULATED_CURRENT_DATE) {
  const daysUntilExpiry = calculateDaysUntilExpiry(p.expiryDate || p.expiry_date, refDateStr);
  const halfLife = calculateHalfLife(p.expiryDate || p.expiry_date, p.createdAt || p.created_at, refDateStr);
  const classification = classifyExpiryStatus(daysUntilExpiry, p.alertDaysBefore || 2, halfLife);

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
    totalShelfDays: halfLife.totalDays,
    halfLifeThreshold: halfLife.halfLifeThreshold,
    isHalfLife: halfLife.isHalfLife,
    isCriticalNearExpiry: halfLife.isCriticalNearExpiry,
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
  calculateHalfLife,
  classifyExpiryStatus,
  enrichProductWithExpiry
};

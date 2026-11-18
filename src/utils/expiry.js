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
 * Evaluates product lifecycle across 4 distinct stages:
 * 1. EXPIRED (remainingMs <= 0)
 * 2. FINAL_48H_ESCALATION (0 < daysRemaining <= 2) -> 3x / day reminders
 * 3. HALF_LIFE_ALERT (progressRatio >= 0.50 and daysRemaining > 2)
 * 4. FRESH (progressRatio < 0.50 and daysRemaining > 2)
 */
function evaluateProductExpiry(productionDateInput, expiryDateInput, referenceDateInput = config.SIMULATED_CURRENT_DATE) {
  const refMidnight = normalizeUtcMidnight(referenceDateInput) || normalizeUtcMidnight(new Date());
  const expMidnight = normalizeUtcMidnight(expiryDateInput);

  if (!expMidnight || !refMidnight) {
    return {
      stage: 'FRESH',
      daysRemaining: 99,
      totalShelfDays: 8,
      progressRatio: 0,
      progressPct: 0,
      slot: 'morning',
      slotLabel: 'Morning Reminder (09:00)',
      label: 'Safe',
      statusText: 'Safe',
      badgeClass: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-semibold',
      isExpired: false,
      isEscalation: false,
      isHalfLife: false,
      isCriticalNearExpiry: false,
      isPulse: false
    };
  }

  // If production date is omitted or missing, default to 8 days prior to expiry
  const prodMidnight = normalizeUtcMidnight(productionDateInput) || new Date(expMidnight.getTime() - (8 * 24 * 60 * 60 * 1000));
  
  const totalDurationMs = Math.max(24 * 60 * 60 * 1000, expMidnight.getTime() - prodMidnight.getTime());
  const remainingMs = expMidnight.getTime() - refMidnight.getTime();
  const daysRemaining = Math.round(remainingMs / (1000 * 60 * 60 * 24));
  const totalShelfDays = Math.max(1, Math.round(totalDurationMs / (1000 * 60 * 60 * 24)));

  const elapsedMs = Math.max(0, refMidnight.getTime() - prodMidnight.getTime());
  const progressRatio = Math.min(1.0, Math.max(0.0, elapsedMs / totalDurationMs));
  const progressPct = Math.round(progressRatio * 100);

  // Time slot for 3 reminders per day (Morning 09:00, Afternoon 15:00, Evening 21:00)
  const currentHour = new Date().getHours();
  let slot = 'morning';
  let slotLabel = 'Morning Reminder (09:00)';
  if (currentHour >= 12 && currentHour < 18) {
    slot = 'afternoon';
    slotLabel = 'Afternoon Reminder (15:00)';
  } else if (currentHour >= 18) {
    slot = 'evening';
    slotLabel = 'Evening Reminder (21:00)';
  }

  // Stage 1: EXPIRED (remainingMs <= 0)
  if (daysRemaining <= 0) {
    return {
      stage: 'EXPIRED',
      daysRemaining,
      totalShelfDays,
      progressRatio: 1.0,
      progressPct: 100,
      slot,
      slotLabel,
      label: daysRemaining === 0 ? 'Expires Today!' : `Expired ${Math.abs(daysRemaining)}d ago`,
      statusText: daysRemaining === 0 ? 'Expires Today (Critical)' : `Expired ${Math.abs(daysRemaining)} day${Math.abs(daysRemaining) === 1 ? '' : 's'} ago`,
      badgeClass: 'bg-red-100 dark:bg-red-950/80 text-red-700 dark:text-red-300 border border-red-300 dark:border-red-800 font-bold',
      isExpired: true,
      isEscalation: false,
      isHalfLife: false,
      isCriticalNearExpiry: true,
      isPulse: true
    };
  }

  // Stage 2: FINAL_48H_ESCALATION (0 < daysRemaining <= 2)
  if (daysRemaining <= 2) {
    return {
      stage: 'FINAL_48H_ESCALATION',
      daysRemaining,
      totalShelfDays,
      progressRatio,
      progressPct,
      slot,
      slotLabel,
      label: daysRemaining === 1 ? `Critical: 1d Left (${slotLabel})` : `Warning: 2d Left (${slotLabel})`,
      statusText: `Final 48h Escalation (${daysRemaining}d left • 3x/day reminders)`,
      badgeClass: 'bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-300 border border-red-300 dark:border-red-700 font-extrabold pulse-warning',
      isExpired: false,
      isEscalation: true,
      isHalfLife: false,
      isCriticalNearExpiry: true,
      isPulse: true
    };
  }

  // Stage 3: HALF_LIFE_ALERT (progressRatio >= 0.50 and daysRemaining > 2)
  if (progressRatio >= 0.50) {
    return {
      stage: 'HALF_LIFE_ALERT',
      daysRemaining,
      totalShelfDays,
      progressRatio,
      progressPct,
      slot,
      slotLabel,
      label: `Half-Life (50%): ${daysRemaining}d Left`,
      statusText: `Half-Life Reached (${daysRemaining}d / ${totalShelfDays}d shelf life)`,
      badgeClass: 'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700 font-bold',
      isExpired: false,
      isEscalation: false,
      isHalfLife: true,
      isCriticalNearExpiry: false,
      isPulse: true
    };
  }

  // Stage 4: FRESH (progressRatio < 0.50 and daysRemaining > 2)
  return {
    stage: 'FRESH',
    daysRemaining,
    totalShelfDays,
    progressRatio,
    progressPct,
    slot,
    slotLabel,
    label: `${daysRemaining}d Safe`,
    statusText: `${daysRemaining} days left (Safe)`,
    badgeClass: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-semibold',
    isExpired: false,
    isEscalation: false,
    isHalfLife: false,
    isCriticalNearExpiry: false,
    isPulse: false
  };
}

/**
 * Calculates total shelf life and half-life (50% remaining) metrics.
 */
function calculateHalfLife(expiryDateInput, productionDateInput, referenceDateInput = config.SIMULATED_CURRENT_DATE) {
  const evalResult = evaluateProductExpiry(productionDateInput, expiryDateInput, referenceDateInput);
  return {
    totalDays: evalResult.totalShelfDays,
    daysLeft: evalResult.daysRemaining,
    halfLifeThreshold: Math.floor(evalResult.totalShelfDays / 2),
    isHalfLife: evalResult.isHalfLife,
    isCriticalNearExpiry: evalResult.isCriticalNearExpiry,
    stage: evalResult.stage
  };
}

/**
 * Classifies expiry into safe, warning, or expired (critical) states.
 */
function classifyExpiryStatus(daysUntilExpiry, alertThreshold = 2, evaluation = null) {
  let status = 'safe';
  let statusText = `${daysUntilExpiry} days left (Safe)`;

  if (daysUntilExpiry <= 0) {
    status = 'expired';
    statusText = daysUntilExpiry === 0 ? 'Expires Today (Critical)' : `Expired ${Math.abs(daysUntilExpiry)} day${Math.abs(daysUntilExpiry) === 1 ? '' : 's'} ago`;
  } else if (daysUntilExpiry === 1) {
    status = 'expired';
    statusText = '1 day left (Critical Expiry)';
  } else if (daysUntilExpiry <= alertThreshold) {
    status = 'warning';
    statusText = `Expires in ${daysUntilExpiry} day${daysUntilExpiry === 1 ? '' : 's'} (Warning)`;
  } else if (evaluation && evaluation.isHalfLife) {
    status = 'warning';
    statusText = `Half-Life Reached (${daysUntilExpiry}d / ${evaluation.totalShelfDays}d shelf life)`;
  }

  return {
    status,
    statusText,
    isExpired: status === 'expired',
    isExpiringSoon: status === 'warning',
    isHalfLife: evaluation ? evaluation.isHalfLife : false,
    isCriticalNearExpiry: daysUntilExpiry <= 2 && daysUntilExpiry >= 0,
    isCriticalPulse: daysUntilExpiry <= 2 && daysUntilExpiry >= 0
  };
}

/**
 * Standard product enrichment with multi-stage expiry metadata.
 */
function enrichProductWithExpiry(p, refDateStr = config.SIMULATED_CURRENT_DATE) {
  const prodDate = p.productionDate || p.production_date || p.createdAt || p.created_at;
  const expDate = p.expiryDate || p.expiry_date;
  const evaluation = evaluateProductExpiry(prodDate, expDate, refDateStr);
  const daysUntilExpiry = evaluation.daysRemaining;
  const classification = classifyExpiryStatus(daysUntilExpiry, p.alertDaysBefore || 2, evaluation);

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
    productionDate: prodDate || config.SIMULATED_CURRENT_DATE,
    production_date: prodDate || config.SIMULATED_CURRENT_DATE,
    price: sellingPrice,
    sellingPrice,
    effectivePrice,
    stock,
    daysUntilExpiry,
    totalShelfDays: evaluation.totalShelfDays,
    progressRatio: evaluation.progressRatio,
    progressPct: evaluation.progressPct,
    stage: evaluation.stage,
    slot: evaluation.slot,
    slotLabel: evaluation.slotLabel,
    halfLifeThreshold: Math.floor(evaluation.totalShelfDays / 2),
    isHalfLife: evaluation.isHalfLife,
    isEscalation: evaluation.isEscalation,
    isCriticalNearExpiry: evaluation.isCriticalNearExpiry,
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
  evaluateProductExpiry,
  classifyExpiryStatus,
  enrichProductWithExpiry
};

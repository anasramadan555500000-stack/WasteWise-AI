// Formatter and helper utilities
export const ANCHOR_DATE = '2026-11-15';

export function normalizeUtcMidnight(dateInput) {
  if (!dateInput) return null;
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return null;
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 0, 0, 0, 0));
}

export function formatCurrency(amount) {
  const num = Number(amount) || 0;
  return `${num.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })} EGP`;
}

export function formatDate(dateString) {
  if (!dateString) return 'N/A';
  const d = new Date(dateString);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

export function formatDateTime(isoString) {
  if (!isoString) return 'N/A';
  const d = new Date(isoString);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * Evaluates product lifecycle across 4 distinct stages:
 * 1. EXPIRED (remainingMs <= 0)
 * 2. FINAL_48H_ESCALATION (0 < daysRemaining <= 2) -> 3x / day reminders
 * 3. HALF_LIFE_ALERT (progressRatio >= 0.50 and daysRemaining > 2)
 * 4. FRESH (progressRatio < 0.50 and daysRemaining > 2)
 */
export function evaluateProductExpiry(productionDateInput, expiryDateInput, referenceDateInput = ANCHOR_DATE) {
  const refMidnight = normalizeUtcMidnight(referenceDateInput) || normalizeUtcMidnight(new Date());
  const expMidnight = normalizeUtcMidnight(expiryDateInput);

  if (!expMidnight || !refMidnight) {
    return {
      status: 'safe',
      stage: 'FRESH',
      days: 99,
      daysRemaining: 99,
      totalDays: 8,
      totalShelfDays: 8,
      progressRatio: 0,
      progressPct: 0,
      slot: 'morning',
      slotLabel: 'Morning Reminder (09:00)',
      isHalfLife: false,
      isEscalation: false,
      isCriticalNearExpiry: false,
      label: 'Safe',
      badgeClass: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-semibold',
      isPulse: false
    };
  }

  // If production date is missing, estimate standard 8-day batch
  const prodMidnight = normalizeUtcMidnight(productionDateInput) || new Date(expMidnight.getTime() - (8 * 24 * 60 * 60 * 1000));
  
  const totalDurationMs = Math.max(24 * 60 * 60 * 1000, expMidnight.getTime() - prodMidnight.getTime());
  const remainingMs = expMidnight.getTime() - refMidnight.getTime();
  const days = Math.round(remainingMs / (1000 * 60 * 60 * 24));
  const totalDays = Math.max(1, Math.round(totalDurationMs / (1000 * 60 * 60 * 24)));

  const elapsedMs = Math.max(0, refMidnight.getTime() - prodMidnight.getTime());
  const progressRatio = Math.min(1.0, Math.max(0.0, elapsedMs / totalDurationMs));
  const progressPct = Math.round(progressRatio * 100);

  // 3x Daily Escalation Reminder Slots (00:00-08:00, 08:00-16:00, 16:00-24:00)
  const currentHour = new Date().getHours();
  let slotNumber = 1;
  let slot = 'slot_1';
  let slotLabel = 'Morning Slot (00:00–08:00)';
  if (currentHour >= 8 && currentHour < 16) {
    slotNumber = 2;
    slot = 'slot_2';
    slotLabel = 'Afternoon Slot (08:00–16:00)';
  } else if (currentHour >= 16) {
    slotNumber = 3;
    slot = 'slot_3';
    slotLabel = 'Evening Slot (16:00–24:00)';
  }

  // Stage 1: EXPIRED (remainingMs <= 0)
  if (days <= 0) {
    return {
      status: 'expired',
      stage: 'EXPIRED',
      days,
      daysRemaining: days,
      totalDays,
      totalShelfDays: totalDays,
      progressRatio: 1.0,
      progressPct: 100,
      slotNumber,
      slot,
      slotLabel,
      isHalfLife: false,
      isEscalation: false,
      isCriticalNearExpiry: true,
      label: days === 0 ? 'Expires Today!' : `Expired ${Math.abs(days)}d ago`,
      badgeClass: 'bg-red-100 dark:bg-red-950/80 text-red-700 dark:text-red-300 border border-red-300 dark:border-red-800 font-bold',
      isPulse: true
    };
  }

  // Stage 2: FINAL_48H_ESCALATION (0 < daysRemaining <= 2)
  if (days <= 2) {
    return {
      status: days === 1 ? 'expired' : 'warning',
      stage: 'FINAL_48H_ESCALATION',
      days,
      daysRemaining: days,
      totalDays,
      totalShelfDays: totalDays,
      progressRatio,
      progressPct,
      slotNumber,
      slot,
      slotLabel,
      isHalfLife: false,
      isEscalation: true,
      isCriticalNearExpiry: true,
      label: days === 1 ? `Critical: 1d Left (${slotLabel})` : `Warning: 2d Left (${slotLabel})`,
      badgeClass: 'bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-300 border border-red-300 dark:border-red-700 font-extrabold pulse-warning',
      isPulse: true
    };
  }

  // Stage 3: HALF_LIFE_ALERT (progressRatio >= 0.50 and daysRemaining > 2)
  if (progressRatio >= 0.50) {
    return {
      status: 'warning',
      stage: 'HALF_LIFE_ALERT',
      days,
      daysRemaining: days,
      totalDays,
      totalShelfDays: totalDays,
      progressRatio,
      progressPct,
      slotNumber,
      slot,
      slotLabel,
      isHalfLife: true,
      isEscalation: false,
      isCriticalNearExpiry: false,
      label: `Half-Life (50%): ${days}d Left`,
      badgeClass: 'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700 font-bold',
      isPulse: true
    };
  }

  // Stage 4: FRESH (progressRatio < 0.50 and daysRemaining > 2)
  return {
    status: 'safe',
    stage: 'FRESH',
    days,
    daysRemaining: days,
    totalDays,
    totalShelfDays: totalDays,
    progressRatio,
    progressPct,
    slotNumber,
    slot,
    slotLabel,
    isHalfLife: false,
    isEscalation: false,
    isCriticalNearExpiry: false,
    label: `${days}d Safe`,
    badgeClass: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-semibold',
    isPulse: false
  };
}

export function calculateExpiry(expiryDateStr, alertDaysBefore = 2, productionDateStr = null) {
  return evaluateProductExpiry(productionDateStr, expiryDateStr, ANCHOR_DATE);
}

export function escapeHtml(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

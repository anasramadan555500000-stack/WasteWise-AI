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

export function calculateExpiry(expiryDateStr, alertDaysBefore = 2, createdAtStr = null) {
  const refMidnight = normalizeUtcMidnight(ANCHOR_DATE);
  const expMidnight = normalizeUtcMidnight(expiryDateStr);

  if (!expMidnight || !refMidnight) {
    return {
      status: 'safe',
      days: 99,
      totalDays: 8,
      isHalfLife: false,
      isCriticalNearExpiry: false,
      label: 'Safe',
      badgeClass: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-semibold',
      isPulse: false,
      progressPct: 100
    };
  }

  const diffMs = expMidnight.getTime() - refMidnight.getTime();
  const days = Math.round(diffMs / (1000 * 60 * 60 * 24));

  // Half-life calculation (track createdAt or estimate 8-day batch shelf life)
  const createdMidnight = normalizeUtcMidnight(createdAtStr) || new Date(expMidnight.getTime() - (8 * 24 * 60 * 60 * 1000));
  const totalDays = Math.max(1, Math.round((expMidnight.getTime() - createdMidnight.getTime()) / (1000 * 60 * 60 * 24)));
  const halfLifeThreshold = Math.floor(totalDays / 2);
  const isHalfLife = days <= halfLifeThreshold && days > 2;
  const isCriticalNearExpiry = days <= 2 && days >= 0;

  if (days < 0) {
    return {
      status: 'expired',
      days,
      totalDays,
      isHalfLife: false,
      isCriticalNearExpiry: false,
      label: `Expired ${Math.abs(days)}d ago`,
      badgeClass: 'bg-red-100 dark:bg-red-950/80 text-red-700 dark:text-red-300 border border-red-300 dark:border-red-800 font-bold',
      isPulse: false,
      progressPct: 0
    };
  }

  if (days === 0) {
    return {
      status: 'expired',
      days,
      totalDays,
      isHalfLife: false,
      isCriticalNearExpiry: true,
      label: 'Expires Today!',
      badgeClass: 'bg-red-100 dark:bg-red-950/80 text-red-700 dark:text-red-300 border border-red-300 dark:border-red-800 font-bold',
      isPulse: true,
      progressPct: 10
    };
  }

  if (days === 1) {
    return {
      status: 'expired',
      days,
      totalDays,
      isHalfLife: false,
      isCriticalNearExpiry: true,
      label: 'Critical: 1d Left',
      badgeClass: 'bg-red-100 dark:bg-red-950/80 text-red-700 dark:text-red-300 border border-red-300 dark:border-red-800 font-bold',
      isPulse: true,
      progressPct: 20
    };
  }

  if (days === 2) {
    return {
      status: 'warning',
      days,
      totalDays,
      isHalfLife: false,
      isCriticalNearExpiry: true,
      label: 'Warning: 2d Left',
      badgeClass: 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800 badge-warning-glow font-bold',
      isPulse: true,
      progressPct: 40
    };
  }

  if (isHalfLife) {
    return {
      status: 'warning',
      days,
      totalDays,
      isHalfLife: true,
      isCriticalNearExpiry: false,
      label: `Half-Life (50%): ${days}d Left`,
      badgeClass: 'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700 font-bold',
      isPulse: true,
      progressPct: Math.round((days / totalDays) * 100)
    };
  }

  return {
    status: 'safe',
    days,
    totalDays,
    isHalfLife: false,
    isCriticalNearExpiry: false,
    label: `${days}d Safe`,
    badgeClass: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-semibold',
    isPulse: false,
    progressPct: Math.min(100, Math.max(30, Math.round((days / totalDays) * 100)))
  };
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

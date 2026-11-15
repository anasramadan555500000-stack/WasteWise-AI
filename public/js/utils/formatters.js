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

export function calculateExpiry(expiryDateStr, alertDaysBefore = 2) {
  const refMidnight = normalizeUtcMidnight(ANCHOR_DATE);
  const expMidnight = normalizeUtcMidnight(expiryDateStr);

  if (!expMidnight || !refMidnight) {
    return {
      status: 'safe',
      days: 99,
      label: 'Safe',
      badgeClass: 'bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold',
      isPulse: false,
      progressPct: 100
    };
  }

  const diffMs = expMidnight.getTime() - refMidnight.getTime();
  const days = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (days < 0) {
    return {
      status: 'expired',
      days,
      label: `Expired ${Math.abs(days)}d ago`,
      badgeClass: 'bg-red-100 text-red-700 border border-red-300 font-bold',
      isPulse: false,
      progressPct: 0
    };
  }

  if (days === 0) {
    return {
      status: 'expired',
      days,
      label: 'Expires Today!',
      badgeClass: 'bg-red-100 text-red-700 border border-red-300 font-bold',
      isPulse: true,
      progressPct: 10
    };
  }

  if (days === 1) {
    return {
      status: 'expired',
      days,
      label: 'Critical: 1d Left',
      badgeClass: 'bg-red-100 text-red-700 border border-red-300 font-bold',
      isPulse: true,
      progressPct: 20
    };
  }

  if (days === 2) {
    return {
      status: 'warning',
      days,
      label: 'Warning: 2d Left',
      badgeClass: 'bg-amber-100 text-amber-800 border border-amber-300 badge-warning-glow font-bold',
      isPulse: true,
      progressPct: 40
    };
  }

  return {
    status: 'safe',
    days,
    label: `${days}d Safe`,
    badgeClass: 'bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold',
    isPulse: false,
    progressPct: Math.min(100, Math.max(30, days * 2))
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

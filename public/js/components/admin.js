// Admin Dashboard Component
import { store, computeFallbackAnalytics } from '../state.js';
import { api } from '../api.js';
import { formatCurrency, formatDate, formatDateTime, calculateExpiry } from '../utils/formatters.js';
import { animateCounter, triggerProgressBars } from '../utils/animations.js';
import { showToast } from './toast.js';
import { showConfirmModal } from './confirmModal.js';
import { t, isRTL } from '../utils/i18n.js';

const FALLBACK_IMG = 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=600&auto=format&fit=crop&q=80';

function renderInventoryRowsHtml(filteredProducts) {
  if (filteredProducts.length === 0) {
    return `
      <tr>
        <td colspan="7" class="py-12 text-center text-slate-400">
          <svg class="w-12 h-12 mx-auto mb-3 text-slate-300 dark:text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"/></svg>
          <p class="font-semibold text-slate-600 dark:text-slate-300">${t('noMatchingProducts')}</p>
          <p class="text-xs text-slate-400 mt-1">${t('tryAdjustingSearch')}</p>
        </td>
      </tr>
    `;
  }

  return filteredProducts.map(p => {
    const prodDate = p.productionDate || p.production_date;
    const expiry = calculateExpiry(p.expiryDate, p.alertDaysBefore, prodDate);
    const isPulse = expiry.isPulse;

    let stageBadgeText = expiry.status.toUpperCase();
    let stageDotColor = 'bg-emerald-500';
    if (expiry.stage === 'EXPIRED') {
      stageBadgeText = 'EXPIRED';
      stageDotColor = 'bg-red-500';
    } else if (expiry.stage === 'FINAL_48H_ESCALATION') {
      stageBadgeText = 'ESCALATION (3X/D)';
      stageDotColor = 'bg-red-500 animate-pulse';
    } else if (expiry.stage === 'HALF_LIFE_ALERT') {
      stageBadgeText = 'HALF-LIFE (50%)';
      stageDotColor = 'bg-amber-500 animate-pulse';
    } else if (expiry.stage === 'FRESH') {
      stageBadgeText = 'FRESH (SAFE)';
      stageDotColor = 'bg-emerald-500';
    }

    return `
      <tr class="hover:bg-slate-50/70 dark:hover:bg-slate-800/60 transition-colors ${isPulse ? 'pulse-warning bg-amber-50/30' : ''}" data-product-id="${p.id}">
        
        <!-- Product Info -->
        <td class="py-3.5 px-4">
          <div class="flex items-center gap-3">
            <img src="${p.image || FALLBACK_IMG}" alt="${p.name}" class="w-10 h-10 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shrink-0" onerror="this.onerror=null;this.src='${FALLBACK_IMG}'" />
            <div>
              <div class="font-bold text-slate-900 dark:text-white leading-tight">${p.name}</div>
              <div class="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                <span class="font-mono">${p.sku}</span>
                <span>•</span>
                <span>Barcode: ${p.barcode || 'N/A'}</span>
              </div>
            </div>
          </div>
        </td>

        <!-- Category -->
        <td class="py-3.5 px-4">
          <span class="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
            ${p.category}
          </span>
        </td>

        <!-- Pricing -->
        <td class="py-3.5 px-4">
          <div>
            <span class="font-bold text-slate-900 dark:text-white">${formatCurrency(p.discountPrice || p.sellingPrice)}</span>
            ${p.discountPrice ? `
              <span class="text-xs text-slate-400 line-through ms-1">${formatCurrency(p.sellingPrice)}</span>
            ` : ''}
          </div>
          <div class="text-xs text-slate-400">Cost: ${formatCurrency(p.costPrice)}</div>
        </td>

        <!-- Stock Level with Micro-interaction: Progress Bar Fill -->
        <td class="py-3.5 px-4">
          <div class="flex items-center gap-2">
            <span class="font-bold text-slate-800 dark:text-slate-200">${p.stock}</span>
            <span class="text-xs text-slate-400">${t('leftInStock')}</span>
          </div>
          <div class="w-24 bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1.5">
            <div class="h-full progress-fill ${p.stock <= p.minStockThreshold ? 'bg-red-500' : 'bg-emerald-500'}" data-target-width="${Math.min(100, (p.stock / 50) * 100)}"></div>
          </div>
        </td>

        <!-- Expiry Date & Countdown -->
        <td class="py-3.5 px-4">
          <div class="text-xs font-medium text-slate-700 dark:text-slate-300">${formatDate(p.expiryDate)}</div>
          <div class="text-[10px] text-slate-400">Batch: ${formatDate(prodDate || p.createdAt)}</div>
          <div class="text-[11px] ${expiry.status === 'expired' ? 'text-red-500 font-bold' : (expiry.status === 'warning' ? 'text-amber-600 font-bold' : 'text-slate-400')}">
            ${expiry.label}
          </div>
        </td>

        <!-- Live Status Badge -->
        <td class="py-3.5 px-4">
          <span class="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full ${expiry.badgeClass}">
            <span class="w-1.5 h-1.5 rounded-full ${stageDotColor}"></span>
            <span>${stageBadgeText}</span>
          </span>
        </td>

        <!-- Actions -->
        <td class="py-3.5 px-4 text-end">
          <div class="flex items-center justify-end gap-1.5">
            ${(expiry.stage === 'FINAL_48H_ESCALATION' || expiry.stage === 'HALF_LIFE_ALERT' || expiry.status === 'warning') ? `
              <button class="btn-quick-markdown p-1.5 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40 rounded-lg transition-colors cursor-pointer" data-id="${p.id}" title="${t('aiMarkdownEngine')}">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
              </button>
            ` : ''}
            <button class="btn-edit-product p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer" data-id="${p.id}" title="${t('edit')}">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
            </button>
            <button class="btn-delete-product p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors cursor-pointer" data-id="${p.id}" data-name="${p.name}" title="${t('delete')}">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
            </button>
          </div>
        </td>

      </tr>
    `;
  }).join('');
}

export function renderAdmin(container) {
  // Capture focus before re-render
  const activeEl = document.activeElement;
  const wasSearchFocused = activeEl && activeEl.id === 'admin-search-input';
  const selStart = wasSearchFocused ? activeEl.selectionStart : null;
  const selEnd = wasSearchFocused ? activeEl.selectionEnd : null;

  const state = store.getState();
  const { analytics, products, filteredProducts, filters, isLoading, settings } = state;

  // Persist and restore active admin tab from sessionStorage
  const savedTab = sessionStorage.getItem('wastewise_admin_tab');
  const activeTab = savedTab || state.adminTab || 'inventory';
  if (state.adminTab !== activeTab) {
    state.adminTab = activeTab;
  }

  // Render Skeleton Shimmer on fresh first load if products are not yet available
  if (isLoading && (!products || products.length === 0)) {
    container.innerHTML = `
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div class="h-14 rounded-2xl shimmer-loader"></div>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div class="h-28 rounded-2xl shimmer-loader"></div>
          <div class="h-28 rounded-2xl shimmer-loader"></div>
          <div class="h-28 rounded-2xl shimmer-loader"></div>
          <div class="h-28 rounded-2xl shimmer-loader"></div>
        </div>
        <div class="h-96 rounded-2xl shimmer-loader"></div>
      </div>
    `;
    return;
  }

  const effectiveAnalytics = analytics || computeFallbackAnalytics(products);
  const { financials, inventoryOverview, aiMarkdownSuggestions } = effectiveAnalytics;
  const expiringCount = inventoryOverview.expiringSoonCount || 0;
  const expiredCount = inventoryOverview.expiredCount || 0;
  const rtl = isRTL();

  container.innerHTML = `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      <!-- 1. Top Expiry & Critical Notification Banner -->
      ${expiringCount > 0 || expiredCount > 0 ? `
        <div class="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-red-500/10 border-2 border-amber-400/80 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div class="flex items-center gap-3.5">
            <div class="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-amber-500/30 animate-bounce">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
            </div>
            <div>
              <div class="flex items-center gap-2">
                <span class="text-sm font-bold text-slate-900 dark:text-white">
                  ⚠️ ${t('criticalAlertHeader')} ${expiringCount} ${t('productsExpiring2d')}
                </span>
                ${expiredCount > 0 ? `
                  <span class="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700 font-bold border border-red-300">
                    ${expiredCount} ${t('expired')}
                  </span>
                ` : ''}
              </div>
              <p class="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                ${t('totalAtRiskLoss')} <strong class="text-red-600 font-bold">${formatCurrency(financials.wasteLossEstimation)}</strong>. ${t('takeMarkdownAction')}
              </p>
            </div>
          </div>
          <div class="flex items-center gap-2 shrink-0">
            <button id="btn-filter-expiring" class="px-3.5 py-2 text-xs font-bold rounded-xl bg-amber-500 hover:bg-amber-600 text-white shadow-sm transition-all flex items-center gap-1.5 cursor-pointer">
              <span>${t('viewExpiringItems')}</span>
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
            </button>
            <button id="btn-jump-salvage" class="px-3.5 py-2 text-xs font-bold rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 shadow-sm transition-all cursor-pointer">
              ${t('aiMarkdownEngine')}
            </button>
          </div>
        </div>
      ` : ''}

      <!-- 2. Financial Overview Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <!-- Total Revenue -->
        <div class="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 ww-card-shadow ww-card-shadow-hover transition-colors">
          <div class="flex items-center justify-between text-slate-400 mb-2">
            <span class="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">${t('grossRevenue')}</span>
            <div class="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            </div>
          </div>
          <div class="text-2xl font-extrabold text-slate-900 dark:text-white counter-number" id="counter-revenue" data-target="${financials.totalRevenue}">
            ${formatCurrency(financials.totalRevenue)}
          </div>
          <div class="mt-2 flex items-center gap-1.5 text-xs text-emerald-600 font-semibold">
            <span>${t('liveDbSales')}</span>
          </div>
        </div>

        <!-- Net Profit -->
        <div class="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 ww-card-shadow ww-card-shadow-hover transition-colors">
          <div class="flex items-center justify-between text-slate-400 mb-2">
            <span class="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">${t('netProfit')}</span>
            <div class="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>
            </div>
          </div>
          <div class="text-2xl font-extrabold text-slate-900 dark:text-white counter-number" id="counter-profit" data-target="${financials.netProfit}">
            ${formatCurrency(financials.netProfit)}
          </div>
          <div class="mt-2 flex items-center gap-1.5 text-xs text-indigo-600 dark:text-indigo-400 font-semibold">
            <span>${financials.profitMarginPct}% ${t('profitMargin')}</span>
          </div>
        </div>

        <!-- Waste Loss Estimation -->
        <div class="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 ww-card-shadow ww-card-shadow-hover transition-colors">
          <div class="flex items-center justify-between text-slate-400 mb-2">
            <span class="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">${t('wasteLoss')}</span>
            <div class="w-8 h-8 rounded-lg bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
            </div>
          </div>
          <div class="text-2xl font-extrabold text-red-600 counter-number" id="counter-waste" data-target="${financials.wasteLossEstimation}">
            ${formatCurrency(financials.wasteLossEstimation)}
          </div>
          <div class="mt-2 flex items-center gap-1.5 text-xs text-red-500 font-semibold">
            <span>${expiredCount} ${t('expired')} • ${expiringCount} ${t('warning')}</span>
          </div>
        </div>

        <!-- Inventory Value -->
        <div class="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 ww-card-shadow ww-card-shadow-hover transition-colors">
          <div class="flex items-center justify-between text-slate-400 mb-2">
            <span class="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">${t('inventoryCost')}</span>
            <div class="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>
            </div>
          </div>
          <div class="text-2xl font-extrabold text-slate-900 dark:text-white counter-number" id="counter-inventory-val" data-target="${financials.totalInventoryValue}">
            ${formatCurrency(financials.totalInventoryValue)}
          </div>
          <div class="mt-2 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-semibold">
            <span>${inventoryOverview.totalStockUnits} ${t('totalStockUnits')}</span>
          </div>
        </div>

      </div>

      <!-- 2.5 Dedicated Monthly Financial Summary (P&L Breakdown) Card -->
      <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 ww-card-shadow p-5 space-y-4 transition-colors">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 gap-2">
          <div class="flex items-center gap-2.5">
            <div class="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-md shadow-emerald-500/20">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>
            </div>
            <div>
              <h3 class="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>${t('monthlyPnLTitle')}</span>
                <span class="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
                  ${financials.monthlyPnL?.period || 'November 2026'}
                </span>
              </h3>
              <p class="text-xs text-slate-400">${t('liveDbSales')} • Real-Time COGS & Net Margin Aggregation</p>
            </div>
          </div>
          <div class="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5 self-start sm:self-auto">
            <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Anchor Shift: Nov 15, 2026</span>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <!-- Monthly Revenue -->
          <div class="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
            <div class="text-xs font-semibold text-slate-400 mb-1">${t('monthlyGrossRevenue')}</div>
            <div class="text-xl font-extrabold text-slate-900 dark:text-white">
              ${formatCurrency(financials.monthlyGrossRevenue || financials.monthlyPnL?.monthlyGrossRevenue || 0)}
            </div>
            <div class="text-[11px] text-slate-400 mt-1">
              COGS: <span class="font-semibold text-slate-600 dark:text-slate-300">${formatCurrency(financials.monthlyCogs || financials.monthlyPnL?.monthlyCogs || 0)}</span>
            </div>
          </div>

          <!-- Monthly Net Operating Profit -->
          <div class="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
            <div class="text-xs font-semibold text-slate-400 mb-1">${t('monthlyNetProfit')}</div>
            <div class="text-xl font-extrabold text-indigo-600 dark:text-indigo-400">
              ${formatCurrency(financials.monthlyNetProfit || financials.monthlyPnL?.monthlyNetProfit || 0)}
            </div>
            <div class="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1">
              ${financials.monthlyProfitMarginPct || financials.monthlyPnL?.monthlyProfitMarginPct || 0}% ${t('monthlyProfitMargin')}
            </div>
          </div>

          <!-- Total Realized & At-Risk Losses -->
          <div class="p-4 rounded-xl bg-red-50/40 dark:bg-red-950/20 border border-red-100 dark:border-red-900/40">
            <div class="text-xs font-semibold text-red-600 dark:text-red-400 mb-1">${t('totalLosses')}</div>
            <div class="text-xl font-extrabold text-red-600 dark:text-red-400">
              ${formatCurrency(financials.totalLosses || financials.monthlyPnL?.lossesBreakdown?.totalLosses || 0)}
            </div>
            <div class="text-[11px] text-red-500 font-medium mt-1">
              ${t('monthlyLossesBreakdown')}
            </div>
          </div>
        </div>

        <!-- Granular Losses Breakdown Pills -->
        <div class="pt-2 flex flex-wrap items-center gap-2 text-xs">
          <span class="text-xs font-bold text-slate-500 dark:text-slate-400">${t('monthlyLossesBreakdown')}:</span>
          <span class="px-2.5 py-1 rounded-lg bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 font-medium">
            ${t('expiredStockLoss')}: <strong>${formatCurrency(financials.expiredWasteLoss || financials.monthlyPnL?.lossesBreakdown?.expiredStockLoss || 0)}</strong>
          </span>
          <span class="px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 font-medium">
            ${t('atRiskStockLoss')}: <strong>${formatCurrency(financials.atRiskWasteLoss || financials.monthlyPnL?.lossesBreakdown?.atRiskStockLoss || 0)}</strong>
          </span>
          <span class="px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 font-medium">
            ${t('markdownDiscountLoss')}: <strong>${formatCurrency(financials.markdownDiscountLoss || financials.monthlyPnL?.lossesBreakdown?.markdownDiscountLoss || 0)}</strong>
          </span>
        </div>
      </div>

      <!-- 3. Navigation Tabs & Tools -->
      <div class="border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <nav class="flex space-x-6 rtl:space-x-reverse text-sm font-semibold overflow-x-auto pb-1 sm:pb-0">
          <button class="tab-btn pb-3 border-b-2 transition-all whitespace-nowrap cursor-pointer ${activeTab === 'inventory' ? 'border-emerald-500 text-emerald-600 font-bold' : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'}" data-tab="inventory">
            ${t('tabInventory')}
          </button>
          <button class="tab-btn pb-3 border-b-2 transition-all whitespace-nowrap cursor-pointer ${activeTab === 'markdown' ? 'border-emerald-500 text-emerald-600 font-bold' : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'}" data-tab="markdown">
            ${t('tabMarkdown')}
          </button>
          <button class="tab-btn pb-3 border-b-2 transition-all whitespace-nowrap cursor-pointer ${activeTab === 'users' ? 'border-emerald-500 text-emerald-600 font-bold' : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'}" data-tab="users">
            ${t('tabUsers')}
          </button>
          <button class="tab-btn pb-3 border-b-2 transition-all whitespace-nowrap cursor-pointer ${activeTab === 'transactions' ? 'border-emerald-500 text-emerald-600 font-bold' : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'}" data-tab="transactions">
            ${t('tabTransactions')}
          </button>
          <button class="tab-btn pb-3 border-b-2 transition-all whitespace-nowrap cursor-pointer ${activeTab === 'auditLogs' ? 'border-emerald-500 text-emerald-600 font-bold' : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'}" data-tab="auditLogs">
            ${t('tabAuditLogs')}
          </button>
          <button class="tab-btn pb-3 border-b-2 transition-all whitespace-nowrap cursor-pointer ${activeTab === 'settings' ? 'border-emerald-500 text-emerald-600 font-bold' : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'}" data-tab="settings">
            ${t('tabSettings')}
          </button>
        </nav>

        <!-- Right Side Tools: Export Database -->
        <div class="flex items-center gap-2 pb-2 sm:pb-0">
          <button id="btn-export-backup" class="px-3 py-1.5 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm transition-all flex items-center gap-1.5 cursor-pointer" title="Export full JSON backup">
            <svg class="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
            <span>${t('exportBackup')}</span>
          </button>
        </div>
      </div>

      <!-- Tab Content 1: Inventory Management -->
      ${activeTab === 'inventory' ? `
        <div class="space-y-4">
          
          <!-- Filters & Action Bar -->
          <div class="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 ww-card-shadow flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 transition-colors">
            
            <!-- Search Input with Live Instant Search & Clear Button -->
            <div class="relative flex-1 max-w-md">
              <div class="absolute inset-y-0 ${rtl ? 'right-0 pr-3' : 'left-0 pl-3'} flex items-center pointer-events-none text-slate-400">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
              </div>
              <input type="text" id="admin-search-input" value="${filters.search || ''}"
                placeholder="${t('searchAdminPlaceholder')}"
                class="w-full ${rtl ? 'pr-9 pl-9' : 'pl-9 pr-9'} py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-medium text-slate-900 dark:text-white" />
              <button type="button" id="admin-btn-clear-search" class="absolute inset-y-0 ${rtl ? 'left-0 pl-3' : 'right-0 pr-3'} flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors ${filters.search ? '' : 'hidden'}" title="Clear search">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>

            <!-- Filters -->
            <div class="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
              <!-- Expiry Status Filter -->
              <select id="admin-status-filter" class="py-2 px-3 text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white">
                <option value="all" ${filters.status === 'all' ? 'selected' : ''}>${t('allExpiryStatuses')}</option>
                <option value="warning" ${filters.status === 'warning' ? 'selected' : ''}>${t('expiringIn2Days')}</option>
                <option value="expired" ${filters.status === 'expired' ? 'selected' : ''}>${t('expiredItems')}</option>
                <option value="safe" ${filters.status === 'safe' ? 'selected' : ''}>${t('safeItems')}</option>
              </select>

              <!-- Category Filter -->
              <select id="admin-category-filter" class="py-2 px-3 text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white">
                <option value="All" ${filters.category === 'All' ? 'selected' : ''}>${t('catAll')}</option>
                <option value="Buckets" ${filters.category === 'Buckets' ? 'selected' : ''}>${t('catBuckets')}</option>
                <option value="Meals" ${filters.category === 'Meals' ? 'selected' : ''}>${t('catMeals')}</option>
                <option value="Sides" ${filters.category === 'Sides' ? 'selected' : ''}>${t('catSides')}</option>
                <option value="Sauces" ${filters.category === 'Sauces' ? 'selected' : ''}>${t('catSauces')}</option>
                <option value="Drinks" ${filters.category === 'Drinks' ? 'selected' : ''}>${t('catDrinks')}</option>
              </select>

              <!-- Add Product Button -->
              <button id="btn-add-product" class="py-2 px-4 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-1.5 shrink-0 cursor-pointer">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
                <span>${t('addProduct')}</span>
              </button>
            </div>

          </div>

          <!-- Inventory Table Container -->
          <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 ww-card-shadow overflow-hidden transition-colors">
            <div class="overflow-x-auto">
              <table class="w-full text-start border-collapse">
                <thead>
                  <tr class="bg-slate-50/75 dark:bg-slate-800/75 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    <th class="py-3.5 px-4">${t('thProductSku')}</th>
                    <th class="py-3.5 px-4">${t('thCategory')}</th>
                    <th class="py-3.5 px-4">${t('thCostRetail')}</th>
                    <th class="py-3.5 px-4">${t('thStockLevel')}</th>
                    <th class="py-3.5 px-4">${t('thExpiryDate')}</th>
                    <th class="py-3.5 px-4">${t('thLiveStatus')}</th>
                    <th class="py-3.5 px-4 text-end">${t('thActions')}</th>
                  </tr>
                </thead>
                <tbody id="admin-inventory-tbody" class="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                  ${renderInventoryRowsHtml(filteredProducts)}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      ` : ''}

      <!-- Tab Content 2: AI Wastage & Salvage Engine -->
      ${activeTab === 'markdown' ? `
        <div class="space-y-6">
          <div class="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-2xl p-6 text-white ww-card-shadow">
            <div class="max-w-2xl">
              <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-xs font-bold mb-2">
                <span>🤖 WasteWise AI Dynamic Markdown Algorithm</span>
              </div>
              <h2 class="text-xl font-extrabold tracking-tight">Proactive Expiry Mitigation & Salvage Engine</h2>
              <p class="text-sm text-emerald-100 mt-1">
                Our model detects items approaching expiration and automatically calculates optimized promotional markdowns to stimulate sell-through before costly spoilage occurs.
              </p>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            ${aiMarkdownSuggestions.length === 0 ? `
              <div class="col-span-full py-12 text-center text-slate-400 bg-white rounded-2xl border border-slate-200">
                <svg class="w-12 h-12 mx-auto mb-2 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                <p class="font-bold text-slate-700">Zero Critical Expirations Detected</p>
                <p class="text-xs text-slate-400">All current inventory is safely beyond the 2-day alert window.</p>
              </div>
            ` : aiMarkdownSuggestions.map(item => `
              <div class="bg-white rounded-2xl border border-slate-200 p-5 ww-card-shadow ww-card-shadow-hover space-y-4">
                <div class="flex items-start justify-between gap-3">
                  <div>
                    <h3 class="font-bold text-slate-900 text-sm leading-tight">${item.productName}</h3>
                    <div class="text-xs text-amber-600 font-semibold mt-0.5">Expires in ${item.daysUntilExpiry} day${item.daysUntilExpiry === 1 ? '' : 's'} (${item.stock} in stock)</div>
                  </div>
                  <span class="px-2 py-1 rounded-lg bg-amber-100 text-amber-800 text-xs font-bold shrink-0">
                    -${item.suggestedDiscountPct}% Rec.
                  </span>
                </div>

                <div class="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5 text-xs">
                  <div class="flex justify-between text-slate-500">
                    <span>Current Retail:</span>
                    <span class="font-semibold text-slate-700">${formatCurrency(item.currentPrice)}</span>
                  </div>
                  <div class="flex justify-between text-emerald-600 font-bold">
                    <span>AI Recommended Price:</span>
                    <span>${formatCurrency(item.suggestedPrice)}</span>
                  </div>
                  <div class="flex justify-between text-slate-500 pt-1 border-t border-slate-200">
                    <span>Projected Salvage:</span>
                    <span class="font-bold text-emerald-700">${formatCurrency(item.estimatedSalvageValue)}</span>
                  </div>
                </div>

                <button class="btn-apply-markdown w-full py-2 px-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-1.5"
                  data-id="${item.productId}" data-pct="${item.suggestedDiscountPct}">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
                  <span>Apply ${item.suggestedDiscountPct}% Markdown</span>
                </button>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}

      <!-- Tab Content 3: RBAC Users & Permissions -->
      ${activeTab === 'users' ? `
        <div class="space-y-4">
          <div class="bg-white p-5 rounded-2xl border border-slate-200 ww-card-shadow">
            <h3 class="text-base font-bold text-slate-900 mb-1">Role-Based Access Control (RBAC) Matrix</h3>
            <p class="text-xs text-slate-500 mb-4">Enterprise user directory with verified credentials and strict privilege tiers. Cashiers are strictly prevented from viewing costs, gross margins, or modifying inventory.</p>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              <!-- Admin Accounts -->
              <div class="p-4 rounded-xl border border-indigo-100 bg-indigo-50/30 space-y-3">
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <span class="w-3 h-3 rounded-full bg-indigo-500"></span>
                    <span class="text-xs font-bold uppercase tracking-wider text-indigo-700">Administrator Accounts (Full Access)</span>
                  </div>
                  <span class="text-xs font-mono bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full font-bold">Admin Tier</span>
                </div>
                <div class="space-y-2">
                  ${(state.users.filter(u => u.role === 'admin').length > 0 ? state.users.filter(u => u.role === 'admin') : [
                    { id: 'usr_admin', name: 'Tariq Mansour (General Manager)', email: 'admin@wastewise.com', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80' }
                  ]).map(adminUser => `
                    <div class="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between">
                      <div class="flex items-center gap-3">
                        <img src="${adminUser.avatar || FALLBACK_IMG}" class="w-8 h-8 rounded-full object-cover" onerror="this.onerror=null;this.src='${FALLBACK_IMG}'" />
                        <div>
                          <div class="text-xs font-bold text-slate-900">${adminUser.name}</div>
                          <div class="text-[11px] text-slate-400 font-mono">${adminUser.email}</div>
                        </div>
                      </div>
                      <span class="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">Full Access</span>
                    </div>
                  `).join('')}
                </div>
              </div>

              <!-- Cashier Accounts -->
              <div class="p-4 rounded-xl border border-emerald-100 bg-emerald-50/30 space-y-3">
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <span class="w-3 h-3 rounded-full bg-emerald-500"></span>
                    <span class="text-xs font-bold uppercase tracking-wider text-emerald-700">Cashier POS Accounts (Restricted)</span>
                  </div>
                  <span class="text-xs font-mono bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">POS Terminal Tier</span>
                </div>
                <div class="space-y-2">
                  ${(state.users.filter(u => u.role === 'cashier').length > 0 ? state.users.filter(u => u.role === 'cashier') : [
                    { id: 'usr_cashier', name: 'Karim Zaki (POS Cashier)', email: 'cashier@wastewise.com', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80' }
                  ]).map(cashierUser => `
                    <div class="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between">
                      <div class="flex items-center gap-3">
                        <img src="${cashierUser.avatar || FALLBACK_IMG}" class="w-8 h-8 rounded-full object-cover" onerror="this.onerror=null;this.src='${FALLBACK_IMG}'" />
                        <div>
                          <div class="text-xs font-bold text-slate-900">${cashierUser.name}</div>
                          <div class="text-[11px] text-slate-400 font-mono">${cashierUser.email}</div>
                        </div>
                      </div>
                      <span class="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">POS Station #01</span>
                    </div>
                  `).join('')}
                </div>
              </div>

            </div>
          </div>
        </div>
      ` : ''}

      <!-- Tab Content 4: Sales Invoices -->
      ${activeTab === 'transactions' ? `
        <div class="space-y-4">
          <div class="bg-white rounded-2xl border border-slate-200 ww-card-shadow overflow-hidden">
            <div class="p-4 border-b border-slate-100">
              <h3 class="font-bold text-slate-900 text-sm">Real-Time POS Transaction History</h3>
              <p class="text-xs text-slate-500">Every cashier sale immediately decrements database stock in real-time.</p>
            </div>
            <div class="overflow-x-auto">
              <table class="w-full text-left border-collapse">
                <thead>
                  <tr class="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    <th class="py-3 px-4">Invoice #</th>
                    <th class="py-3 px-4">Cashier</th>
                    <th class="py-3 px-4">Date & Time</th>
                    <th class="py-3 px-4">Items Sold</th>
                    <th class="py-3 px-4">Subtotal / Tax</th>
                    <th class="py-3 px-4 text-right">Total Amount</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100 text-xs">
                  ${(state.transactions || []).length === 0 ? `
                    <tr><td colspan="6" class="py-8 text-center text-slate-400">No transactions recorded yet.</td></tr>
                  ` : state.transactions.map(t => `
                    <tr class="hover:bg-slate-50/50">
                      <td class="py-3 px-4 font-mono font-bold text-slate-900">${t.invoiceNumber}</td>
                      <td class="py-3 px-4 text-slate-700">${t.cashierName}</td>
                      <td class="py-3 px-4 text-slate-500">${formatDateTime(t.timestamp)}</td>
                      <td class="py-3 px-4">
                        <span class="font-semibold text-slate-800">${(t.items || []).reduce((acc, i) => acc + i.quantity, 0)} items</span>
                        <div class="text-[11px] text-slate-400 truncate max-w-xs">${(t.items || []).map(i => `${i.quantity}x ${i.name}`).join(', ')}</div>
                      </td>
                      <td class="py-3 px-4 text-slate-600">
                        ${formatCurrency(t.subtotal)} + ${formatCurrency(t.tax)} tax
                      </td>
                      <td class="py-3 px-4 text-right font-bold text-emerald-600">
                        ${formatCurrency(t.total)}
                      </td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ` : ''}

      <!-- Tab Content 5: Enterprise Audit Logs -->
      ${activeTab === 'auditLogs' ? `
        <div class="space-y-4">
          <div class="bg-white rounded-2xl border border-slate-200 ww-card-shadow overflow-hidden">
            <div class="p-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 class="font-bold text-slate-900 text-sm">Enterprise Security Audit Log</h3>
                <p class="text-xs text-slate-500">Immutable ledger of administrative mutations, auth events, and markdowns.</p>
              </div>
              <span class="text-xs font-mono bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg">Audit Active</span>
            </div>
            <div class="overflow-x-auto" id="audit-logs-table-container">
              <div class="py-8 text-center text-slate-400 text-xs">
                <svg class="animate-spin h-5 w-5 mx-auto mb-2 text-emerald-500" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                <span>Loading system audit logs...</span>
              </div>
            </div>
          </div>
        </div>
      ` : ''}

      <!-- Tab Content 6: Comprehensive System Settings (Admin Only) -->
      ${activeTab === 'settings' ? `
        <div class="space-y-6">
          
          <!-- Settings Top Bar with Save Button -->
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 ww-card-shadow transition-colors">
            <div>
              <h2 class="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <span>${t('settingsTitle')}</span>
                <span class="text-[10px] px-2 py-0.5 rounded-full font-bold bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">${t('adminOnlyBadge')}</span>
              </h2>
              <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">${t('settingsSubtitle')}</p>
            </div>
            <button id="btn-save-settings" class="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 active:scale-[0.99] text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
              <span>${t('saveSettingsBtn')}</span>
            </button>
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            <!-- Card 1: Restaurant & Receipt Branding -->
            <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 ww-card-shadow space-y-4 transition-colors">
              <div class="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-slate-800">
                <div class="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                  🏬
                </div>
                <div>
                  <h3 class="text-sm font-bold text-slate-900 dark:text-white">${t('brandingCardTitle')}</h3>
                  <p class="text-[11px] text-slate-400">${t('brandingCardSub')}</p>
                </div>
              </div>

              <div class="space-y-3">
                <div>
                  <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">${t('restaurantName')}</label>
                  <input type="text" id="setting-restaurant-name" value="${settings?.restaurantName || 'WasteWise AI • Fried Chicken Express'}"
                    class="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-slate-900 dark:text-white" />
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">${t('branchName')}</label>
                    <input type="text" id="setting-branch-name" value="${settings?.branchName || 'Main Branch - Downtown Cairo'}"
                      class="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-slate-900 dark:text-white" />
                  </div>
                  <div>
                    <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">${t('phone')}</label>
                    <input type="text" id="setting-phone" value="${settings?.phone || '+20 100 123 4567'}"
                      class="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-slate-900 dark:text-white font-mono" />
                  </div>
                </div>

                <div>
                  <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">${t('address')}</label>
                  <input type="text" id="setting-address" value="${settings?.address || '15 El-Tahrir Square, Downtown, Cairo, Egypt'}"
                    class="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-slate-900 dark:text-white" />
                </div>

                <div>
                  <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">${t('receiptFooter')}</label>
                  <textarea id="setting-receipt-footer" rows="2"
                    class="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-slate-900 dark:text-white">${settings?.receiptFooter || 'Thank you for choosing WasteWise AI! Quality fried chicken, zero food waste.'}</textarea>
                </div>

                <!-- Live Receipt Preview Box -->
                <div class="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 text-center font-mono text-[11px] text-slate-600 dark:text-slate-300 space-y-1">
                  <div class="font-bold text-slate-900 dark:text-white" id="preview-receipt-name">${settings?.restaurantName || 'WasteWise AI • Fried Chicken Express'}</div>
                  <div class="text-[10px] text-slate-500 dark:text-slate-400" id="preview-receipt-address">${settings?.address || '15 El-Tahrir Square, Downtown, Cairo'}</div>
                  <div class="text-[10px] text-slate-500 dark:text-slate-400" id="preview-receipt-phone">Tel: ${settings?.phone || '+20 100 123 4567'}</div>
                  <div class="border-t border-slate-200 dark:border-slate-700 pt-1 text-[10px] text-emerald-600 dark:text-emerald-400 italic" id="preview-receipt-footer">
                    "${settings?.receiptFooter || 'Thank you for choosing WasteWise AI!'}"
                  </div>
                </div>
              </div>
            </div>

            <!-- Card 2: Financial & Tax Rules -->
            <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 ww-card-shadow space-y-4 transition-colors">
              <div class="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-slate-800">
                <div class="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                  💵
                </div>
                <div>
                  <h3 class="text-sm font-bold text-slate-900 dark:text-white">${t('financialCardTitle')}</h3>
                  <p class="text-[11px] text-slate-400">${t('financialCardSub')}</p>
                </div>
              </div>

              <div class="space-y-4">
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">${t('currencyCode')}</label>
                    <input type="text" id="setting-currency" value="${settings?.currency || 'EGP'}"
                      class="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold uppercase text-slate-900 dark:text-white" />
                    <p class="text-[10px] text-slate-400 mt-1">Default: EGP (Egyptian Pound)</p>
                  </div>
                  <div>
                    <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">${t('salesTaxPct')}</label>
                    <div class="relative">
                      <input type="number" id="setting-tax-rate" step="0.5" min="0" max="50" value="${((settings?.taxRate !== undefined ? settings.taxRate : 0.08) * 100).toFixed(1)}"
                        class="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold text-slate-900 dark:text-white" />
                      <span class="absolute inset-y-0 ${rtl ? 'left-0 pl-3' : 'right-0 pr-3'} flex items-center text-xs text-slate-400 pointer-events-none">%</span>
                    </div>
                    <p class="text-[10px] text-slate-400 mt-1">Dynamically applies to POS cart totals.</p>
                  </div>
                </div>

                <!-- Enabled Payment Methods Toggles -->
                <div class="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
                  <label class="block text-xs font-bold text-slate-700 dark:text-slate-300">${t('enabledTenders')}</label>
                  <div class="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <label class="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer transition-colors">
                      <input type="checkbox" id="setting-pay-cash" ${settings?.enabledPaymentMethods?.cash !== false ? 'checked' : ''} class="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500" />
                      <span class="text-xs font-bold text-slate-800 dark:text-slate-200">${t('cash')}</span>
                    </label>
                    <label class="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer transition-colors">
                      <input type="checkbox" id="setting-pay-card" ${settings?.enabledPaymentMethods?.card !== false ? 'checked' : ''} class="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500" />
                      <span class="text-xs font-bold text-slate-800 dark:text-slate-200">${t('card')}</span>
                    </label>
                    <label class="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer transition-colors">
                      <input type="checkbox" id="setting-pay-wallet" ${settings?.enabledPaymentMethods?.wallet !== false ? 'checked' : ''} class="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500" />
                      <span class="text-xs font-bold text-slate-800 dark:text-slate-200">${t('wallet')}</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <!-- Card 3: Inventory & AI Expiry Thresholds -->
            <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 ww-card-shadow space-y-4 transition-colors">
              <div class="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-slate-800">
                <div class="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
                  🛡️
                </div>
                <div>
                  <h3 class="text-sm font-bold text-slate-900 dark:text-white">${t('thresholdsCardTitle')}</h3>
                  <p class="text-[11px] text-slate-400">${t('thresholdsCardSub')}</p>
                </div>
              </div>

              <div class="space-y-4">
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">${t('warningWindowDays')}</label>
                    <input type="number" id="setting-warning-days" min="1" max="14" value="${settings?.warningDaysBefore || 2}"
                      class="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold text-slate-900 dark:text-white" />
                    <p class="text-[10px] text-slate-400 mt-1">Amber alert trigger (Default: 2 days).</p>
                  </div>
                  <div>
                    <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">${t('criticalThresholdDays')}</label>
                    <input type="number" id="setting-critical-days" min="0" max="7" value="${settings?.criticalDaysBefore !== undefined ? settings.criticalDaysBefore : 1}"
                      class="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold text-slate-900 dark:text-white" />
                    <p class="text-[10px] text-slate-400 mt-1">Red alert trigger (Default: 1 day).</p>
                  </div>
                </div>

                <div>
                  <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">${t('minStockThreshold')}</label>
                  <input type="number" id="setting-min-stock" min="1" max="200" value="${settings?.defaultMinStockThreshold || 15}"
                    class="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold text-slate-900 dark:text-white" />
                  <p class="text-[10px] text-slate-400 mt-1">Triggers low-stock alerts in the top notification bell.</p>
                </div>

                <div class="pt-2 border-t border-slate-100 dark:border-slate-800">
                  <label class="flex items-center gap-3 p-3 rounded-xl border border-red-200 dark:border-red-900 bg-red-50/40 dark:bg-red-950/20 cursor-pointer">
                    <input type="checkbox" id="setting-auto-block-expired" ${settings?.autoBlockExpiredCheckout !== false ? 'checked' : ''} class="w-4 h-4 text-red-600 rounded focus:ring-red-500" />
                    <div>
                      <div class="text-xs font-bold text-red-900 dark:text-red-300">${t('autoBlockExpired')}</div>
                      <div class="text-[11px] text-red-700 dark:text-red-400">${t('autoBlockExpiredSub')}</div>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            <!-- Card 4: System Maintenance & Data Management -->
            <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 ww-card-shadow space-y-4 transition-colors">
              <div class="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-slate-800">
                <div class="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold">
                  💾
                </div>
                <div>
                  <h3 class="text-sm font-bold text-slate-900 dark:text-white">${t('maintenanceCardTitle')}</h3>
                  <p class="text-[11px] text-slate-400">${t('maintenanceCardSub')}</p>
                </div>
              </div>

              <div class="space-y-4">
                <div class="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 space-y-2">
                  <div class="flex items-center justify-between">
                    <div>
                      <h4 class="text-xs font-bold text-slate-900 dark:text-white">${t('fullDbBackup')}</h4>
                      <p class="text-[11px] text-slate-500 dark:text-slate-400">${t('fullDbBackupSub')}</p>
                    </div>
                    <button type="button" id="btn-settings-export-backup" class="px-3.5 py-2 bg-white dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600 text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-1.5 shrink-0 cursor-pointer">
                      <svg class="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
                      <span>${t('downloadJson')}</span>
                    </button>
                  </div>
                </div>

                <div class="p-4 rounded-xl border border-red-200 dark:border-red-900 bg-red-50/30 dark:bg-red-950/30 space-y-2">
                  <div class="flex items-center justify-between">
                    <div>
                      <h4 class="text-xs font-bold text-red-900 dark:text-red-300">${t('resetDemoDb')}</h4>
                      <p class="text-[11px] text-red-700 dark:text-red-400">${t('resetDemoDbSub')}</p>
                    </div>
                    <button type="button" id="btn-settings-reset-demo" class="px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-1.5 shrink-0 cursor-pointer">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
                      <span>${t('resetDemo')}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

          </div>

        </div>
      ` : ''}

    </div>
  `;

  // Trigger Micro-interaction 1: Number Counter
  const counterRevenue = container.querySelector('#counter-revenue');
  if (counterRevenue) animateCounter(counterRevenue, financials.totalRevenue, 600, '', ' EGP', true);

  const counterProfit = container.querySelector('#counter-profit');
  if (counterProfit) animateCounter(counterProfit, financials.netProfit, 600, '', ' EGP', true);

  const counterWaste = container.querySelector('#counter-waste');
  if (counterWaste) animateCounter(counterWaste, financials.wasteLossEstimation, 600, '', ' EGP', true);

  const counterInventory = container.querySelector('#counter-inventory-val');
  if (counterInventory) animateCounter(counterInventory, financials.totalInventoryValue, 600, '', ' EGP', true);

  // Trigger Micro-interaction: Progress Bar Fill
  triggerProgressBars(container);

  // Tab Switching
  const tabButtons = container.querySelectorAll('.tab-btn');
  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.getAttribute('data-tab');
      sessionStorage.setItem('wastewise_admin_tab', tab);
      store.setState({ adminTab: tab });
    });
  });

  // Top Export Backup Button
  const exportBtn = container.querySelector('#btn-export-backup');
  if (exportBtn) {
    exportBtn.addEventListener('click', async () => {
      try {
        await api.exportDatabaseBackup();
        showToast('Enterprise database backup downloaded successfully.', 'success');
      } catch (err) {
        showToast(err.message, 'danger');
      }
    });
  }

  // Load audit logs dynamically if auditLogs tab is selected
  if (activeTab === 'auditLogs') {
    const auditContainer = container.querySelector('#audit-logs-table-container');
    if (auditContainer) {
      api.getAuditLogs().then(data => {
        const logs = data.auditLogs || [];
        if (logs.length === 0) {
          auditContainer.innerHTML = '<div class="py-8 text-center text-slate-400 text-xs">No audit logs recorded yet.</div>';
        } else {
          auditContainer.innerHTML = `
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th class="py-3 px-4">Timestamp</th>
                  <th class="py-3 px-4">User</th>
                  <th class="py-3 px-4">Action</th>
                  <th class="py-3 px-4">Entity</th>
                  <th class="py-3 px-4">IP Address</th>
                  <th class="py-3 px-4">Details</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 text-xs">
                ${logs.map(log => `
                  <tr class="hover:bg-slate-50/50">
                    <td class="py-3 px-4 text-slate-500 font-mono">${formatDateTime(log.timestamp)}</td>
                    <td class="py-3 px-4 font-semibold text-slate-800">${log.userName}</td>
                    <td class="py-3 px-4">
                      <span class="px-2 py-0.5 rounded text-[10px] font-bold ${log.action.includes('DELETE') ? 'bg-red-50 text-red-700 border border-red-200' : (log.action.includes('CREATE') ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-700')}">
                        ${log.action}
                      </span>
                    </td>
                    <td class="py-3 px-4 text-slate-600 font-mono text-[11px]">${log.entityType}${log.entityId ? `: ${log.entityId}` : ''}</td>
                    <td class="py-3 px-4 text-slate-400 font-mono text-[11px]">${log.ip}</td>
                    <td class="py-3 px-4 text-slate-600 text-[11px]">${JSON.stringify(log.details)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          `;
        }
      }).catch(err => {
        auditContainer.innerHTML = `<div class="py-8 text-center text-red-500 text-xs">Failed to load audit logs: ${err.message}</div>`;
      });
    }
  }

  // Filter Expiring Banner Buttons
  const filterExpiringBtn = container.querySelector('#btn-filter-expiring');
  if (filterExpiringBtn) {
    filterExpiringBtn.addEventListener('click', () => {
      sessionStorage.setItem('wastewise_admin_tab', 'inventory');
      store.setState({
        adminTab: 'inventory',
        filters: { ...store.getState().filters, status: 'warning' }
      });
    });
  }

  const jumpSalvageBtn = container.querySelector('#btn-jump-salvage');
  if (jumpSalvageBtn) {
    jumpSalvageBtn.addEventListener('click', () => {
      sessionStorage.setItem('wastewise_admin_tab', 'markdown');
      store.setState({ adminTab: 'markdown' });
    });
  }

  // Attach Table Row Event Listeners
  function attachTableActionListeners() {
    const tbody = container.querySelector('#admin-inventory-tbody');
    if (!tbody) return;

    // Edit Product Buttons
    const editButtons = tbody.querySelectorAll('.btn-edit-product');
    editButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const product = store.getState().products.find(p => p.id === id);
        if (product) {
          window.dispatchEvent(new CustomEvent('wastewise:openProductModal', { detail: { product } }));
        }
      });
    });

    // Delete Product Buttons
    const deleteButtons = tbody.querySelectorAll('.btn-delete-product');
    deleteButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const name = btn.getAttribute('data-name');
        showConfirmModal({
          title: 'Delete Product',
          message: `Are you sure you want to permanently remove "${name}" from the inventory? This action will be logged in the audit trail.`,
          confirmText: 'Delete Item',
          confirmVariant: 'danger',
          onConfirm: async () => {
            try {
              await api.deleteProduct(id);
              showToast(`"${name}" removed from inventory.`, 'success');
              window.dispatchEvent(new CustomEvent('wastewise:refresh'));
            } catch (err) {
              showToast(err.message, 'danger');
            }
          }
        });
      });
    });

    // Quick Markdown Buttons
    const markdownButtons = tbody.querySelectorAll('.btn-quick-markdown');
    markdownButtons.forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.getAttribute('data-id');
        try {
          const res = await api.applyMarkdown(id, 30);
          showToast(res.message || 'Applied 30% markdown discount!', 'success');
          window.dispatchEvent(new CustomEvent('wastewise:refresh'));
        } catch (err) {
          showToast(err.message, 'danger');
        }
      });
    });
  }

  attachTableActionListeners();

  // Search Input, Clear Button, and Table Filtering
  const searchInput = container.querySelector('#admin-search-input');
  const clearSearchBtn = container.querySelector('#admin-btn-clear-search');
  const inventoryTbody = container.querySelector('#admin-inventory-tbody');

  function updateTableDirectly(query) {
    store.state.filters.search = query;
    store.computeFilteredProducts();
    const updatedFiltered = store.getState().filteredProducts;
    if (inventoryTbody) {
      inventoryTbody.innerHTML = renderInventoryRowsHtml(updatedFiltered);
      attachTableActionListeners();
    }
    if (clearSearchBtn) {
      clearSearchBtn.classList.toggle('hidden', !query);
    }
  }

  if (searchInput) {
    // Instant live search on every keystroke without losing input focus
    searchInput.addEventListener('input', (e) => {
      updateTableDirectly(e.target.value);
    });
  }

  if (clearSearchBtn && searchInput) {
    clearSearchBtn.addEventListener('click', () => {
      searchInput.value = '';
      updateTableDirectly('');
      searchInput.focus();
    });
  }

  // Restore search input focus if previously focused before re-render
  if (wasSearchFocused && searchInput) {
    searchInput.focus();
    if (selStart !== null && selEnd !== null) {
      try {
        searchInput.setSelectionRange(selStart, selEnd);
      } catch (e) {}
    }
  }

  // Status Filter
  const statusFilter = container.querySelector('#admin-status-filter');
  if (statusFilter) {
    statusFilter.addEventListener('change', (e) => {
      store.setState({
        filters: { ...store.getState().filters, status: e.target.value }
      });
    });
  }

  // Category Filter
  const categoryFilter = container.querySelector('#admin-category-filter');
  if (categoryFilter) {
    categoryFilter.addEventListener('change', (e) => {
      store.setState({
        filters: { ...store.getState().filters, category: e.target.value }
      });
    });
  }

  // Add Product Button
  const addProductBtn = container.querySelector('#btn-add-product');
  if (addProductBtn) {
    addProductBtn.addEventListener('click', () => {
      window.dispatchEvent(new CustomEvent('wastewise:openProductModal', { detail: { product: null } }));
    });
  }

  // Interactive Notification Product Row Highlighting
  function highlightProductRow(productId) {
    if (!productId) return;
    const targetRow = container.querySelector(`tr[data-product-id="${productId}"]`);
    if (targetRow) {
      container.querySelectorAll('.target-row-highlight').forEach(el => el.classList.remove('target-row-highlight'));
      targetRow.classList.add('target-row-highlight');
      targetRow.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setTimeout(() => {
        targetRow.classList.remove('target-row-highlight');
      }, 4000);
    }
  }

  if (store.state.highlightedProductId) {
    const pid = store.state.highlightedProductId;
    store.state.highlightedProductId = null;
    setTimeout(() => highlightProductRow(pid), 100);
  }

  const highlightHandler = (e) => {
    const pid = e.detail?.productId;
    if (pid) {
      highlightProductRow(pid);
    }
  };
  window.addEventListener('wastewise:highlightProduct', highlightHandler, { once: true });

  // AI Markdown suggestions buttons in markdown tab
  const aiMarkdownBtns = container.querySelectorAll('.btn-apply-markdown');
  aiMarkdownBtns.forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.getAttribute('data-id');
      const pct = btn.getAttribute('data-pct') || '30';
      try {
        const res = await api.applyMarkdown(id, pct);
        showToast(res.message || `Applied ${pct}% markdown discount!`, 'success');
        window.dispatchEvent(new CustomEvent('wastewise:refresh'));
      } catch (err) {
        showToast(err.message, 'danger');
      }
    });
  });

  // Settings Tab Handlers
  if (activeTab === 'settings') {
    const saveSettingsBtn = container.querySelector('#btn-save-settings');
    const restNameInput = container.querySelector('#setting-restaurant-name');
    const branchNameInput = container.querySelector('#setting-branch-name');
    const addressInput = container.querySelector('#setting-address');
    const phoneInput = container.querySelector('#setting-phone');
    const footerInput = container.querySelector('#setting-receipt-footer');
    const currencyInput = container.querySelector('#setting-currency');
    const taxRateInput = container.querySelector('#setting-tax-rate');
    const payCashCheck = container.querySelector('#setting-pay-cash');
    const payCardCheck = container.querySelector('#setting-pay-card');
    const payWalletCheck = container.querySelector('#setting-pay-wallet');
    const warnDaysInput = container.querySelector('#setting-warning-days');
    const critDaysInput = container.querySelector('#setting-critical-days');
    const minStockInput = container.querySelector('#setting-min-stock');
    const autoBlockCheck = container.querySelector('#setting-auto-block-expired');

    // Live preview update
    const previewName = container.querySelector('#preview-receipt-name');
    const previewAddress = container.querySelector('#preview-receipt-address');
    const previewPhone = container.querySelector('#preview-receipt-phone');
    const previewFooter = container.querySelector('#preview-receipt-footer');

    restNameInput?.addEventListener('input', (e) => {
      if (previewName) previewName.textContent = e.target.value || 'WasteWise AI';
    });
    addressInput?.addEventListener('input', (e) => {
      if (previewAddress) previewAddress.textContent = e.target.value || '';
    });
    phoneInput?.addEventListener('input', (e) => {
      if (previewPhone) previewPhone.textContent = `Tel: ${e.target.value || ''}`;
    });
    footerInput?.addEventListener('input', (e) => {
      if (previewFooter) previewFooter.textContent = `"${e.target.value || ''}"`;
    });

    // Save Settings Handler
    saveSettingsBtn?.addEventListener('click', async () => {
      const taxPercent = parseFloat(taxRateInput?.value) || 0;
      const taxDecimal = Number((taxPercent / 100).toFixed(4));

      if (taxPercent < 0 || taxPercent > 50) {
        showToast('Sales Tax must be between 0% and 50%.', 'warning');
        return;
      }

      const payload = {
        restaurantName: restNameInput?.value.trim() || 'WasteWise AI • Fried Chicken Express',
        branchName: branchNameInput?.value.trim() || 'Main Branch',
        address: addressInput?.value.trim() || '',
        phone: phoneInput?.value.trim() || '',
        receiptFooter: footerInput?.value.trim() || '',
        currency: (currencyInput?.value.trim() || 'EGP').toUpperCase(),
        taxRate: taxDecimal,
        enabledPaymentMethods: {
          cash: payCashCheck ? payCashCheck.checked : true,
          card: payCardCheck ? payCardCheck.checked : true,
          wallet: payWalletCheck ? payWalletCheck.checked : true
        },
        warningDaysBefore: parseInt(warnDaysInput?.value, 10) || 2,
        criticalDaysBefore: parseInt(critDaysInput?.value, 10) || 1,
        defaultMinStockThreshold: parseInt(minStockInput?.value, 10) || 15,
        autoBlockExpiredCheckout: autoBlockCheck ? autoBlockCheck.checked : true
      };

      saveSettingsBtn.disabled = true;
      saveSettingsBtn.innerHTML = `
        <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
        <span>Saving Settings...</span>
      `;

      try {
        const res = await api.updateSettings(payload);
        store.setState({ settings: res.settings });
        showToast('System settings saved and applied across POS!', 'success');
      } catch (err) {
        showToast(err.message || 'Failed to update settings.', 'danger');
      } finally {
        saveSettingsBtn.disabled = false;
        saveSettingsBtn.innerHTML = `
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
          <span>Save System Settings</span>
        `;
      }
    });

    // Settings Export Backup Button
    const settingsExportBtn = container.querySelector('#btn-settings-export-backup');
    settingsExportBtn?.addEventListener('click', async () => {
      try {
        await api.exportDatabaseBackup();
        showToast('Enterprise database backup downloaded successfully.', 'success');
      } catch (err) {
        showToast(err.message, 'danger');
      }
    });

    // Settings Reset Demo Data Button
    const resetDemoBtn = container.querySelector('#btn-settings-reset-demo');
    resetDemoBtn?.addEventListener('click', () => {
      showConfirmModal({
        title: 'Reset Demo Database',
        message: 'This will reset all products, inventory counts, and markdowns to the original Fried Chicken mock state. Do you wish to continue?',
        confirmText: 'Reset Database',
        confirmVariant: 'danger',
        onConfirm: async () => {
          try {
            await api.resetDatabase();
            showToast('Database reset to original mock demonstration catalog.', 'success');
            window.dispatchEvent(new CustomEvent('wastewise:refresh'));
          } catch (err) {
            showToast(err.message, 'danger');
          }
        }
      });
    });
  }
}

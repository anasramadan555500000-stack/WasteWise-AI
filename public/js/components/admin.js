// Admin Dashboard Component
import { store, computeFallbackAnalytics } from '../state.js';
import { api } from '../api.js';
import { formatCurrency, formatDate, formatDateTime, calculateExpiry } from '../utils/formatters.js';
import { animateCounter, triggerProgressBars } from '../utils/animations.js';
import { showToast } from './toast.js';
import { showConfirmModal } from './confirmModal.js';

const FALLBACK_IMG = 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=600&auto=format&fit=crop&q=80';

function renderInventoryRowsHtml(filteredProducts) {
  if (filteredProducts.length === 0) {
    return `
      <tr>
        <td colspan="7" class="py-12 text-center text-slate-400">
          <svg class="w-12 h-12 mx-auto mb-3 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"/></svg>
          <p class="font-semibold text-slate-600">No matching products found</p>
          <p class="text-xs text-slate-400 mt-1">Try adjusting your search query or status filter.</p>
        </td>
      </tr>
    `;
  }

  return filteredProducts.map(p => {
    const expiry = calculateExpiry(p.expiryDate, p.alertDaysBefore);
    const isPulse = expiry.isPulse;

    return `
      <tr class="hover:bg-slate-50/70 transition-colors ${isPulse ? 'pulse-warning bg-amber-50/30' : ''}">
        
        <!-- Product Info -->
        <td class="py-3.5 px-4">
          <div class="flex items-center gap-3">
            <img src="${p.image || FALLBACK_IMG}" alt="${p.name}" class="w-10 h-10 rounded-xl object-cover border border-slate-200 shrink-0" onerror="this.onerror=null;this.src='${FALLBACK_IMG}'" />
            <div>
              <div class="font-bold text-slate-900 leading-tight">${p.name}</div>
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
          <span class="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700">
            ${p.category}
          </span>
        </td>

        <!-- Pricing -->
        <td class="py-3.5 px-4">
          <div>
            <span class="font-bold text-slate-900">${formatCurrency(p.discountPrice || p.sellingPrice)}</span>
            ${p.discountPrice ? `
              <span class="text-xs text-slate-400 line-through ml-1">${formatCurrency(p.sellingPrice)}</span>
            ` : ''}
          </div>
          <div class="text-xs text-slate-400">Cost: ${formatCurrency(p.costPrice)}</div>
        </td>

        <!-- Stock Level with Micro-interaction: Progress Bar Fill -->
        <td class="py-3.5 px-4">
          <div class="flex items-center gap-2">
            <span class="font-bold text-slate-800">${p.stock}</span>
            <span class="text-xs text-slate-400">units</span>
          </div>
          <div class="w-24 bg-slate-100 h-1.5 rounded-full overflow-hidden mt-1.5">
            <div class="h-full progress-fill ${p.stock <= p.minStockThreshold ? 'bg-red-500' : 'bg-emerald-500'}" data-target-width="${Math.min(100, (p.stock / 50) * 100)}"></div>
          </div>
        </td>

        <!-- Expiry Date & Countdown -->
        <td class="py-3.5 px-4">
          <div class="text-xs font-medium text-slate-700">${formatDate(p.expiryDate)}</div>
          <div class="text-[11px] ${expiry.status === 'expired' ? 'text-red-500 font-bold' : (expiry.status === 'warning' ? 'text-amber-600 font-bold' : 'text-slate-400')}">
            ${expiry.label}
          </div>
        </td>

        <!-- Live Status Badge -->
        <td class="py-3.5 px-4">
          <span class="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full ${expiry.badgeClass}">
            <span class="w-1.5 h-1.5 rounded-full ${expiry.status === 'expired' ? 'bg-red-500' : (expiry.status === 'warning' ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500')}"></span>
            <span>${expiry.status.toUpperCase()}</span>
          </span>
        </td>

        <!-- Actions -->
        <td class="py-3.5 px-4 text-right">
          <div class="flex items-center justify-end gap-1.5">
            ${expiry.status === 'warning' ? `
              <button class="btn-quick-markdown p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors" data-id="${p.id}" title="Apply AI Markdown">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
              </button>
            ` : ''}
            <button class="btn-edit-product p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors" data-id="${p.id}" title="Edit Product">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
            </button>
            <button class="btn-delete-product p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" data-id="${p.id}" data-name="${p.name}" title="Delete Product">
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
                <span class="text-sm font-bold text-slate-900">
                  ⚠️ Critical Alert: ${expiringCount} product${expiringCount === 1 ? '' : 's'} expiring within 2 days!
                </span>
                ${expiredCount > 0 ? `
                  <span class="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700 font-bold border border-red-300">
                    ${expiredCount} Expired
                  </span>
                ` : ''}
              </div>
              <p class="text-xs text-slate-600 mt-0.5">
                Total potential inventory loss at risk: <strong class="text-red-600 font-bold">${formatCurrency(financials.wasteLossEstimation)}</strong>. Take proactive markdown action below to salvage capital.
              </p>
            </div>
          </div>
          <div class="flex items-center gap-2 shrink-0">
            <button id="btn-filter-expiring" class="px-3.5 py-2 text-xs font-bold rounded-xl bg-amber-500 hover:bg-amber-600 text-white shadow-sm transition-all flex items-center gap-1.5">
              <span>View Expiring Items</span>
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
            </button>
            <button id="btn-jump-salvage" class="px-3.5 py-2 text-xs font-bold rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-sm transition-all">
              ⚡ AI Markdown Engine
            </button>
          </div>
        </div>
      ` : ''}

      <!-- 2. Financial Overview Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <!-- Total Revenue -->
        <div class="bg-white p-5 rounded-2xl border border-slate-200 ww-card-shadow ww-card-shadow-hover">
          <div class="flex items-center justify-between text-slate-400 mb-2">
            <span class="text-xs font-bold uppercase tracking-wider text-slate-500">Gross Sales Revenue</span>
            <div class="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            </div>
          </div>
          <div class="text-2xl font-extrabold text-slate-900 counter-number" id="counter-revenue" data-target="${financials.totalRevenue}">
            ${formatCurrency(financials.totalRevenue)}
          </div>
          <div class="mt-2 flex items-center gap-1.5 text-xs text-emerald-600 font-semibold">
            <span>Authoritative from live DB sales</span>
          </div>
        </div>

        <!-- Net Profit -->
        <div class="bg-white p-5 rounded-2xl border border-slate-200 ww-card-shadow ww-card-shadow-hover">
          <div class="flex items-center justify-between text-slate-400 mb-2">
            <span class="text-xs font-bold uppercase tracking-wider text-slate-500">Net Operating Profit</span>
            <div class="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>
            </div>
          </div>
          <div class="text-2xl font-extrabold text-slate-900 counter-number" id="counter-profit" data-target="${financials.netProfit}">
            ${formatCurrency(financials.netProfit)}
          </div>
          <div class="mt-2 flex items-center gap-1.5 text-xs text-indigo-600 font-semibold">
            <span>${financials.profitMarginPct}% profit margin</span>
          </div>
        </div>

        <!-- Waste Loss Estimation -->
        <div class="bg-white p-5 rounded-2xl border border-slate-200 ww-card-shadow ww-card-shadow-hover">
          <div class="flex items-center justify-between text-slate-400 mb-2">
            <span class="text-xs font-bold uppercase tracking-wider text-slate-500">Waste Loss at Risk</span>
            <div class="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
            </div>
          </div>
          <div class="text-2xl font-extrabold text-red-600 counter-number" id="counter-waste" data-target="${financials.wasteLossEstimation}">
            ${formatCurrency(financials.wasteLossEstimation)}
          </div>
          <div class="mt-2 flex items-center gap-1.5 text-xs text-red-500 font-semibold">
            <span>${expiredCount} expired • ${expiringCount} at risk</span>
          </div>
        </div>

        <!-- Inventory Value -->
        <div class="bg-white p-5 rounded-2xl border border-slate-200 ww-card-shadow ww-card-shadow-hover">
          <div class="flex items-center justify-between text-slate-400 mb-2">
            <span class="text-xs font-bold uppercase tracking-wider text-slate-500">Total Inventory Cost</span>
            <div class="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>
            </div>
          </div>
          <div class="text-2xl font-extrabold text-slate-900 counter-number" id="counter-inventory-val" data-target="${financials.totalInventoryValue}">
            ${formatCurrency(financials.totalInventoryValue)}
          </div>
          <div class="mt-2 flex items-center gap-1.5 text-xs text-slate-500 font-semibold">
            <span>${inventoryOverview.totalStockUnits} total stock units</span>
          </div>
        </div>

      </div>

      <!-- 3. Navigation Tabs & Tools -->
      <div class="border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <nav class="flex space-x-6 text-sm font-semibold overflow-x-auto pb-1 sm:pb-0">
          <button class="tab-btn pb-3 border-b-2 transition-all whitespace-nowrap ${activeTab === 'inventory' ? 'border-emerald-500 text-emerald-600' : 'border-transparent text-slate-500 hover:text-slate-900'}" data-tab="inventory">
            📦 Inventory & Expiry Tracker
          </button>
          <button class="tab-btn pb-3 border-b-2 transition-all whitespace-nowrap ${activeTab === 'markdown' ? 'border-emerald-500 text-emerald-600' : 'border-transparent text-slate-500 hover:text-slate-900'}" data-tab="markdown">
            🤖 AI Wastage & Salvage Engine
          </button>
          <button class="tab-btn pb-3 border-b-2 transition-all whitespace-nowrap ${activeTab === 'users' ? 'border-emerald-500 text-emerald-600' : 'border-transparent text-slate-500 hover:text-slate-900'}" data-tab="users">
            🛡️ RBAC Users & Security
          </button>
          <button class="tab-btn pb-3 border-b-2 transition-all whitespace-nowrap ${activeTab === 'transactions' ? 'border-emerald-500 text-emerald-600' : 'border-transparent text-slate-500 hover:text-slate-900'}" data-tab="transactions">
            🧾 Sales Invoices
          </button>
          <button class="tab-btn pb-3 border-b-2 transition-all whitespace-nowrap ${activeTab === 'auditLogs' ? 'border-emerald-500 text-emerald-600' : 'border-transparent text-slate-500 hover:text-slate-900'}" data-tab="auditLogs">
            📜 Enterprise Audit Logs
          </button>
          <button class="tab-btn pb-3 border-b-2 transition-all whitespace-nowrap ${activeTab === 'settings' ? 'border-emerald-500 text-emerald-600' : 'border-transparent text-slate-500 hover:text-slate-900'}" data-tab="settings">
            ⚙️ System Settings
          </button>
        </nav>

        <!-- Right Side Tools: Export Database -->
        <div class="flex items-center gap-2 pb-2 sm:pb-0">
          <button id="btn-export-backup" class="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 shadow-sm transition-all flex items-center gap-1.5" title="Export full JSON backup">
            <svg class="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
            <span>Export Backup</span>
          </button>
        </div>
      </div>

      <!-- Tab Content 1: Inventory Management -->
      ${activeTab === 'inventory' ? `
        <div class="space-y-4">
          
          <!-- Filters & Action Bar -->
          <div class="bg-white p-4 rounded-2xl border border-slate-200 ww-card-shadow flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            
            <!-- Search Input with Live Instant Search & Clear Button -->
            <div class="relative flex-1 max-w-md">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
              </div>
              <input type="text" id="admin-search-input" value="${filters.search || ''}"
                placeholder="Search products by SKU, name, or barcode..."
                class="w-full pl-9 pr-9 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-medium" />
              <button type="button" id="admin-btn-clear-search" class="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors ${filters.search ? '' : 'hidden'}" title="Clear search">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>

            <!-- Filters -->
            <div class="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
              <!-- Expiry Status Filter -->
              <select id="admin-status-filter" class="py-2 px-3 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500">
                <option value="all" ${filters.status === 'all' ? 'selected' : ''}>All Expiry Statuses</option>
                <option value="warning" ${filters.status === 'warning' ? 'selected' : ''}>⚠️ Expiring in &le; 2 Days</option>
                <option value="expired" ${filters.status === 'expired' ? 'selected' : ''}>🔴 Expired Items</option>
                <option value="safe" ${filters.status === 'safe' ? 'selected' : ''}>🟢 Safe Items</option>
              </select>

              <!-- Category Filter -->
              <select id="admin-category-filter" class="py-2 px-3 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500">
                <option value="All" ${filters.category === 'All' ? 'selected' : ''}>All Categories</option>
                <option value="Buckets" ${filters.category === 'Buckets' ? 'selected' : ''}>Buckets</option>
                <option value="Meals" ${filters.category === 'Meals' ? 'selected' : ''}>Meals</option>
                <option value="Sides" ${filters.category === 'Sides' ? 'selected' : ''}>Sides</option>
                <option value="Sauces" ${filters.category === 'Sauces' ? 'selected' : ''}>Sauces</option>
                <option value="Drinks" ${filters.category === 'Drinks' ? 'selected' : ''}>Drinks</option>
              </select>

              <!-- Add Product Button -->
              <button id="btn-add-product" class="py-2 px-4 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-1.5 shrink-0">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
                <span>Add Product</span>
              </button>
            </div>

          </div>

          <!-- Inventory Table Container -->
          <div class="bg-white rounded-2xl border border-slate-200 ww-card-shadow overflow-hidden">
            <div class="overflow-x-auto">
              <table class="w-full text-left border-collapse">
                <thead>
                  <tr class="bg-slate-50/75 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    <th class="py-3.5 px-4">Product & SKU</th>
                    <th class="py-3.5 px-4">Category</th>
                    <th class="py-3.5 px-4">Cost / Retail</th>
                    <th class="py-3.5 px-4">Stock Level</th>
                    <th class="py-3.5 px-4">Expiry Date</th>
                    <th class="py-3.5 px-4">Live Status</th>
                    <th class="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody id="admin-inventory-tbody" class="divide-y divide-slate-100 text-sm">
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
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-5 rounded-2xl bg-white border border-slate-200 ww-card-shadow">
            <div>
              <h2 class="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <span>⚙️ Restaurant POS & System Configuration</span>
                <span class="text-[10px] px-2 py-0.5 rounded-full font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">Admin Only</span>
              </h2>
              <p class="text-xs text-slate-500 mt-0.5">Customize receipt branding, financial rules, AI expiry triggers, and backup data.</p>
            </div>
            <button id="btn-save-settings" class="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 active:scale-[0.99] text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 shrink-0">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
              <span>Save System Settings</span>
            </button>
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            <!-- Card 1: Restaurant & Receipt Branding -->
            <div class="bg-white rounded-2xl border border-slate-200 p-5 ww-card-shadow space-y-4">
              <div class="flex items-center gap-2.5 pb-3 border-b border-slate-100">
                <div class="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                  🏬
                </div>
                <div>
                  <h3 class="text-sm font-bold text-slate-900">Restaurant & Receipt Branding</h3>
                  <p class="text-[11px] text-slate-400">Printed dynamically on invoices, customer receipts, and navbar.</p>
                </div>
              </div>

              <div class="space-y-3">
                <div>
                  <label class="block text-xs font-bold text-slate-700 mb-1">Restaurant / Brand Name</label>
                  <input type="text" id="setting-restaurant-name" value="${settings?.restaurantName || 'WasteWise AI • Fried Chicken Express'}"
                    class="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium" />
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label class="block text-xs font-bold text-slate-700 mb-1">Branch Name</label>
                    <input type="text" id="setting-branch-name" value="${settings?.branchName || 'Main Branch - Downtown Cairo'}"
                      class="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium" />
                  </div>
                  <div>
                    <label class="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
                    <input type="text" id="setting-phone" value="${settings?.phone || '+20 100 123 4567'}"
                      class="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium" />
                  </div>
                </div>

                <div>
                  <label class="block text-xs font-bold text-slate-700 mb-1">Address</label>
                  <input type="text" id="setting-address" value="${settings?.address || '15 El-Tahrir Square, Downtown, Cairo, Egypt'}"
                    class="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium" />
                </div>

                <div>
                  <label class="block text-xs font-bold text-slate-700 mb-1">Receipt Footer Note</label>
                  <textarea id="setting-receipt-footer" rows="2"
                    class="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium">${settings?.receiptFooter || 'Thank you for choosing WasteWise AI! Quality fried chicken, zero food waste.'}</textarea>
                </div>

                <!-- Live Receipt Preview Box -->
                <div class="p-3 bg-slate-50 rounded-xl border border-dashed border-slate-300 text-center font-mono text-[11px] text-slate-600 space-y-1">
                  <div class="font-bold text-slate-900" id="preview-receipt-name">${settings?.restaurantName || 'WasteWise AI • Fried Chicken Express'}</div>
                  <div class="text-[10px] text-slate-500" id="preview-receipt-address">${settings?.address || '15 El-Tahrir Square, Downtown, Cairo'}</div>
                  <div class="text-[10px] text-slate-500" id="preview-receipt-phone">Tel: ${settings?.phone || '+20 100 123 4567'}</div>
                  <div class="border-t border-slate-200 pt-1 text-[10px] text-emerald-600 italic" id="preview-receipt-footer">
                    "${settings?.receiptFooter || 'Thank you for choosing WasteWise AI!'}"
                  </div>
                </div>
              </div>
            </div>

            <!-- Card 2: Financial & Tax Rules -->
            <div class="bg-white rounded-2xl border border-slate-200 p-5 ww-card-shadow space-y-4">
              <div class="flex items-center gap-2.5 pb-3 border-b border-slate-100">
                <div class="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                  💵
                </div>
                <div>
                  <h3 class="text-sm font-bold text-slate-900">Financial & Tax Rules</h3>
                  <p class="text-[11px] text-slate-400">Controls VAT percentage, currency display, and enabled tenders.</p>
                </div>
              </div>

              <div class="space-y-4">
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label class="block text-xs font-bold text-slate-700 mb-1">Currency Code</label>
                    <input type="text" id="setting-currency" value="${settings?.currency || 'EGP'}"
                      class="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold uppercase" />
                    <p class="text-[10px] text-slate-400 mt-1">Default: EGP (Egyptian Pound)</p>
                  </div>
                  <div>
                    <label class="block text-xs font-bold text-slate-700 mb-1">Sales Tax / VAT (%)</label>
                    <div class="relative">
                      <input type="number" id="setting-tax-rate" step="0.5" min="0" max="50" value="${((settings?.taxRate !== undefined ? settings.taxRate : 0.08) * 100).toFixed(1)}"
                        class="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold" />
                      <span class="absolute inset-y-0 right-0 pr-3 flex items-center text-xs text-slate-400 pointer-events-none">%</span>
                    </div>
                    <p class="text-[10px] text-slate-400 mt-1">Dynamically applies to POS cart totals.</p>
                  </div>
                </div>

                <!-- Enabled Payment Methods Toggles -->
                <div class="pt-2 border-t border-slate-100 space-y-2">
                  <label class="block text-xs font-bold text-slate-700">Enabled Checkout Payment Methods</label>
                  <div class="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <label class="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 cursor-pointer transition-colors">
                      <input type="checkbox" id="setting-pay-cash" ${settings?.enabledPaymentMethods?.cash !== false ? 'checked' : ''} class="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500" />
                      <span class="text-xs font-bold text-slate-800">Cash</span>
                    </label>
                    <label class="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 cursor-pointer transition-colors">
                      <input type="checkbox" id="setting-pay-card" ${settings?.enabledPaymentMethods?.card !== false ? 'checked' : ''} class="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500" />
                      <span class="text-xs font-bold text-slate-800">Visa / Card</span>
                    </label>
                    <label class="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 cursor-pointer transition-colors">
                      <input type="checkbox" id="setting-pay-wallet" ${settings?.enabledPaymentMethods?.wallet !== false ? 'checked' : ''} class="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500" />
                      <span class="text-xs font-bold text-slate-800">Wallet</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <!-- Card 3: Inventory & AI Expiry Thresholds -->
            <div class="bg-white rounded-2xl border border-slate-200 p-5 ww-card-shadow space-y-4">
              <div class="flex items-center gap-2.5 pb-3 border-b border-slate-100">
                <div class="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                  🛡️
                </div>
                <div>
                  <h3 class="text-sm font-bold text-slate-900">Inventory & AI Expiry Thresholds</h3>
                  <p class="text-[11px] text-slate-400">Configures warning badges, bell notifications, and POS checkout blocks.</p>
                </div>
              </div>

              <div class="space-y-4">
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label class="block text-xs font-bold text-slate-700 mb-1">Warning Window (Days)</label>
                    <input type="number" id="setting-warning-days" min="1" max="14" value="${settings?.warningDaysBefore || 2}"
                      class="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold" />
                    <p class="text-[10px] text-slate-400 mt-1">Amber alert trigger (Default: 2 days).</p>
                  </div>
                  <div>
                    <label class="block text-xs font-bold text-slate-700 mb-1">Critical Expiry (Days)</label>
                    <input type="number" id="setting-critical-days" min="0" max="7" value="${settings?.criticalDaysBefore !== undefined ? settings.criticalDaysBefore : 1}"
                      class="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold" />
                    <p class="text-[10px] text-slate-400 mt-1">Red alert trigger (Default: 1 day).</p>
                  </div>
                </div>

                <div>
                  <label class="block text-xs font-bold text-slate-700 mb-1">Default Low-Stock Threshold</label>
                  <input type="number" id="setting-min-stock" min="1" max="200" value="${settings?.defaultMinStockThreshold || 15}"
                    class="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold" />
                  <p class="text-[10px] text-slate-400 mt-1">Triggers low-stock alerts in the top notification bell.</p>
                </div>

                <div class="pt-2 border-t border-slate-100">
                  <label class="flex items-center gap-3 p-3 rounded-xl border border-red-200 bg-red-50/40 cursor-pointer">
                    <input type="checkbox" id="setting-auto-block-expired" ${settings?.autoBlockExpiredCheckout !== false ? 'checked' : ''} class="w-4 h-4 text-red-600 rounded focus:ring-red-500" />
                    <div>
                      <div class="text-xs font-bold text-red-900">Auto-Block Expired Items at POS Checkout</div>
                      <div class="text-[11px] text-red-700">Strictly prevents cashiers from billing any product that has already expired.</div>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            <!-- Card 4: System Maintenance & Data Management -->
            <div class="bg-white rounded-2xl border border-slate-200 p-5 ww-card-shadow space-y-4">
              <div class="flex items-center gap-2.5 pb-3 border-b border-slate-100">
                <div class="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
                  💾
                </div>
                <div>
                  <h3 class="text-sm font-bold text-slate-900">System Maintenance & Database</h3>
                  <p class="text-[11px] text-slate-400">Database backup exports and mock demonstration data management.</p>
                </div>
              </div>

              <div class="space-y-4">
                <div class="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                  <div class="flex items-center justify-between">
                    <div>
                      <h4 class="text-xs font-bold text-slate-900">Full Enterprise Database Backup</h4>
                      <p class="text-[11px] text-slate-500">Download all products, transactions, and settings in JSON format.</p>
                    </div>
                    <button type="button" id="btn-settings-export-backup" class="px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-1.5 shrink-0">
                      <svg class="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
                      <span>Download JSON</span>
                    </button>
                  </div>
                </div>

                <div class="p-4 rounded-xl border border-red-200 bg-red-50/30 space-y-2">
                  <div class="flex items-center justify-between">
                    <div>
                      <h4 class="text-xs font-bold text-red-900">Reset Demo Database</h4>
                      <p class="text-[11px] text-red-700">Restore factory demonstration catalog (Fried Chicken meals & sides).</p>
                    </div>
                    <button type="button" id="btn-settings-reset-demo" class="px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-1.5 shrink-0">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
                      <span>Reset Demo</span>
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

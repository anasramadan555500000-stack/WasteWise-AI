// Admin Dashboard Component
import { store, computeFallbackAnalytics } from '../state.js';
import { api } from '../api.js';
import { formatCurrency, formatDate, formatDateTime, calculateExpiry } from '../utils/formatters.js';
import { animateCounter, triggerProgressBars } from '../utils/animations.js';
import { showToast } from './toast.js';
import { showConfirmModal } from './confirmModal.js';

const FALLBACK_IMG = 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=600&auto=format&fit=crop&q=80';

export function renderAdmin(container) {
  const state = store.getState();
  const { analytics, products, filteredProducts, filters, isLoading } = state;

  // Persist and restore active admin tab from sessionStorage
  const savedTab = sessionStorage.getItem('wastewise_admin_tab');
  const activeTab = savedTab || state.adminTab || 'inventory';
  if (state.adminTab !== activeTab) {
    state.adminTab = activeTab;
  }

  // Render Skeleton Shimmer ONLY on fresh first load if products are not yet available
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

  // Ensure analytics is never null, with instant robust fallback computation
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

      <!-- 2. Financial Overview Cards (with Micro-interaction 1: Number Counter) -->
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
            
            <!-- Search Input -->
            <div class="relative flex-1 max-w-md">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
              </div>
              <input type="text" id="admin-search-input" value="${filters.search}"
                placeholder="Search products by SKU, name, or barcode..."
                class="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500" />
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
                <tbody class="divide-y divide-slate-100 text-sm">
                  ${filteredProducts.length === 0 ? `
                    <tr>
                      <td colspan="7" class="py-12 text-center text-slate-400">
                        <svg class="w-12 h-12 mx-auto mb-3 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"/></svg>
                        <p class="font-semibold text-slate-600">No matching products found</p>
                        <p class="text-xs text-slate-400 mt-1">Try adjusting your search query or status filter.</p>
                      </td>
                    </tr>
                  ` : filteredProducts.map(p => {
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

                        <!-- Stock Level with Micro-interaction 4: Progress Bar Fill -->
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
                  }).join('')}
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

  // Trigger Micro-interaction 4: Progress Bar Fill
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

  // Export Backup Button
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
        filters: { ...filters, status: 'warning' }
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

  // Search Input
  const searchInput = container.querySelector('#admin-search-input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      store.setState({
        filters: { ...filters, search: e.target.value }
      });
    });
  }

  // Status Filter
  const statusFilter = container.querySelector('#admin-status-filter');
  if (statusFilter) {
    statusFilter.addEventListener('change', (e) => {
      store.setState({
        filters: { ...filters, status: e.target.value }
      });
    });
  }

  // Category Filter
  const categoryFilter = container.querySelector('#admin-category-filter');
  if (categoryFilter) {
    categoryFilter.addEventListener('change', (e) => {
      store.setState({
        filters: { ...filters, category: e.target.value }
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

  // Edit Product Buttons
  const editButtons = container.querySelectorAll('.btn-edit-product');
  editButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      const product = products.find(p => p.id === id);
      if (product) {
        window.dispatchEvent(new CustomEvent('wastewise:openProductModal', { detail: { product } }));
      }
    });
  });

  // Delete Product Buttons with Custom Tailwind Confirmation Modal
  const deleteButtons = container.querySelectorAll('.btn-delete-product');
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

  // Quick Markdown / AI Apply Markdown Buttons
  const markdownButtons = container.querySelectorAll('.btn-apply-markdown, .btn-quick-markdown');
  markdownButtons.forEach(btn => {
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
}

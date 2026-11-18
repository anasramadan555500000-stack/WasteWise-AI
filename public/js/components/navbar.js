// Header and Navigation Component
// Modern Icon-Driven Enterprise POS & Inventory Header
import { store } from '../state.js';
import { api } from '../api.js';
import { showToast } from './toast.js';
import { renderProfileModal } from './profileModal.js';
import { calculateExpiry } from '../utils/formatters.js';
import { t, getLanguage, toggleLanguage, isRTL } from '../utils/i18n.js';
import { toggleTheme, isDarkMode } from '../utils/theme.js';

export function renderNavbar(container) {
  const state = store.getState();
  const { user, currentView, products, settings } = state;
  if (!user) {
    container.innerHTML = '';
    return;
  }

  const isAdmin = user.role === 'admin';
  const currentLang = getLanguage();
  const isDark = isDarkMode();
  const rtl = isRTL();

  // Compute active notifications with 50% Half-Life & Critical Near-Expiry
  let dismissedAlerts = [];
  try {
    dismissedAlerts = JSON.parse(localStorage.getItem('wastewise_dismissed_alerts')) || [];
  } catch (e) {}

  const activeAlerts = [];
  (products || []).forEach(p => {
    const prodDate = p.productionDate || p.production_date || p.createdAt || p.created_at;
    const expiry = calculateExpiry(p.expiryDate, p.alertDaysBefore, prodDate);

    // 1. Stage: EXPIRED (days <= 0)
    if (expiry.days <= 0) {
      const alertId = `exp_${p.id}_${p.expiryDate}`;
      if (!dismissedAlerts.includes(alertId)) {
        activeAlerts.push({
          id: alertId,
          productId: p.id,
          productName: p.name,
          stage: 'EXPIRED',
          type: 'expired',
          status: 'expired',
          severity: 'critical',
          title: `⛔ ${t('expired')}: ${p.name}`,
          message: `${expiry.label} • ${p.stock} ${t('leftInStock')} (Auto-blocked from POS checkout)`,
          icon: '⛔',
          badgeClass: 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 font-bold border border-rose-300'
        });
      }
    }
    // 2. Stage: FINAL_48H_ESCALATION (0 < days <= 2) -> 3x / day recurring reminders
    else if (expiry.stage === 'FINAL_48H_ESCALATION' || (expiry.days <= 2 && expiry.days > 0)) {
      // Slot-based reminder: morning, afternoon, evening
      const alertId = `esc_${p.id}_${p.expiryDate}_${expiry.slot || 'slot'}`;
      if (!dismissedAlerts.includes(alertId)) {
        activeAlerts.push({
          id: alertId,
          productId: p.id,
          productName: p.name,
          stage: 'FINAL_48H_ESCALATION',
          type: 'escalation_48h',
          status: 'critical',
          severity: 'critical',
          title: `🔥 ${t('final48hEscalation')}: ${p.name}`,
          message: `${expiry.slotLabel || 'Recurring Reminder'} • ${expiry.days}d remaining until expiration (${p.stock} units at risk)`,
          icon: '🔥',
          badgeClass: 'bg-red-100 dark:bg-red-950/80 text-red-700 dark:text-red-300 font-extrabold border border-red-300 dark:border-red-800 animate-pulse'
        });
      }
    }
    // 3. Stage: HALF_LIFE_ALERT (progressRatio >= 0.50 and days > 2)
    else if (expiry.stage === 'HALF_LIFE_ALERT' || expiry.isHalfLife) {
      const alertId = `halflife_${p.id}_${p.expiryDate}`;
      if (!dismissedAlerts.includes(alertId)) {
        activeAlerts.push({
          id: alertId,
          productId: p.id,
          productName: p.name,
          stage: 'HALF_LIFE_ALERT',
          type: 'half_life',
          status: 'warning',
          severity: 'warning',
          title: `⚡ ${t('halfLifeReached')}: ${p.name}`,
          message: `50% Shelf life reached (${expiry.days}d left of ${expiry.totalDays}d batch • ${expiry.progressPct}% elapsed) • ${p.stock} units`,
          icon: '⚡',
          badgeClass: 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 font-bold border border-amber-300 dark:border-amber-800'
        });
      }
    }

    // 4. Low-Stock Alert
    const minThreshold = p.minStockThreshold !== undefined ? p.minStockThreshold : (settings?.defaultMinStockThreshold || 15);
    if (p.stock <= minThreshold) {
      const alertId = `stock_${p.id}_${p.stock}`;
      if (!dismissedAlerts.includes(alertId)) {
        activeAlerts.push({
          id: alertId,
          productId: p.id,
          productName: p.name,
          stage: 'LOW_STOCK',
          type: 'stock',
          status: 'low_stock',
          severity: p.stock <= 5 ? 'critical' : 'warning',
          title: `📦 ${t('warning')}: ${p.name}`,
          message: `${p.stock} ${t('leftInStock')} (Min: ${minThreshold})`,
          icon: '📦',
          badgeClass: p.stock <= 5 ? 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 font-bold border border-red-300' : 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-bold border border-amber-300'
        });
      }
    }
  });

  const stationLabel = user.stationTitle ? user.stationTitle.split('•')[0].trim() : t('stationPrefix');

  container.innerHTML = `
    <header class="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30 ww-card-shadow transition-colors duration-200">
      <div class="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-20 gap-2 sm:gap-4">
          
          <!-- 1. Left Section: Prominent, Unconstrained Brand Logo & Identity -->
          <div class="flex items-center gap-3 sm:gap-4 shrink-0">
            <img src="/logo.png" 
              class="w-14 h-14 object-contain drop-shadow-[0_0_12px_rgba(16,185,129,0.35)] hover:scale-105 transition-transform duration-300 shrink-0 cursor-pointer" 
              alt="WasteWise AI" 
              onerror="this.onerror=null;this.src='/images/logo.png'" />

            <div class="flex flex-col">
              <div class="flex items-center gap-2">
                <span class="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white whitespace-nowrap">
                  ${t('brandTitle')} <span class="text-emerald-500">${t('brandAi')}</span>
                </span>
                <span class="text-[11px] font-extrabold px-2.5 py-0.5 rounded-full whitespace-nowrap hidden sm:inline-flex items-center shadow-sm ${isAdmin ? 'bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800' : 'bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'}">
                  ${isAdmin ? t('adminPanel') : t('posTerminal')}
                </span>
              </div>
              <span class="text-[11px] font-medium text-slate-400 hidden lg:block">
                ${t('authFooterSub')}
              </span>
            </div>
          </div>

          <!-- 2. Center/Right Quick Action Bar: Sleek Icon Buttons (w-10 h-10) -->
          <div class="flex items-center gap-1.5 sm:gap-2 shrink-0">
            
            <!-- A. Admin View / POS Mode Switcher (For Admins) -->
            ${isAdmin ? `
              <div class="bg-slate-100 dark:bg-slate-800 p-1 rounded-xl flex items-center gap-1 border border-slate-200 dark:border-slate-700 shadow-inner me-1">
                <button id="nav-btn-admin-view" class="w-9 h-9 sm:w-auto sm:px-3 sm:py-1.5 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${currentView === 'admin' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}" title="${t('controlCenter')}">
                  <span class="text-sm">📊</span>
                  <span class="hidden md:inline">${t('controlCenter')}</span>
                </button>
                <button id="nav-btn-pos-view" class="w-9 h-9 sm:w-auto sm:px-3 sm:py-1.5 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${currentView === 'cashier' ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}" title="${t('posView')}">
                  <span class="text-sm">🛒</span>
                  <span class="hidden md:inline">${t('posView')}</span>
                </button>
              </div>
            ` : ''}

            <!-- B. Live Sync / Cloud Status Icon Button -->
            <button id="nav-btn-cloud-status" class="w-10 h-10 rounded-xl border border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition-all flex items-center justify-center shadow-sm cursor-pointer relative group" title="Supabase Cloud Live • ${stationLabel}">
              <svg class="w-5 h-5 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 00-9.78 2.096A4.001 4.001 0 003 15z" />
              </svg>
              <span class="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              <span class="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-500"></span>
            </button>

            <!-- C. Quick Action Icon: Quick Add Product (Admin) OR Quick Drawer / POS Calc (Cashier) -->
            ${isAdmin ? `
              <button id="nav-btn-quick-add" class="w-10 h-10 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-emerald-500 hover:text-white text-slate-700 dark:text-slate-200 hover:border-emerald-500 transition-all flex items-center justify-center shadow-sm cursor-pointer group" title="Quick Add Inventory Product">
                <svg class="w-5 h-5 group-hover:rotate-90 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
              </button>
            ` : `
              <button id="nav-btn-cash-drawer" class="w-10 h-10 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-emerald-500 hover:text-white text-slate-700 dark:text-slate-200 hover:border-emerald-500 transition-all flex items-center justify-center shadow-sm cursor-pointer" title="Open Cash Drawer / Quick POS Action">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </button>
            `}

            <!-- D. Full-Screen Mode Toggle Icon -->
            <button id="nav-btn-fullscreen" class="w-10 h-10 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-all flex items-center justify-center shadow-sm cursor-pointer" title="Toggle Fullscreen Mode">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              </svg>
            </button>

            <!-- E. Language Switcher Icon Button (AR / EN) -->
            <button id="nav-btn-lang" class="w-10 h-10 sm:w-auto sm:px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer font-bold text-xs" title="Switch Language / تغيير اللغة">
              <svg class="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span class="hidden sm:inline font-black tracking-wider">${currentLang === 'en' ? 'AR' : 'EN'}</span>
            </button>

            <!-- F. Dark / Light Theme Toggle Icon Button -->
            <button id="nav-btn-theme" class="w-10 h-10 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-all flex items-center justify-center shadow-sm cursor-pointer" title="${isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}">
              ${isDark ? `
                <svg class="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/>
                </svg>
              ` : `
                <svg class="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/>
                </svg>
              `}
            </button>

            <!-- G. Interactive Notification Bell Icon -->
            <div class="relative" id="nav-notifications-wrapper">
              <button id="nav-btn-notifications" class="relative w-10 h-10 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-all flex items-center justify-center shadow-sm cursor-pointer" title="${t('notifications')}">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
                </svg>
                ${activeAlerts.length > 0 ? `
                  <span class="absolute -top-1 -right-1 flex h-4.5 w-4.5">
                    <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span class="relative inline-flex items-center justify-center rounded-full h-4.5 w-4.5 bg-red-500 text-[10px] font-black text-white shadow-sm">
                      ${activeAlerts.length}
                    </span>
                  </span>
                ` : ''}
              </button>

              <!-- Notifications Dropdown (RTL-aware) -->
              <div id="nav-notifications-dropdown" class="hidden absolute ${rtl ? 'left-0' : 'right-0'} mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 ww-card-shadow z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                <div class="p-3.5 bg-slate-50 dark:bg-slate-800 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <span class="text-xs font-extrabold text-slate-900 dark:text-white">${t('systemAlerts')}</span>
                    <span class="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                      ${activeAlerts.length} ${t('active')}
                    </span>
                  </div>
                  ${activeAlerts.length > 0 ? `
                    <button id="nav-btn-dismiss-all" class="text-[11px] font-bold text-slate-500 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400 transition-colors cursor-pointer">
                      ${t('markAllRead')}
                    </button>
                  ` : ''}
                </div>

                <div class="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                  ${activeAlerts.length === 0 ? `
                    <div class="py-8 text-center text-slate-400">
                      <svg class="w-8 h-8 mx-auto mb-1 text-slate-300 dark:text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                      <p class="text-xs font-semibold text-slate-600 dark:text-slate-300">${t('allCaughtUp')}</p>
                      <p class="text-[10px] text-slate-400">${t('noAlerts')}</p>
                    </div>
                  ` : activeAlerts.map(alert => `
                    <div class="p-3 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors flex items-start justify-between gap-2.5 cursor-pointer notification-item" data-product-id="${alert.productId}" data-alert-id="${alert.id}">
                      <div class="flex items-start gap-2.5 min-w-0 flex-1">
                        <span class="text-base shrink-0 mt-0.5">${alert.icon}</span>
                        <div class="min-w-0">
                          <div class="text-xs font-bold text-slate-900 dark:text-white truncate">${alert.title}</div>
                          <div class="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">${alert.message}</div>
                          <div class="flex items-center gap-2 mt-1">
                            <span class="text-[9px] font-extrabold px-1.5 py-0.5 rounded ${alert.badgeClass}">
                              ${alert.type.toUpperCase().replace('_', ' ')}
                            </span>
                            <span class="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold hover:underline">
                              ${t('viewInInventory')} &rarr;
                            </span>
                          </div>
                        </div>
                      </div>
                      <button class="notification-dismiss-btn p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors shrink-0 cursor-pointer" data-alert-id="${alert.id}" title="Dismiss">
                        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                      </button>
                    </div>
                  `).join('')}
                </div>
              </div>
            </div>

            <!-- H. Clean User Profile Trigger (Untruncated Name + Ring Avatar) -->
            <button id="nav-btn-profile" class="flex items-center gap-2.5 p-1 sm:px-3 sm:py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all cursor-pointer shadow-sm group ms-1" title="${t('profile')}">
              <img src="${user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80'}" 
                alt="${user.name}" 
                class="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover ring-2 ring-emerald-500/40 shrink-0 group-hover:scale-105 transition-transform" 
                onerror="this.onerror=null;this.src='https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80'" />
              
              <div class="hidden xl:flex flex-col text-start">
                <span class="text-xs font-bold text-slate-900 dark:text-white whitespace-nowrap leading-tight">${user.name}</span>
                <span class="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold capitalize leading-none">${user.role === 'admin' ? t('adminPanel') : t('posTerminal')}</span>
              </div>
            </button>

            <!-- I. Prominent Direct Logout Button (Red-Tinted Pill) -->
            <button id="nav-btn-logout" class="px-3 py-2 rounded-xl bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/20 font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm cursor-pointer shrink-0 ms-1" title="${t('signOut')}">
              <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
              </svg>
              <span class="hidden sm:inline font-bold">${currentLang === 'ar' ? 'خروج' : 'Logout'}</span>
            </button>

          </div>

        </div>
      </div>
    </header>
  `;

  // Attach Event Handlers
  const adminViewBtn = container.querySelector('#nav-btn-admin-view');
  const posViewBtn = container.querySelector('#nav-btn-pos-view');

  if (adminViewBtn) {
    adminViewBtn.addEventListener('click', () => {
      store.setState({ currentView: 'admin', adminTab: 'inventory' });
    });
  }

  if (posViewBtn) {
    posViewBtn.addEventListener('click', () => {
      store.setState({ currentView: 'cashier' });
    });
  }

  // Cloud Status Icon Handler
  const cloudBtn = container.querySelector('#nav-btn-cloud-status');
  if (cloudBtn) {
    cloudBtn.addEventListener('click', () => {
      showToast(currentLang === 'ar' ? 'سوبابيس السحابية متصلة بالكامل • المحطة #01 نشطة' : '⚡ Supabase Cloud Live • Connected to Station #01', 'success');
    });
  }

  // Quick Action Icon Handlers
  const quickAddBtn = container.querySelector('#nav-btn-quick-add');
  if (quickAddBtn) {
    quickAddBtn.addEventListener('click', () => {
      window.dispatchEvent(new CustomEvent('wastewise:openProductModal', { detail: { product: null } }));
    });
  }

  const cashDrawerBtn = container.querySelector('#nav-btn-cash-drawer');
  if (cashDrawerBtn) {
    cashDrawerBtn.addEventListener('click', () => {
      showToast(currentLang === 'ar' ? '💵 تم فتح درج النقدية للمحطة #01' : '💵 Cash Drawer Opened (POS Station #01)', 'info');
    });
  }

  // Fullscreen Mode Toggle Handler
  const fullscreenBtn = container.querySelector('#nav-btn-fullscreen');
  if (fullscreenBtn) {
    fullscreenBtn.addEventListener('click', () => {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
        showToast(currentLang === 'ar' ? 'وضع ملء الشاشة نشط' : 'Fullscreen POS Mode Enabled', 'info');
      } else {
        document.exitFullscreen().catch(() => {});
      }
    });
  }

  // Language Switcher Handler
  const langBtn = container.querySelector('#nav-btn-lang');
  if (langBtn) {
    langBtn.addEventListener('click', () => {
      toggleLanguage();
    });
  }

  // Theme Switcher Handler
  const themeBtn = container.querySelector('#nav-btn-theme');
  if (themeBtn) {
    themeBtn.addEventListener('click', () => {
      toggleTheme();
    });
  }

  // Profile Modal Trigger
  const profileBtn = container.querySelector('#nav-btn-profile');
  if (profileBtn) {
    profileBtn.addEventListener('click', () => {
      renderProfileModal();
    });
  }

  // Notifications Bell Toggle & Interactive Item Routing
  const notifBtn = container.querySelector('#nav-btn-notifications');
  const notifDropdown = container.querySelector('#nav-notifications-dropdown');
  const notifWrapper = container.querySelector('#nav-notifications-wrapper');

  if (notifBtn && notifDropdown) {
    notifBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      notifDropdown.classList.toggle('hidden');
    });

    document.addEventListener('click', (e) => {
      if (notifWrapper && !notifWrapper.contains(e.target)) {
        notifDropdown.classList.add('hidden');
      }
    });

    const dismissAllBtn = container.querySelector('#nav-btn-dismiss-all');
    if (dismissAllBtn) {
      dismissAllBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const allIds = activeAlerts.map(a => a.id);
        const updated = Array.from(new Set([...dismissedAlerts, ...allIds]));
        localStorage.setItem('wastewise_dismissed_alerts', JSON.stringify(updated));
        showToast(t('allMarkedReadToast'), 'info');
        renderNavbar(container);
      });
    }

    const dismissBtns = container.querySelectorAll('.notification-dismiss-btn');
    dismissBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const alertId = btn.getAttribute('data-alert-id');
        const updated = Array.from(new Set([...dismissedAlerts, alertId]));
        localStorage.setItem('wastewise_dismissed_alerts', JSON.stringify(updated));
        renderNavbar(container);
      });
    });

    const notifItems = container.querySelectorAll('.notification-item');
    notifItems.forEach(item => {
      item.addEventListener('click', (e) => {
        if (e.target.closest('.notification-dismiss-btn')) return;
        const prodId = item.getAttribute('data-product-id');
        const product = products.find(p => p.id === prodId);
        if (product) {
          notifDropdown.classList.add('hidden');
          sessionStorage.setItem('wastewise_admin_tab', 'inventory');
          store.setState({
            currentView: 'admin',
            adminTab: 'inventory',
            filters: { category: 'All', status: 'all', search: product.name }
          });

          // Dispatch pulse highlight event for target row in admin view
          setTimeout(() => {
            window.dispatchEvent(new CustomEvent('wastewise:highlightProduct', { detail: { productId: prodId } }));
          }, 150);
        }
      });
    });
  }

  // Direct Logout Handler
  const logoutBtn = container.querySelector('#nav-btn-logout');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      await api.logout();
      store.setState({
        user: null,
        currentView: 'auth',
        cart: [],
        filters: { category: 'All', status: 'all', search: '' }
      });
      showToast(t('signedOutToast'), 'info');
    });
  }
}

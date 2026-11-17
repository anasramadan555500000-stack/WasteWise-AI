// Header and Navigation Component
// Enlarged Brand Logo, Visual Polish, Half-Life Expiry Notifications & Interactive Routing
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
    const expiry = calculateExpiry(p.expiryDate, p.alertDaysBefore, p.createdAt);

    // 1. Critical Near-Expiry Alert (<= 2 days)
    if (expiry.days <= 2 && expiry.days >= 0) {
      const alertId = `crit_exp_${p.id}_${p.expiryDate}`;
      if (!dismissedAlerts.includes(alertId)) {
        activeAlerts.push({
          id: alertId,
          productId: p.id,
          productName: p.name,
          type: 'critical_expiry',
          status: 'critical',
          severity: 'critical',
          title: `🔴 ${t('criticalNearExpiry')}: ${p.name}`,
          message: `${expiry.label} (${expiry.days}d remaining) • ${p.stock} ${t('leftInStock')}`,
          icon: '🔴',
          badgeClass: 'bg-red-100 dark:bg-red-950/80 text-red-700 dark:text-red-300 font-bold border border-red-300 dark:border-red-800'
        });
      }
    } 
    // 2. Smart Half-Life Alert (50% of total shelf life reached, > 2 days)
    else if (expiry.isHalfLife) {
      const alertId = `halflife_${p.id}_${p.expiryDate}`;
      if (!dismissedAlerts.includes(alertId)) {
        activeAlerts.push({
          id: alertId,
          productId: p.id,
          productName: p.name,
          type: 'half_life',
          status: 'warning',
          severity: 'warning',
          title: `⚡ ${t('halfLifeReached')}: ${p.name}`,
          message: `${expiry.label} (${expiry.days}d left of ${expiry.totalDays}d shelf life) • ${p.stock} ${t('leftInStock')}`,
          icon: '⚡',
          badgeClass: 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 font-bold border border-amber-300 dark:border-amber-800'
        });
      }
    } 
    // 3. Expired Alert (< 0 days)
    else if (expiry.days < 0) {
      const alertId = `past_exp_${p.id}_${p.expiryDate}`;
      if (!dismissedAlerts.includes(alertId)) {
        activeAlerts.push({
          id: alertId,
          productId: p.id,
          productName: p.name,
          type: 'expired',
          status: 'expired',
          severity: 'critical',
          title: `⚠️ ${t('expired')}: ${p.name}`,
          message: `${expiry.label} • ${p.stock} ${t('leftInStock')}`,
          icon: '⛔',
          badgeClass: 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 font-bold border border-rose-300'
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
          
          <!-- Left Section: Prominent Enlarged Brand Logo & Identity -->
          <div class="flex items-center gap-3 sm:gap-4 shrink-0">
            <div class="relative group">
              <div class="absolute -inset-1 rounded-2xl bg-gradient-to-r from-emerald-500/20 to-teal-500/20 blur opacity-75 group-hover:opacity-100 transition duration-300"></div>
              <img src="/logo.png" 
                class="relative w-14 h-14 object-contain rounded-2xl bg-slate-950 p-1 border-2 border-emerald-500/40 shadow-lg shadow-emerald-500/20 hover:scale-105 transition-transform duration-300 shrink-0 cursor-pointer" 
                alt="WasteWise AI" 
                onerror="this.onerror=null;this.src='/images/logo.png'" />
            </div>

            <div class="flex flex-col">
              <div class="flex items-center gap-2">
                <span class="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white whitespace-nowrap">
                  ${t('brandTitle')} <span class="text-emerald-500">${t('brandAi')}</span>
                </span>
                <span class="text-[11px] font-extrabold px-2.5 py-0.5 rounded-full whitespace-nowrap hidden xs:inline-flex items-center shadow-sm ${isAdmin ? 'bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800' : 'bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'}">
                  ${isAdmin ? t('adminPanel') : t('posTerminal')}
                </span>
              </div>
              <span class="text-[11px] font-medium text-slate-400 hidden md:block">
                ${t('authFooterSub')}
              </span>
            </div>
          </div>

          <!-- Center Section: Grouped Live Shift, Anchor Date & Status Pills -->
          <div class="hidden sm:flex items-center gap-2 shrink-0">
            <!-- Shift Badge -->
            <div class="hidden xl:flex items-center gap-1.5 glass-pill px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 shadow-sm">
              <span>🌤️</span>
              <span>${t('liveShift')}</span>
            </div>

            <!-- Anchor Date Pill -->
            <div class="hidden lg:flex items-center gap-1.5 glass-pill px-3 py-1.5 rounded-xl text-xs font-mono font-bold text-slate-600 dark:text-slate-300 shadow-sm" title="Simulation Anchor Date">
              <span>📅</span>
              <span>${t('anchorDateLabel')}</span>
            </div>

            <!-- Live Cloud Badge -->
            <div class="flex items-center gap-1.5 glass-pill px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 shadow-sm cursor-help" title="${t('cloudTooltip')}">
              <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>${t('live')}</span>
            </div>

            <!-- Mode Switcher (Admin) or Station Badge (Cashier) -->
            ${isAdmin ? `
              <div class="bg-slate-100 dark:bg-slate-800 p-1 rounded-xl flex items-center gap-1 border border-slate-200 dark:border-slate-700 shadow-inner">
                <button id="nav-btn-admin-view" class="px-2.5 py-1 text-xs font-semibold rounded-lg whitespace-nowrap transition-all cursor-pointer ${currentView === 'admin' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm font-bold' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}">
                  📊 <span class="hidden md:inline">${t('controlCenter')}</span>
                </button>
                <button id="nav-btn-pos-view" class="px-2.5 py-1 text-xs font-semibold rounded-lg whitespace-nowrap transition-all cursor-pointer ${currentView === 'cashier' ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm font-bold' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}">
                  🛒 <span class="hidden md:inline">${t('posView')}</span>
                </button>
              </div>
            ` : `
              <div class="flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap shadow-sm">
                <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>${stationLabel}</span>
              </div>
            `}
          </div>

          <!-- Right Section: Language, Theme, Notifications & User Profile -->
          <div class="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            
            <!-- 1. Language Switcher (AR / EN) -->
            <button id="nav-btn-lang" class="px-3 py-1.5 text-xs font-black rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 shadow-sm transition-all flex items-center gap-1.5 cursor-pointer" title="Switch Language / تغيير اللغة">
              <span>🌐</span>
              <span class="tracking-wider">${currentLang === 'en' ? 'AR' : 'EN'}</span>
            </button>

            <!-- 2. Dark/Light Theme Switcher -->
            <button id="nav-btn-theme" class="p-2 text-slate-500 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all cursor-pointer shadow-sm" title="${isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}">
              ${isDark ? `
                <svg class="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/>
                </svg>
              ` : `
                <svg class="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/>
                </svg>
              `}
            </button>

            <!-- 3. Smart Notifications Bell Dropdown -->
            <div class="relative" id="nav-notifications-wrapper">
              <button id="nav-btn-notifications" class="relative p-2.5 text-slate-500 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all cursor-pointer shadow-sm" title="${t('notifications')}">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
                </svg>
                ${activeAlerts.length > 0 ? `
                  <span class="absolute -top-0.5 -right-0.5 flex h-4 w-4">
                    <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span class="relative inline-flex items-center justify-center rounded-full h-4 w-4 bg-red-500 text-[9px] font-extrabold text-white">
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

            <!-- 4. User Profile Trigger (Compact Avatar + Name) -->
            <button id="nav-btn-profile" class="flex items-center gap-2 p-1 sm:px-2.5 sm:py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all cursor-pointer shadow-sm" title="${t('profile')}">
              <img src="${user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80'}" 
                alt="${user.name}" 
                class="w-7 h-7 sm:w-8 sm:h-8 rounded-lg object-cover ring-2 ring-emerald-500/20 shrink-0" 
                onerror="this.onerror=null;this.src='https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80'" />
              
              <div class="hidden md:flex flex-col text-start">
                <span class="text-xs font-bold text-slate-900 dark:text-white truncate max-w-[110px] leading-tight">${user.name}</span>
                <span class="text-[10px] text-slate-400 capitalize leading-none">${user.role}</span>
              </div>

              <svg class="w-3.5 h-3.5 text-slate-400 hidden sm:block shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
              </svg>
            </button>

            <!-- 5. Sign Out Button -->
            <button id="nav-btn-logout" class="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl transition-all cursor-pointer shadow-sm" title="${t('signOut')}">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
              </svg>
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

  // Logout Handler
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

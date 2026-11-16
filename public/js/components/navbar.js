// Header and Navigation Component
import { store } from '../state.js';
import { api } from '../api.js';
import { showToast } from './toast.js';
import { showConfirmModal } from './confirmModal.js';
import { renderProfileModal } from './profileModal.js';
import { calculateExpiry } from '../utils/formatters.js';

export function renderNavbar(container) {
  const state = store.getState();
  const { user, currentView, products, settings } = state;
  if (!user) {
    container.innerHTML = '';
    return;
  }

  const isAdmin = user.role === 'admin';

  // Compute active notifications
  let dismissedAlerts = [];
  try {
    dismissedAlerts = JSON.parse(localStorage.getItem('wastewise_dismissed_alerts')) || [];
  } catch (e) {}

  const activeAlerts = [];
  (products || []).forEach(p => {
    const expiry = calculateExpiry(p.expiryDate, p.alertDaysBefore);
    // 1. Expiry alerts (warning or expired)
    if (expiry.status === 'expired' || expiry.status === 'warning') {
      const alertId = `exp_${p.id}_${p.expiryDate}`;
      if (!dismissedAlerts.includes(alertId)) {
        activeAlerts.push({
          id: alertId,
          productId: p.id,
          productName: p.name,
          type: 'expiry',
          status: expiry.status,
          severity: expiry.status === 'expired' ? 'critical' : 'warning',
          title: expiry.status === 'expired' ? `Critical Expiry: ${p.name}` : `Expiring Soon: ${p.name}`,
          message: `${expiry.label} • ${p.stock} units currently in inventory.`,
          icon: expiry.status === 'expired' ? '🔴' : '⚠️',
          badgeClass: expiry.badgeClass
        });
      }
    }

    // 2. Low stock alerts (stock <= minStockThreshold)
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
          title: `Low Stock: ${p.name}`,
          message: `Only ${p.stock} units remaining (threshold: ${minThreshold}).`,
          icon: '📦',
          badgeClass: p.stock <= 5 ? 'bg-red-100 text-red-700 font-bold border border-red-300' : 'bg-amber-100 text-amber-800 font-bold border border-amber-300'
        });
      }
    }
  });

  container.innerHTML = `
    <header class="bg-white border-b border-slate-200 sticky top-0 z-30 ww-card-shadow">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          
          <!-- Brand Logo: Official WasteWise AI Logo -->
          <div class="flex items-center gap-3">
            <img src="/logo.png" class="w-10 h-10 object-contain rounded-xl bg-slate-950 p-0.5 border border-emerald-500/30 shadow-md shadow-emerald-500/20 shrink-0" alt="WasteWise AI" onerror="this.onerror=null;this.src='/images/logo.png'" />
            <div>
              <div class="flex items-center gap-2">
                <span class="text-xl font-bold tracking-tight text-slate-900">WasteWise <span class="text-emerald-500 font-extrabold">AI</span></span>
                <span class="text-xs px-2 py-0.5 rounded-full font-semibold ${isAdmin ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'}">
                  ${isAdmin ? 'Admin Control Panel' : 'POS Terminal'}
                </span>
              </div>
              <p class="text-xs text-slate-400 hidden sm:block">${settings?.restaurantName || 'Fried Chicken Restaurant'} • Expiry & Inventory Tracking</p>
            </div>
          </div>

          <!-- Center Mode Switcher (Admins can toggle to test POS screen) -->
          <div class="flex items-center gap-2">
            ${isAdmin ? `
              <div class="bg-slate-100 p-1 rounded-lg flex items-center gap-1 border border-slate-200">
                <button id="nav-btn-admin-view" class="px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${currentView === 'admin' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'}">
                  📊 Control Center
                </button>
                <button id="nav-btn-pos-view" class="px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${currentView === 'cashier' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-900'}">
                  🛒 POS Terminal View
                </button>
              </div>
            ` : `
              <div class="flex items-center gap-2 bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1.5 rounded-lg text-xs font-semibold">
                <span class="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                <span>Terminal Active: ${user.stationTitle || 'Station #01'}</span>
              </div>
            `}
          </div>

          <!-- Action Tools & Profile -->
          <div class="flex items-center gap-2.5">
            
            <!-- Interactive Notifications Center (Navbar Bell) -->
            <div class="relative" id="nav-notifications-wrapper">
              <button id="nav-btn-notifications" class="relative p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all" title="System Notifications & Alerts">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
                </svg>
                ${activeAlerts.length > 0 ? `
                  <span class="absolute top-1 right-1 flex h-4 w-4">
                    <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span class="relative inline-flex items-center justify-center rounded-full h-4 w-4 bg-red-500 text-[9px] font-extrabold text-white">
                      ${activeAlerts.length}
                    </span>
                  </span>
                ` : ''}
              </button>

              <!-- Notifications Dropdown -->
              <div id="nav-notifications-dropdown" class="hidden absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl border border-slate-200 ww-card-shadow z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                <div class="p-3.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <span class="text-xs font-extrabold text-slate-900">System Notifications</span>
                    <span class="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-100 text-emerald-800">
                      ${activeAlerts.length} Active
                    </span>
                  </div>
                  ${activeAlerts.length > 0 ? `
                    <button id="nav-btn-dismiss-all" class="text-[11px] font-bold text-slate-500 hover:text-emerald-600 transition-colors">
                      Mark all as read
                    </button>
                  ` : ''}
                </div>

                <div class="max-h-80 overflow-y-auto divide-y divide-slate-100">
                  ${activeAlerts.length === 0 ? `
                    <div class="py-8 text-center text-slate-400">
                      <svg class="w-8 h-8 mx-auto mb-1 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                      <p class="text-xs font-semibold text-slate-600">All caught up!</p>
                      <p class="text-[10px] text-slate-400">No critical expiry or low-stock alerts right now.</p>
                    </div>
                  ` : activeAlerts.map(alert => `
                    <div class="p-3 hover:bg-slate-50 transition-colors flex items-start justify-between gap-2.5 cursor-pointer notification-item" data-product-id="${alert.productId}" data-alert-id="${alert.id}">
                      <div class="flex items-start gap-2.5 min-w-0 flex-1">
                        <span class="text-base shrink-0 mt-0.5">${alert.icon}</span>
                        <div class="min-w-0">
                          <div class="text-xs font-bold text-slate-900 truncate">${alert.title}</div>
                          <div class="text-[11px] text-slate-500 leading-snug">${alert.message}</div>
                          <span class="inline-block mt-1 text-[9px] font-extrabold px-1.5 py-0.5 rounded ${alert.badgeClass}">
                            ${alert.type.toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <button class="notification-dismiss-btn p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200 transition-colors shrink-0" data-alert-id="${alert.id}" title="Dismiss Alert">
                        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                      </button>
                    </div>
                  `).join('')}
                </div>
              </div>
            </div>

            <!-- Supabase Cloud Badge -->
            <div class="hidden sm:flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg text-xs font-semibold text-emerald-700" title="Supabase Cloud Database Connected: https://nxiajseyrarmmnddjmoa.supabase.co">
              <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Supabase Live</span>
            </div>

            <!-- User Profile Button (Clickable for Admin & Cashier) -->
            <button id="nav-btn-profile" class="flex items-center gap-2.5 pl-2 border-l border-slate-200 hover:bg-slate-50 p-1.5 rounded-xl transition-all cursor-pointer text-left group" title="Click to view & edit your profile">
              <img src="${user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80'}" alt="${user.name}" class="w-8 h-8 rounded-full object-cover ring-2 ring-emerald-500/20 group-hover:ring-emerald-500 transition-all shrink-0" onerror="this.onerror=null;this.src='https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80'" />
              <div class="hidden sm:block text-left">
                <div class="text-xs font-bold text-slate-900 leading-tight group-hover:text-emerald-600 transition-colors flex items-center gap-1">
                  <span>${user.name}</span>
                  <svg class="w-3 h-3 text-slate-400 group-hover:text-emerald-600 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
                </div>
                <div class="text-[11px] text-slate-400 capitalize">${user.stationTitle || (user.role + ' Terminal')}</div>
              </div>
            </button>

            <!-- Sign Out Button -->
            <button id="nav-btn-logout" class="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors" title="Sign Out">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
            </button>

          </div>

        </div>
      </div>
    </header>
  `;

  // Attach Event Listeners
  const adminViewBtn = container.querySelector('#nav-btn-admin-view');
  if (adminViewBtn) {
    adminViewBtn.addEventListener('click', () => {
      store.setState({
        currentView: 'admin',
        filters: { category: 'All', status: 'all', search: '' }
      });
    });
  }

  const posViewBtn = container.querySelector('#nav-btn-pos-view');
  if (posViewBtn) {
    posViewBtn.addEventListener('click', () => {
      store.setState({
        currentView: 'cashier',
        filters: { category: 'All', status: 'all', search: '' }
      });
    });
  }

  // Profile Modal Trigger
  const profileBtn = container.querySelector('#nav-btn-profile');
  if (profileBtn) {
    profileBtn.addEventListener('click', () => {
      renderProfileModal();
    });
  }

  // Notifications Bell Toggle & Actions
  const notifBtn = container.querySelector('#nav-btn-notifications');
  const notifDropdown = container.querySelector('#nav-notifications-dropdown');
  const notifWrapper = container.querySelector('#nav-notifications-wrapper');

  if (notifBtn && notifDropdown) {
    notifBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      notifDropdown.classList.toggle('hidden');
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
      if (notifWrapper && !notifWrapper.contains(e.target)) {
        notifDropdown.classList.add('hidden');
      }
    });

    // Dismiss All
    const dismissAllBtn = container.querySelector('#nav-btn-dismiss-all');
    if (dismissAllBtn) {
      dismissAllBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const allIds = activeAlerts.map(a => a.id);
        const updated = Array.from(new Set([...dismissedAlerts, ...allIds]));
        localStorage.setItem('wastewise_dismissed_alerts', JSON.stringify(updated));
        showToast('All notifications marked as read.', 'info');
        renderNavbar(container);
      });
    }

    // Dismiss Individual
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

    // Clicking an alert item navigates to inventory filtered by that item
    const notifItems = container.querySelectorAll('.notification-item');
    notifItems.forEach(item => {
      item.addEventListener('click', (e) => {
        if (e.target.closest('.notification-dismiss-btn')) return;
        const prodId = item.getAttribute('data-product-id');
        const product = products.find(p => p.id === prodId);
        if (product) {
          notifDropdown.classList.add('hidden');
          if (isAdmin) {
            sessionStorage.setItem('wastewise_admin_tab', 'inventory');
            store.setState({
              currentView: 'admin',
              adminTab: 'inventory',
              filters: { category: 'All', status: 'all', search: product.name }
            });
          } else {
            store.setState({
              filters: { category: 'All', status: 'all', search: product.name }
            });
          }
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
      showToast('You have been signed out safely.', 'info');
    });
  }
}

// Header and Navigation Component
import { store } from '../state.js';
import { api } from '../api.js';
import { showToast } from './toast.js';
import { showConfirmModal } from './confirmModal.js';

export function renderNavbar(container) {
  const { user, currentView } = store.getState();
  if (!user) {
    container.innerHTML = '';
    return;
  }

  const isAdmin = user.role === 'admin';

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
              <p class="text-xs text-slate-400 hidden sm:block">Fried Chicken Restaurant • Expiry & Inventory Tracking</p>
            </div>
          </div>

          <!-- Center Mode Switcher (Admins can toggle to test POS screen) -->
          <div class="flex items-center gap-2">
            ${isAdmin ? `
              <div class="bg-slate-100 p-1 rounded-lg flex items-center gap-1 border border-slate-200">
                <button id="nav-btn-admin-view" class="px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${currentView === 'admin' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'}">
                  📊 Analytics & Inventory
                </button>
                <button id="nav-btn-pos-view" class="px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${currentView === 'cashier' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-900'}">
                  🛒 POS Terminal View
                </button>
              </div>
            ` : `
              <div class="flex items-center gap-2 bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1.5 rounded-lg text-xs font-semibold">
                <span class="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                Terminal Active: Station #01
              </div>
            `}
          </div>

          <!-- User Profile & Action Tools -->
          <div class="flex items-center gap-3">
            <!-- Supabase Cloud Badge -->
            <div class="hidden sm:flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg text-xs font-semibold text-emerald-700" title="Supabase Cloud Database Connected: https://nxiajseyrarmmnddjmoa.supabase.co">
              <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Supabase Live</span>
            </div>

            <!-- Simulated Date Badge -->
            <div class="hidden md:flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-lg text-xs font-medium text-slate-600" title="Simulated Anchor Date">
              <svg class="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
              <span>Nov 15, 2026</span>
            </div>

            <!-- Demo Reset Button (For stakeholders) -->
            ${isAdmin ? `
              <button id="nav-btn-reset-db" class="hidden lg:flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-amber-600 bg-white hover:bg-amber-50 border border-slate-200 hover:border-amber-200 px-2.5 py-1.5 rounded-lg transition-colors" title="Reset to fresh mock state">
                <svg class="w-3.5 h-3.5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
                <span>Reset Demo</span>
              </button>
            ` : ''}

            <!-- User Menu -->
            <div class="flex items-center gap-3 pl-2 border-l border-slate-200">
              <img src="${user.avatar || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100'}" alt="${user.name}" class="w-8 h-8 rounded-full object-cover ring-2 ring-emerald-500/20" onerror="this.onerror=null;this.src='https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80'" />
              <div class="hidden sm:block text-left">
                <div class="text-xs font-bold text-slate-900 leading-tight">${user.name}</div>
                <div class="text-[11px] text-slate-400 capitalize">${user.role} Role</div>
              </div>
              <button id="nav-btn-logout" class="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors" title="Sign Out">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
              </button>
            </div>

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

  const resetBtn = container.querySelector('#nav-btn-reset-db');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      showConfirmModal({
        title: 'Reset Demo Database',
        message: 'Are you sure you want to restore the entire inventory and transaction history to the fresh restaurant state?',
        confirmText: 'Reset Database',
        confirmVariant: 'warning',
        onConfirm: async () => {
          try {
            await api.resetDatabase();
            showToast('Database reset to fresh enterprise mock data.', 'success');
            window.dispatchEvent(new CustomEvent('wastewise:refresh'));
          } catch (err) {
            showToast(err.message, 'danger');
          }
        }
      });
    });
  }

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

// Main Application Coordinator
import { store } from './state.js';
import { api } from './api.js';
import { renderNavbar } from './components/navbar.js';
import { renderAuth } from './components/auth.js';
import { renderAdmin } from './components/admin.js';
import { renderCashier } from './components/cashier.js';
import { renderProductModal } from './components/productModal.js';
import { renderReceiptModal } from './components/receiptModal.js';
import { showToast } from './components/toast.js';

class App {
  constructor() {
    this.navContainer = document.getElementById('navbar-root');
    this.mainContainer = document.getElementById('main-root');
    this.networkContainer = document.getElementById('network-banner-container');
    this.isOnline = navigator.onLine;
    this.init();
  }

  async init() {
    // Network Connectivity Listeners
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.renderNetworkBanner(true);
      showToast('Network connection restored. Online sync active.', 'success');
      this.fetchData(true);
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.renderNetworkBanner(false);
      showToast('Network connection lost. Operating in offline mode.', 'warning');
    });

    // Subscribe to reactive state store
    store.subscribe(() => {
      this.render();
    });

    // Custom Application Event Listeners
    window.addEventListener('wastewise:refresh', () => {
      this.fetchData();
    });

    window.addEventListener('wastewise:openProductModal', (e) => {
      renderProductModal(e.detail?.product || null);
    });

    window.addEventListener('wastewise:openReceiptModal', (e) => {
      renderReceiptModal(e.detail?.transaction || null);
    });

    window.addEventListener('wastewise:unauthorized', () => {
      store.setState({ user: null, currentView: 'auth', cart: [] });
      showToast('Session expired or revoked. Please sign in again.', 'warning');
    });

    // Check if user session already exists
    const token = api.getToken();
    const currentUser = store.getState().user;

    if (token && currentUser) {
      try {
        await this.fetchData(true);
      } catch (err) {
        console.warn('Initial session validation error:', err);
        api.logout();
        store.setState({ user: null, currentView: 'auth' });
      }
    } else {
      store.setState({ currentView: 'auth' });
    }

    // Real-Time Background Synchronization:
    // Polls database/Supabase every 3 seconds silently to ensure instant live stock deduction sync.
    // PAUSES polling during edits or when any modal dialog is open to prevent overwriting user input!
    setInterval(() => {
      const s = store.getState();
      if (!s.user || s.currentView === 'auth') return;

      // Check if any modal is currently open
      const prodModal = document.getElementById('product-modal-container');
      const receiptModal = document.getElementById('receipt-modal-container');
      const confirmModal = document.getElementById('confirm-modal-container');
      const isModalOpen = (prodModal && prodModal.children.length > 0) ||
                          (receiptModal && receiptModal.children.length > 0) ||
                          (confirmModal && confirmModal.children.length > 0);

      // Check if user is actively typing in an input, select, or textarea
      const activeTag = document.activeElement ? document.activeElement.tagName.toUpperCase() : '';
      const isEditing = ['INPUT', 'SELECT', 'TEXTAREA'].includes(activeTag);

      if (isModalOpen || isEditing) {
        // Skip background refresh to protect user's active interaction
        return;
      }

      this.fetchData(true);
    }, 3000);

    this.render();
  }

  renderNetworkBanner(isOnline) {
    if (!this.networkContainer) return;
    if (isOnline) {
      this.networkContainer.innerHTML = `
        <div class="bg-emerald-600 text-white text-xs font-bold py-1.5 px-4 text-center flex items-center justify-center gap-2 animate-in fade-in duration-300">
          <span class="w-2 h-2 rounded-full bg-white animate-pulse"></span>
          <span>Connection restored: WasteWise AI is online and synced.</span>
        </div>
      `;
      setTimeout(() => {
        if (this.isOnline && this.networkContainer) {
          this.networkContainer.innerHTML = '';
        }
      }, 3500);
    } else {
      this.networkContainer.innerHTML = `
        <div class="bg-amber-600 text-white text-xs font-bold py-1.5 px-4 text-center flex items-center justify-center gap-2">
          <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L12 12m-6.364 6.364a9 9 0 010-12.728m0 0l2.829 2.829m-2.829-2.829L12 12"/></svg>
          <span>Operating Offline: Network disconnected. Local caching active.</span>
        </div>
      `;
    }
  }

  async fetchData(silent = false) {
    const state = store.getState();
    if (!state.user) return;

    if (!silent && (!state.products || state.products.length === 0)) {
      store.setState({ isLoading: true });
    }

    try {
      const prodRes = await api.getProducts();
      let analytics = null;
      let txns = state.transactions || [];
      let users = state.users || [];
      let settings = state.settings;

      // Fetch dynamic settings (currency, tax, thresholds, branding)
      try {
        const settingsRes = await api.getSettings();
        if (settingsRes && settingsRes.settings) {
          settings = settingsRes.settings;
        }
      } catch (settingsErr) {
        console.warn('Settings fetch warning:', settingsErr);
      }

      // If Admin, also fetch analytics, users, and transactions
      if (state.user.role === 'admin') {
        try {
          analytics = await api.getAnalytics();
          const txnRes = await api.getTransactions();
          txns = txnRes.transactions || txns;
          const userRes = await api.getUsers();
          users = userRes.users || users;
        } catch (adminErr) {
          console.warn('Error fetching admin datasets, using computed fallback:', adminErr);
        }
      }

      store.setState({
        products: prodRes.products || state.products,
        analytics: analytics || state.analytics,
        transactions: txns,
        users,
        settings,
        isLoading: false
      });
    } catch (err) {
      store.setState({ isLoading: false });
      if (!silent) {
        showToast(err.message, 'danger');
      }
    }
  }

  render() {
    const { user, currentView } = store.getState();

    // Render Navigation Header
    if (this.navContainer) {
      if (user && currentView !== 'auth') {
        renderNavbar(this.navContainer);
      } else {
        this.navContainer.innerHTML = '';
      }
    }

    // Render Main Content View
    if (!this.mainContainer) return;

    if (!user || currentView === 'auth') {
      renderAuth(this.mainContainer);
    } else if (currentView === 'admin') {
      if (user.role !== 'admin') {
        store.setState({ currentView: 'cashier' });
        showToast('Access Denied: Cashier accounts cannot view admin analytics.', 'danger');
        return;
      }
      renderAdmin(this.mainContainer);
    } else if (currentView === 'cashier') {
      renderCashier(this.mainContainer);
    }
  }
}

// Bootstrap application on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  window.app = new App();
});

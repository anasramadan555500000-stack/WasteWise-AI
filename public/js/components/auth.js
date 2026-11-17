// Clean, Automated & Secure Authentication Screen Component
// Enhanced with Enlarged Brand Logo, Animated Radial Aura, Floating Feature Cards & Visual Polish
import { api } from '../api.js';
import { store } from '../state.js';
import { showToast } from './toast.js';
import { t, getLanguage, toggleLanguage, isRTL } from '../utils/i18n.js';
import { toggleTheme, isDarkMode } from '../utils/theme.js';

export function renderAuth(container) {
  const currentLang = getLanguage();
  const isDark = isDarkMode();
  const rtl = isRTL();

  container.innerHTML = `
    <div class="relative min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 bg-slate-50 dark:bg-[#0B1120] text-slate-900 dark:text-slate-100 transition-colors duration-200 overflow-hidden bg-grid-pattern">
      
      <!-- Decorative Background Gradient Orbs -->
      <div class="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-emerald-500/15 blur-3xl pointer-events-none animate-aura"></div>
      <div class="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-teal-500/15 blur-3xl pointer-events-none animate-aura" style="animation-delay: 1.5s;"></div>
      <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-indigo-500/5 blur-3xl pointer-events-none"></div>

      <!-- Top Quick Controls (Language & Theme) -->
      <div class="w-full max-w-lg flex items-center justify-between mb-4 z-10">
        <div class="flex items-center gap-1.5 glass-pill px-3 py-1 rounded-xl text-xs font-bold text-emerald-600 dark:text-emerald-400">
          <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Enterprise Restaurant POS</span>
        </div>

        <div class="flex items-center gap-2">
          <!-- Language Switcher -->
          <button id="auth-btn-lang" class="px-3 py-1.5 text-xs font-black rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 shadow-sm transition-all flex items-center gap-1 cursor-pointer" title="Switch Language / تغيير اللغة">
            <span>🌐</span>
            <span>${currentLang === 'en' ? 'العربية (AR)' : 'English (EN)'}</span>
          </button>

          <!-- Theme Switcher -->
          <button id="auth-btn-theme" class="p-2 text-slate-500 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm transition-all cursor-pointer" title="${isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}">
            ${isDark ? `
              <svg class="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/></svg>
            ` : `
              <svg class="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/></svg>
            `}
          </button>
        </div>
      </div>

      <!-- Main Login & Hero Presentation Container -->
      <div class="max-w-lg w-full space-y-6 z-10">
        
        <!-- Header & Commanding Enlarged Brand Logo with Glowing Aura -->
        <div class="text-center space-y-3">
          <div class="relative inline-flex items-center justify-center p-2 mb-1 group">
            <!-- Glowing Radial Aura -->
            <div class="absolute inset-0 rounded-3xl bg-gradient-to-r from-emerald-500 to-teal-500 opacity-30 blur-xl group-hover:opacity-50 transition duration-500 animate-aura"></div>
            
            <img src="/logo.png" 
              alt="WasteWise AI" 
              class="relative w-28 h-28 sm:w-32 sm:h-32 object-contain mx-auto rounded-3xl shadow-2xl shadow-emerald-500/30 bg-slate-950 p-2.5 border-2 border-emerald-500/50 hover:scale-105 transition-transform duration-300" 
              onerror="this.onerror=null;this.src='/images/logo.png'" />
          </div>

          <div>
            <h1 class="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
              ${t('brandTitle')} <span class="text-emerald-500">${t('brandAi')}</span>
            </h1>
            <p class="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium mt-1.5 max-w-md mx-auto">
              ${t('authFooterSub')}
            </p>
          </div>
        </div>

        <!-- Floating Glassmorphism Dynamic Feature Badges (Enriching Empty Space) -->
        <div class="flex flex-wrap items-center justify-center gap-2 pt-1 pb-2">
          <div class="glass-pill px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 shadow-sm animate-float">
            ${t('featurePosStockSync')}
          </div>
          <div class="glass-pill px-3 py-1.5 rounded-xl text-xs font-bold text-emerald-600 dark:text-emerald-400 shadow-sm animate-float-slow">
            ${t('featureAiHalfLife')}
          </div>
          <div class="glass-pill px-3 py-1.5 rounded-xl text-xs font-bold text-indigo-600 dark:text-indigo-400 shadow-sm animate-float">
            ${t('featureRealtimePnL')}
          </div>
        </div>

        <!-- Clean High-End Login Card -->
        <div class="glass-card rounded-3xl p-6 sm:p-8 ww-card-shadow space-y-6 transition-colors duration-200 border border-slate-200/80 dark:border-slate-800/80 shadow-2xl">
          
          <div class="space-y-1">
            <h2 class="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">${t('authSignInTitle')}</h2>
            <p class="text-xs text-slate-400 dark:text-slate-500">${t('authSignInSub')}</p>
          </div>

          <!-- Automated Secure Login Form -->
          <form id="login-form" class="space-y-4">
            
            <!-- Email Input -->
            <div>
              <label for="login-email" class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">${t('emailLabel')}</label>
              <div class="relative">
                <div class="absolute inset-y-0 ${rtl ? 'right-0 pr-3.5' : 'left-0 pl-3.5'} flex items-center pointer-events-none text-slate-400">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.206"/>
                  </svg>
                </div>
                <input 
                  type="email" 
                  id="login-email" 
                  required 
                  autocomplete="email"
                  class="w-full ${rtl ? 'pr-10 pl-3.5' : 'pl-10 pr-3.5'} py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all placeholder:text-slate-400 text-slate-900 dark:text-white font-medium"
                  placeholder="admin@wastewise.com or cashier@wastewise.com" 
                />
              </div>
            </div>

            <!-- Password Input -->
            <div>
              <label for="login-password" class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">${t('passwordLabel')}</label>
              <div class="relative">
                <div class="absolute inset-y-0 ${rtl ? 'right-0 pr-3.5' : 'left-0 pl-3.5'} flex items-center pointer-events-none text-slate-400">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                  </svg>
                </div>
                <input 
                  type="password" 
                  id="login-password" 
                  required 
                  autocomplete="current-password"
                  class="w-full ${rtl ? 'pr-10 pl-10' : 'pl-10 pr-10'} py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all placeholder:text-slate-400 text-slate-900 dark:text-white font-medium"
                  placeholder="••••••••" 
                />
                <button type="button" id="toggle-password" class="absolute inset-y-0 ${rtl ? 'left-0 pl-3.5' : 'right-0 pr-3.5'} flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer" title="Toggle password visibility">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                  </svg>
                </button>
              </div>
            </div>

            <!-- Error Banner -->
            <div id="login-error" class="hidden p-3 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 text-xs text-red-600 dark:text-red-400 flex items-center gap-2">
              <svg class="w-4 h-4 text-red-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <span id="login-error-text"></span>
            </div>

            <!-- Submit Button -->
            <button 
              type="submit" 
              id="login-submit-btn" 
              class="w-full py-3.5 px-4 bg-emerald-500 hover:bg-emerald-600 active:scale-[0.99] text-white text-sm font-bold rounded-xl shadow-lg shadow-emerald-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>${t('signInSubmit')}</span>
              <svg class="w-4 h-4 ${rtl ? 'rotate-180' : ''}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/>
              </svg>
            </button>
          </form>

          <!-- Quick Autofill Role Shortcut Buttons for Instant Demo Testing -->
          <div class="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
            <p class="text-[11px] font-semibold text-slate-400 dark:text-slate-500 text-center uppercase tracking-wider">
              Quick Role Switcher (Auto-fills credentials)
            </p>
            <div class="grid grid-cols-2 gap-2">
              <button 
                type="button" 
                id="btn-fill-admin"
                class="py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-all text-center cursor-pointer shadow-sm"
              >
                ${t('adminDemoBtn')}
              </button>
              <button 
                type="button" 
                id="btn-fill-cashier"
                class="py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-all text-center cursor-pointer shadow-sm"
              >
                ${t('cashierDemoBtn')}
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  `;

  // Attach Event Handlers
  const form = container.querySelector('#login-form');
  const emailInput = container.querySelector('#login-email');
  const passwordInput = container.querySelector('#login-password');
  const errorBox = container.querySelector('#login-error');
  const errorText = container.querySelector('#login-error-text');
  const submitBtn = container.querySelector('#login-submit-btn');
  const togglePassBtn = container.querySelector('#toggle-password');
  const fillAdminBtn = container.querySelector('#btn-fill-admin');
  const fillCashierBtn = container.querySelector('#btn-fill-cashier');

  // Language & Theme Toggle in Auth
  const authLangBtn = container.querySelector('#auth-btn-lang');
  if (authLangBtn) {
    authLangBtn.addEventListener('click', () => {
      toggleLanguage();
    });
  }

  const authThemeBtn = container.querySelector('#auth-btn-theme');
  if (authThemeBtn) {
    authThemeBtn.addEventListener('click', () => {
      toggleTheme();
    });
  }

  // Toggle Password Visibility
  if (togglePassBtn) {
    togglePassBtn.addEventListener('click', () => {
      const isPass = passwordInput.type === 'password';
      passwordInput.type = isPass ? 'text' : 'password';
      togglePassBtn.innerHTML = isPass ? `
        <svg class="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18"/></svg>
      ` : `
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
      `;
    });
  }

  // Quick Demo Auto-fill Handlers
  if (fillAdminBtn) {
    fillAdminBtn.addEventListener('click', () => {
      emailInput.value = 'admin@wastewise.com';
      passwordInput.value = 'admin123';
      errorBox.classList.add('hidden');
    });
  }

  if (fillCashierBtn) {
    fillCashierBtn.addEventListener('click', () => {
      emailInput.value = 'cashier@wastewise.com';
      passwordInput.value = 'cashier123';
      errorBox.classList.add('hidden');
    });
  }

  // Form Submission
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      errorBox.classList.add('hidden');

      const email = emailInput.value.trim();
      const password = passwordInput.value;

      if (!email || !password) {
        errorText.textContent = 'Please enter both email and password.';
        errorBox.classList.remove('hidden');
        return;
      }

      submitBtn.disabled = true;
      submitBtn.innerHTML = `
        <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
        <span>${t('signingIn')}</span>
      `;

      try {
        const data = await api.login(email, password);
        store.setState({
          user: data.user,
          currentView: data.user.role === 'admin' ? 'admin' : 'cashier',
          adminTab: 'inventory',
          filters: { category: 'All', status: 'all', search: '' }
        });
        showToast(`Welcome back, ${data.user.name}!`, 'success');
      } catch (err) {
        errorText.textContent = err.message || 'Authentication failed. Please check credentials.';
        errorBox.classList.remove('hidden');
        submitBtn.disabled = false;
        submitBtn.innerHTML = `
          <span>${t('signInSubmit')}</span>
          <svg class="w-4 h-4 ${rtl ? 'rotate-180' : ''}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/>
          </svg>
        `;
      }
    });
  }
}

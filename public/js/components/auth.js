// Clean, Automated & Secure Authentication Screen Component
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
    <div class="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 bg-slate-50 dark:bg-[#0B1120] text-slate-900 dark:text-slate-100 transition-colors duration-200">
      
      <!-- Top Quick Controls (Language & Theme) -->
      <div class="w-full max-w-md flex items-center justify-end gap-2 mb-4">
        <!-- Language Switcher -->
        <button id="auth-btn-lang" class="px-2.5 py-1 text-xs font-extrabold rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 shadow-sm transition-all flex items-center gap-1 cursor-pointer" title="Switch Language / تغيير اللغة">
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

      <div class="max-w-md w-full space-y-6">
        
        <!-- Header & Brand Logo -->
        <div class="text-center space-y-3">
          <div class="inline-flex items-center justify-center mb-1">
            <img src="/logo.png" alt="WasteWise AI" class="w-20 h-20 sm:w-24 sm:h-24 object-contain rounded-2xl shadow-xl shadow-emerald-500/20 bg-slate-950 p-1.5 border-2 border-emerald-500/40" onerror="this.onerror=null;this.src='/images/logo.png'" />
          </div>
          <div>
            <h1 class="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              ${t('brandTitle')} <span class="text-emerald-500">${t('brandAi')}</span>
            </h1>
            <p class="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">
              ${t('authFooterSub')}
            </p>
          </div>
        </div>

        <!-- Clean Login Card -->
        <div class="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 ww-card-shadow border border-slate-200 dark:border-slate-800 space-y-6 transition-colors duration-200">
          
          <div class="space-y-1">
            <h2 class="text-lg font-bold text-slate-900 dark:text-white">${t('authSignInTitle')}</h2>
            <p class="text-xs text-slate-400">${t('authSignInSub')}</p>
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
                <button type="button" id="toggle-password" class="absolute inset-y-0 ${rtl ? 'left-0 pl-3.5' : 'right-0 pr-3.5'} flex items-center text-slate-400 hover:text-slate-600 transition-colors" title="Toggle password visibility">
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
              class="w-full py-3 px-4 bg-emerald-500 hover:bg-emerald-600 active:scale-[0.99] text-white text-sm font-bold rounded-xl shadow-md shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>${t('signInSubmit')}</span>
              <svg class="w-4 h-4 ${rtl ? 'rotate-180' : ''}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/>
              </svg>
            </button>
          </form>

          <!-- Quick Autofill Role Shortcut Buttons for Instant Demo Testing -->
          <div class="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
            <p class="text-[11px] font-semibold text-slate-400 text-center uppercase tracking-wider">
              Quick Role Switcher (Auto-fills credentials)
            </p>
            <div class="grid grid-cols-2 gap-2">
              <button 
                type="button" 
                id="btn-fill-admin"
                class="py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-all text-center"
              >
                ${t('adminDemoBtn')}
              </button>
              <button 
                type="button" 
                id="btn-fill-cashier"
                class="py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-all text-center"
              >
                ${t('cashierDemoBtn')}
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  `;

  // Language & Theme Toggle in Auth View
  container.querySelector('#auth-btn-lang')?.addEventListener('click', () => {
    toggleLanguage();
  });
  container.querySelector('#auth-btn-theme')?.addEventListener('click', () => {
    toggleTheme();
  });

  // Password visibility toggle
  const pwdInput = container.querySelector('#login-password');
  const toggleBtn = container.querySelector('#toggle-password');
  if (toggleBtn && pwdInput) {
    toggleBtn.addEventListener('click', () => {
      const isPwd = pwdInput.type === 'password';
      pwdInput.type = isPwd ? 'text' : 'password';
      toggleBtn.classList.toggle('text-emerald-500', isPwd);
    });
  }

  // Quick fill buttons
  const emailInput = container.querySelector('#login-email');
  const fillAdmin = container.querySelector('#btn-fill-admin');
  const fillCashier = container.querySelector('#btn-fill-cashier');

  if (fillAdmin && emailInput && pwdInput) {
    fillAdmin.addEventListener('click', () => {
      emailInput.value = 'admin@wastewise.com';
      pwdInput.value = 'Admin@123';
      showToast('Admin credentials filled.', 'info');
    });
  }

  if (fillCashier && emailInput && pwdInput) {
    fillCashier.addEventListener('click', () => {
      emailInput.value = 'cashier@wastewise.com';
      pwdInput.value = 'Cashier@123';
      showToast('Cashier credentials filled.', 'info');
    });
  }

  // Form submission handler
  const form = container.querySelector('#login-form');
  const errorBox = container.querySelector('#login-error');
  const errorText = container.querySelector('#login-error-text');
  const submitBtn = container.querySelector('#login-submit-btn');

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (errorBox) errorBox.classList.add('hidden');

      const email = emailInput.value.trim();
      const password = pwdInput.value;

      submitBtn.disabled = true;
      submitBtn.innerHTML = `
        <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
        <span>${t('signingIn')}</span>
      `;

      try {
        const response = await api.login(email, password);

        if (response.success && response.user) {
          showToast(`Welcome back, ${response.user.name}!`, 'success');
          
          store.setState({
            user: response.user,
            currentView: response.user.role === 'admin' ? 'admin' : 'cashier',
            cart: [],
            filters: { category: 'All', status: 'all', search: '' }
          });

          window.dispatchEvent(new CustomEvent('wastewise:refresh'));
        } else {
          throw new Error(response.error || 'Login authorization failed.');
        }
      } catch (err) {
        if (errorBox && errorText) {
          errorText.textContent = err.message || 'An unexpected enterprise server error occurred.';
          errorBox.classList.remove('hidden');
        }
        showToast(err.message || 'Login failed.', 'danger');
        
        submitBtn.disabled = false;
        submitBtn.innerHTML = `
          <span>${t('signInSubmit')}</span>
          <svg class="w-4 h-4 ${rtl ? 'rotate-180' : ''}" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
        `;
      }
    });
  }
}

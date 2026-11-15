// Clean, Automated & Secure Authentication Screen Component
import { api } from '../api.js';
import { store } from '../state.js';
import { showToast } from './toast.js';

export function renderAuth(container) {
  container.innerHTML = `
    <div class="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div class="max-w-md w-full space-y-6">
        
        <!-- Header & Brand Logo: Official WasteWise AI Logo -->
        <div class="text-center space-y-3">
          <div class="inline-flex items-center justify-center mb-1">
            <img src="/logo.png" alt="WasteWise AI" class="w-24 h-24 sm:w-28 sm:h-28 object-contain rounded-2xl shadow-xl shadow-emerald-500/20 bg-slate-950 p-1.5 border-2 border-emerald-500/40" onerror="this.onerror=null;this.src='/images/logo.png'" />
          </div>
          <div>
            <h1 class="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              WasteWise <span class="text-emerald-500">AI</span>
            </h1>
            <p class="text-xs sm:text-sm text-slate-500 font-medium mt-1">
              Fried Chicken Restaurant • Expiry Tracking & Real-Time POS
            </p>
          </div>
        </div>

        <!-- Clean Login Card -->
        <div class="bg-white rounded-2xl p-6 sm:p-8 ww-card-shadow border border-slate-200 space-y-6">
          
          <div class="space-y-1">
            <h2 class="text-lg font-bold text-slate-900">Sign In</h2>
            <p class="text-xs text-slate-400">Enter your credentials to securely access your terminal or dashboard.</p>
          </div>

          <!-- Automated Secure Login Form -->
          <form id="login-form" class="space-y-4">
            
            <!-- Email Input -->
            <div>
              <label for="login-email" class="block text-xs font-semibold text-slate-700 mb-1.5">Email Address</label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.206"/>
                  </svg>
                </div>
                <input 
                  type="email" 
                  id="login-email" 
                  required 
                  autocomplete="email"
                  class="w-full pl-10 pr-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all placeholder:text-slate-400"
                  placeholder="admin@wastewise.com or cashier@wastewise.com" 
                />
              </div>
            </div>

            <!-- Password Input -->
            <div>
              <label for="login-password" class="block text-xs font-semibold text-slate-700 mb-1.5">Password</label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                  </svg>
                </div>
                <input 
                  type="password" 
                  id="login-password" 
                  required 
                  autocomplete="current-password"
                  class="w-full pl-10 pr-10 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all placeholder:text-slate-400"
                  placeholder="••••••••" 
                />
                <button type="button" id="toggle-password" class="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors" title="Toggle password visibility">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                  </svg>
                </button>
              </div>
            </div>

            <!-- Error Banner -->
            <div id="login-error" class="hidden p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-600 flex items-center gap-2">
              <svg class="w-4 h-4 text-red-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <span id="login-error-text"></span>
            </div>

            <!-- Submit Button -->
            <button 
              type="submit" 
              id="login-submit-btn" 
              class="w-full py-3 px-4 bg-emerald-500 hover:bg-emerald-600 active:scale-[0.99] text-white text-sm font-bold rounded-xl shadow-md shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
            >
              <span>Sign In to System</span>
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/>
              </svg>
            </button>

          </form>

        </div>

        <!-- Security Subtext -->
        <div class="flex items-center justify-center gap-2 text-xs text-slate-400">
          <svg class="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          <span>Automated RBAC Routing • Bcrypt Hashed • Enterprise Security</span>
        </div>

      </div>
    </div>
  `;

  const emailInput = container.querySelector('#login-email');
  const passwordInput = container.querySelector('#login-password');
  const errorBox = container.querySelector('#login-error');
  const errorText = container.querySelector('#login-error-text');
  const submitBtn = container.querySelector('#login-submit-btn');
  const form = container.querySelector('#login-form');
  const togglePassBtn = container.querySelector('#toggle-password');

  // Toggle password visibility
  if (togglePassBtn) {
    togglePassBtn.addEventListener('click', () => {
      passwordInput.type = passwordInput.type === 'password' ? 'text' : 'password';
    });
  }

  // Automated Login Handler
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorBox.classList.add('hidden');
    submitBtn.disabled = true;
    submitBtn.innerHTML = `
      <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
      <span>Verifying Credentials...</span>
    `;

    try {
      const email = emailInput.value.trim();
      const password = passwordInput.value;

      // Backend authentication call
      const data = await api.login(email, password);
      
      // Automatically determine destination role
      const userRole = data.user.role;
      const destinationView = userRole === 'admin' ? 'admin' : 'cashier';

      showToast(`Welcome, ${data.user.name}! Redirecting to ${userRole === 'admin' ? 'Admin Dashboard' : 'POS Terminal'}...`, 'success');

      store.setState({
        user: data.user,
        currentView: destinationView
      });
    } catch (err) {
      errorText.textContent = err.message || 'Invalid email or password.';
      errorBox.classList.remove('hidden');
      submitBtn.disabled = false;
      submitBtn.innerHTML = `
        <span>Sign In to System</span>
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
      `;
    }
  });
}

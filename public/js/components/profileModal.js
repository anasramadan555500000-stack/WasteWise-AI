// User Profile Modal Component (Admin & Cashier)
import { store } from '../state.js';
import { api } from '../api.js';
import { showToast } from './toast.js';

const PRESET_AVATARS = [
  { label: 'Manager / Executive', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160&auto=format&fit=crop&q=80' },
  { label: 'Chef / Kitchen Lead', url: 'https://images.unsplash.com/photo-1583394293214-28ded15ee548?w=160&auto=format&fit=crop&q=80' },
  { label: 'Cashier / Front Desk', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=160&auto=format&fit=crop&q=80' },
  { label: 'Supervisor / Operations', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=160&auto=format&fit=crop&q=80' },
  { label: 'Service Lead', url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=160&auto=format&fit=crop&q=80' },
  { label: 'Inventory Auditor', url: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=160&auto=format&fit=crop&q=80' }
];

export function renderProfileModal() {
  const { user } = store.getState();
  if (!user) return;

  const isAdmin = user.role === 'admin';
  const modalId = 'profile-modal-container';
  let modalContainer = document.getElementById(modalId);

  if (!modalContainer) {
    modalContainer = document.createElement('div');
    modalContainer.id = modalId;
    document.body.appendChild(modalContainer);
  }

  let selectedAvatar = user.avatar || PRESET_AVATARS[0].url;

  modalContainer.innerHTML = `
    <div class="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 modal-backdrop animate-in fade-in duration-200">
      <div class="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-7 ww-card-shadow border border-slate-200 relative animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
        
        <!-- Header -->
        <div class="flex items-center justify-between pb-4 border-b border-slate-100 shrink-0">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-200">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
              </svg>
            </div>
            <div>
              <h2 class="text-base font-extrabold text-slate-900">User Profile & Terminal Security</h2>
              <p class="text-xs text-slate-400">Manage account information, POS terminal PIN, and credentials.</p>
            </div>
          </div>
          <button id="profile-modal-close" class="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>

        <!-- Scrollable Form Body -->
        <form id="profile-form" class="space-y-5 py-4 overflow-y-auto pr-1 flex-1">
          
          <!-- Avatar Preview & Preset Picker -->
          <div class="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
            <label class="block text-xs font-bold text-slate-700">Profile Photo</label>
            <div class="flex items-center gap-4">
              <img id="profile-avatar-preview" src="${selectedAvatar}" alt="${user.name}"
                class="w-16 h-16 rounded-2xl object-cover ring-4 ring-emerald-500/20 border border-slate-200 shadow-sm shrink-0"
                onerror="this.onerror=null;this.src='https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80'" />
              
              <div class="flex-1 space-y-2">
                <input type="url" id="profile-avatar-url" value="${selectedAvatar}"
                  placeholder="https://... or choose preset below"
                  class="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono" />
                <p class="text-[11px] text-slate-400">Choose a quick avatar preset or paste your image URL:</p>
              </div>
            </div>

            <!-- Preset Avatar Pills -->
            <div class="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none pt-1">
              ${PRESET_AVATARS.map((av, idx) => `
                <button type="button" class="preset-avatar-btn shrink-0 w-9 h-9 rounded-xl overflow-hidden border-2 transition-all ${selectedAvatar === av.url ? 'border-emerald-500 ring-2 ring-emerald-500/20 scale-105' : 'border-slate-200 hover:border-slate-400'}" data-url="${av.url}" title="${av.label}">
                  <img src="${av.url}" alt="${av.label}" class="w-full h-full object-cover" />
                </button>
              `).join('')}
            </div>
          </div>

          <!-- Basic Information -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label for="profile-name" class="block text-xs font-bold text-slate-700 mb-1.5">Full Name</label>
              <input type="text" id="profile-name" required value="${user.name}"
                class="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-medium" />
            </div>

            <div>
              <label for="profile-email" class="block text-xs font-bold text-slate-700 mb-1.5">Email Address</label>
              <input type="email" id="profile-email" required value="${user.email}"
                class="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-medium" />
            </div>
          </div>

          <!-- Role & Station Title -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1.5">System Access Role</label>
              <div class="px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 flex items-center justify-between">
                <span class="capitalize">${user.role}</span>
                <span class="text-[10px] px-2 py-0.5 rounded-full ${isAdmin ? 'bg-indigo-100 text-indigo-700' : 'bg-emerald-100 text-emerald-700'} font-mono uppercase">
                  ${isAdmin ? 'Full Clearance' : 'POS Cashier'}
                </span>
              </div>
            </div>

            <div>
              <label for="profile-station" class="block text-xs font-bold text-slate-700 mb-1.5">
                ${isAdmin ? 'Display Title / Station Name' : 'Assigned Terminal Station'}
              </label>
              <input type="text" id="profile-station" 
                ${isAdmin ? '' : 'readonly'}
                value="${user.stationTitle || (isAdmin ? 'General Manager • Executive Terminal' : 'Station #01 • Cashier Terminal')}"
                class="w-full px-3.5 py-2.5 text-sm ${isAdmin ? 'bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500' : 'bg-slate-100 text-slate-500 cursor-not-allowed'} border border-slate-200 rounded-xl focus:outline-none transition-all font-medium" />
            </div>
          </div>

          <!-- Security: Quick POS PIN Code -->
          <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <div class="flex items-center justify-between">
              <label for="profile-pos-pin" class="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <svg class="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"/></svg>
                <span>Quick POS Cashier PIN Code (4–6 Digits)</span>
              </label>
              <span class="text-[10px] text-slate-400 font-medium">Optional</span>
            </div>
            <input type="password" id="profile-pos-pin" maxlength="6" value="${user.posPin || ''}"
              placeholder="e.g. 1234 (digits only for rapid cashier access)"
              class="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono tracking-widest placeholder:tracking-normal placeholder:font-sans" />
            <p class="text-[11px] text-slate-400">Allows rapid POS authorization without re-typing long master passwords.</p>
          </div>

          <!-- Security: Change Master Password -->
          <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <div class="flex items-center gap-2 text-xs font-bold text-slate-900">
              <svg class="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
              <span>Change Account Password (Leave blank to keep current)</span>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label for="profile-current-password" class="block text-[11px] font-semibold text-slate-600 mb-1">Current Password</label>
                <input type="password" id="profile-current-password" autocomplete="current-password"
                  placeholder="Required if setting new password"
                  class="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>

              <div>
                <label for="profile-new-password" class="block text-[11px] font-semibold text-slate-600 mb-1">New Password</label>
                <input type="password" id="profile-new-password" autocomplete="new-password" minlength="6"
                  placeholder="Min 6 characters"
                  class="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>
            </div>
          </div>

          <!-- Error Alert Banner -->
          <div id="profile-error-box" class="hidden p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-600 flex items-center gap-2">
            <svg class="w-4 h-4 text-red-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            <span id="profile-error-text"></span>
          </div>

          <!-- Submit Controls -->
          <div class="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button type="button" id="profile-btn-cancel" class="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-xl hover:bg-slate-100 transition-colors">
              Cancel
            </button>
            <button type="submit" id="profile-btn-save" class="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 active:scale-[0.99] text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-500/20 transition-all flex items-center gap-2">
              <span>Save Profile Changes</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  `;

  // DOM Elements
  const closeBtn = modalContainer.querySelector('#profile-modal-close');
  const cancelBtn = modalContainer.querySelector('#profile-btn-cancel');
  const form = modalContainer.querySelector('#profile-form');
  const avatarInput = modalContainer.querySelector('#profile-avatar-url');
  const avatarPreview = modalContainer.querySelector('#profile-avatar-preview');
  const presetBtns = modalContainer.querySelectorAll('.preset-avatar-btn');
  const errorBox = modalContainer.querySelector('#profile-error-box');
  const errorText = modalContainer.querySelector('#profile-error-text');
  const saveBtn = modalContainer.querySelector('#profile-btn-save');

  function closeModal() {
    modalContainer.innerHTML = '';
  }

  closeBtn?.addEventListener('click', closeModal);
  cancelBtn?.addEventListener('click', closeModal);

  // Preset Avatar Selection
  presetBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const url = btn.getAttribute('data-url');
      selectedAvatar = url;
      avatarInput.value = url;
      avatarPreview.src = url;

      presetBtns.forEach(b => {
        b.classList.remove('border-emerald-500', 'ring-2', 'ring-emerald-500/20', 'scale-105');
        b.classList.add('border-slate-200');
      });
      btn.classList.add('border-emerald-500', 'ring-2', 'ring-emerald-500/20', 'scale-105');
      btn.classList.remove('border-slate-200');
    });
  });

  // Custom Avatar URL Input Change
  avatarInput?.addEventListener('input', (e) => {
    const val = e.target.value.trim();
    if (val) {
      avatarPreview.src = val;
      selectedAvatar = val;
    }
  });

  // Form Submit
  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorBox.classList.add('hidden');

    const name = modalContainer.querySelector('#profile-name').value.trim();
    const email = modalContainer.querySelector('#profile-email').value.trim();
    const currentPassword = modalContainer.querySelector('#profile-current-password').value;
    const newPassword = modalContainer.querySelector('#profile-new-password').value;
    const posPin = modalContainer.querySelector('#profile-pos-pin').value.trim();
    const stationTitleEl = modalContainer.querySelector('#profile-station');
    const stationTitle = stationTitleEl ? stationTitleEl.value.trim() : undefined;

    if (newPassword && !currentPassword) {
      errorText.textContent = 'Please enter your current password to set a new password.';
      errorBox.classList.remove('hidden');
      return;
    }

    saveBtn.disabled = true;
    saveBtn.innerHTML = `
      <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
      <span>Saving Updates...</span>
    `;

    try {
      const payload = {
        name,
        email,
        avatar: selectedAvatar,
        posPin: posPin || null
      };

      if (newPassword) {
        payload.currentPassword = currentPassword;
        payload.newPassword = newPassword;
      }

      if (isAdmin && stationTitle) {
        payload.stationTitle = stationTitle;
      }

      const res = await api.updateProfile(payload);

      store.setState({ user: res.user });
      showToast('Profile and security credentials updated successfully!', 'success');
      closeModal();
    } catch (err) {
      errorText.textContent = err.message || 'Failed to update profile.';
      errorBox.classList.remove('hidden');
      saveBtn.disabled = false;
      saveBtn.innerHTML = `<span>Save Profile Changes</span>`;
    }
  });
}

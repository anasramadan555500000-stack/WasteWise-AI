// Add / Edit Product Modal Component
import { api } from '../api.js';
import { showToast } from './toast.js';

const PRESET_IMAGES = [
  { label: 'Bucket', url: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=600&auto=format&fit=crop&q=80' },
  { label: 'Meal (3 Pcs)', url: 'https://images.unsplash.com/photo-1569058242253-92a9c755a0ec?w=600&auto=format&fit=crop&q=80' },
  { label: 'Fries', url: 'https://images.unsplash.com/photo-1576107232684-1279f3908594?w=600&auto=format&fit=crop&q=80' },
  { label: 'Coleslaw', url: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&auto=format&fit=crop&q=80' },
  { label: 'Cheddar', url: 'https://images.unsplash.com/photo-1574894709920-11b28e7367e3?w=600&auto=format&fit=crop&q=80' },
  { label: 'Drink Can', url: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=600&auto=format&fit=crop&q=80' }
];

export function renderProductModal(product = null) {
  const isEdit = !!product;
  const modalId = 'product-modal-container';
  let modalContainer = document.getElementById(modalId);

  if (!modalContainer) {
    modalContainer = document.createElement('div');
    modalContainer.id = modalId;
    document.body.appendChild(modalContainer);
  }

  modalContainer.innerHTML = `
    <div class="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 modal-backdrop">
      <div class="bg-white rounded-2xl max-w-lg w-full p-6 ww-card-shadow border border-slate-200 relative animate-in fade-in zoom-in-95 duration-200">
        
        <!-- Header -->
        <div class="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h3 class="text-lg font-bold text-slate-900">${isEdit ? 'Edit Inventory Item' : 'Add New Inventory Item'}</h3>
            <p class="text-xs text-slate-400">Configure retail pricing, stock, and expiry notification trigger.</p>
          </div>
          <button id="modal-btn-close" class="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>

        <!-- Form -->
        <form id="product-form" class="mt-4 space-y-4">
          <!-- Name -->
          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1">Product Name *</label>
            <input type="text" id="prod-name" required value="${product ? product.name : ''}"
              class="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="e.g. Organic Almond Milk 1L" />
          </div>

          <!-- Category & SKU -->
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">Category</label>
              <select id="prod-category" class="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500">
                ${['Buckets', 'Meals', 'Sides', 'Sauces', 'Drinks', 'General'].map(cat => `
                  <option value="${cat}" ${product && product.category === cat ? 'selected' : ''}>${cat}</option>
                `).join('')}
              </select>
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">SKU Code</label>
              <input type="text" id="prod-sku" value="${product ? product.sku : `FC-${Math.floor(100 + Math.random() * 900)}`}"
                class="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono" />
            </div>
          </div>

          <!-- Cost & Selling Price -->
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">Cost Price (EGP)</label>
              <input type="number" step="0.5" min="0" id="prod-cost" required value="${product ? (product.costPrice || 0) : '60'}"
                class="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">Retail Selling Price (EGP) *</label>
              <input type="number" step="0.5" min="1" id="prod-selling" required value="${product ? product.sellingPrice : '95'}"
                class="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold text-slate-900" />
            </div>
          </div>

          <!-- Stock & Expiry Date -->
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">Initial Stock Units *</label>
              <input type="number" min="0" id="prod-stock" required value="${product ? product.stock : '20'}"
                class="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold" />
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">Expiry Date (YYYY-MM-DD) *</label>
              <input type="date" id="prod-expiry" required value="${product ? product.expiryDate : '2026-11-17'}"
                class="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
          </div>

          <!-- Alert Days Threshold -->
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">Alert Trigger Window</label>
              <select id="prod-alert-days" class="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500">
                <option value="1" ${product && product.alertDaysBefore === 1 ? 'selected' : ''}>1 Day Prior</option>
                <option value="2" ${!product || product.alertDaysBefore === 2 ? 'selected' : ''}>2 Days Prior (Default)</option>
                <option value="3" ${product && product.alertDaysBefore === 3 ? 'selected' : ''}>3 Days Prior</option>
                <option value="7" ${product && product.alertDaysBefore === 7 ? 'selected' : ''}>7 Days Prior</option>
              </select>
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">Barcode / UPC</label>
              <input type="text" id="prod-barcode" value="${product ? (product.barcode || '') : Math.floor(1000000000 + Math.random() * 9000000000)}"
                class="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono text-xs" />
            </div>
          </div>

          <!-- Image Selection Presets -->
          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1">Product Photo URL or Preset</label>
            <input type="url" id="prod-image" value="${product ? product.image : PRESET_IMAGES[0].url}"
              class="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 mb-2" />
            <div class="flex items-center gap-1.5 overflow-x-auto pb-1">
              ${PRESET_IMAGES.map(preset => `
                <button type="button" class="btn-preset-img px-2 py-1 bg-slate-100 hover:bg-emerald-100 hover:text-emerald-800 text-[11px] font-semibold rounded-lg text-slate-600 shrink-0" data-url="${preset.url}">
                  ${preset.label}
                </button>
              `).join('')}
            </div>
          </div>

          <!-- Actions -->
          <div class="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
            <button type="button" id="modal-btn-cancel" class="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-all">
              Cancel
            </button>
            <button type="submit" id="modal-btn-submit" class="px-5 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-500/20 transition-all flex items-center gap-1.5">
              <span>${isEdit ? 'Save Changes' : 'Add to Inventory'}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  `;

  const closeBtn = modalContainer.querySelector('#modal-btn-close');
  const cancelBtn = modalContainer.querySelector('#modal-btn-cancel');
  const form = modalContainer.querySelector('#product-form');
  const imageInput = modalContainer.querySelector('#prod-image');

  function closeModal() {
    modalContainer.innerHTML = '';
  }

  closeBtn.addEventListener('click', closeModal);
  cancelBtn.addEventListener('click', closeModal);

  // Preset image pickers
  const presetBtns = modalContainer.querySelectorAll('.btn-preset-img');
  presetBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      imageInput.value = btn.getAttribute('data-url');
    });
  });

  // Submit Handler
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const payload = {
      name: modalContainer.querySelector('#prod-name').value,
      category: modalContainer.querySelector('#prod-category').value,
      sku: modalContainer.querySelector('#prod-sku').value,
      costPrice: parseFloat(modalContainer.querySelector('#prod-cost').value) || 0,
      sellingPrice: parseFloat(modalContainer.querySelector('#prod-selling').value) || 0,
      stock: parseInt(modalContainer.querySelector('#prod-stock').value, 10) || 0,
      expiryDate: modalContainer.querySelector('#prod-expiry').value,
      alertDaysBefore: parseInt(modalContainer.querySelector('#prod-alert-days').value, 10) || 2,
      barcode: modalContainer.querySelector('#prod-barcode').value,
      image: imageInput.value
    };

    try {
      if (isEdit) {
        await api.updateProduct(product.id, payload);
        showToast(`"${payload.name}" updated successfully.`, 'success');
      } else {
        await api.addProduct(payload);
        showToast(`"${payload.name}" added to inventory.`, 'success');
      }

      closeModal();
      window.dispatchEvent(new CustomEvent('wastewise:refresh'));
    } catch (err) {
      showToast(err.message, 'danger');
    }
  });
}

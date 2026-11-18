// Add / Edit Product Modal Component
// Multi-Stage Expiry & Reminder Engine with Dual-Date Inputs & Live Preview
import { api } from '../api.js';
import { showToast } from './toast.js';
import { t, isRTL } from '../utils/i18n.js';
import { ANCHOR_DATE, normalizeUtcMidnight } from '../utils/formatters.js';

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

  const initialProdDate = product ? (product.productionDate || product.production_date || ANCHOR_DATE) : ANCHOR_DATE;
  const initialExpDate = product ? (product.expiryDate || product.expiry_date || '2026-11-22') : '2026-11-22';

  modalContainer.innerHTML = `
    <div class="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 modal-backdrop animate-in fade-in duration-200">
      <div class="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 ww-card-shadow border border-slate-200 dark:border-slate-800 relative animate-in zoom-in-95 duration-200 transition-colors">
        
        <!-- Header -->
        <div class="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 class="text-lg font-bold text-slate-900 dark:text-white">${isEdit ? t('editInventoryItem') : t('addNewInventoryItem')}</h3>
            <p class="text-xs text-slate-400 dark:text-slate-500">${t('productModalSub')}</p>
          </div>
          <button id="modal-btn-close" class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>

        <!-- Form -->
        <form id="product-form" class="mt-4 space-y-4">
          <!-- Name -->
          <div>
            <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">${t('productName')} *</label>
            <input type="text" id="prod-name" required value="${product ? product.name : ''}"
              class="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-slate-100"
              placeholder="${t('productNamePlaceholder')}" />
          </div>

          <!-- Category & SKU -->
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">${t('thCategory')}</label>
              <select id="prod-category" class="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-slate-100">
                ${[
                  { id: 'Buckets', label: t('catBuckets') },
                  { id: 'Meals', label: t('catMeals') },
                  { id: 'Sides', label: t('catSides') },
                  { id: 'Sauces', label: t('catSauces') },
                  { id: 'Drinks', label: t('catDrinks') },
                  { id: 'General', label: 'General' }
                ].map(cat => `
                  <option value="${cat.id}" ${product && product.category === cat.id ? 'selected' : ''}>${cat.label}</option>
                `).join('')}
              </select>
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">${t('skuCode')}</label>
              <input type="text" id="prod-sku" value="${product ? product.sku : `FC-${Math.floor(100 + Math.random() * 900)}`}"
                class="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono text-slate-900 dark:text-slate-100" />
            </div>
          </div>

          <!-- Cost & Selling Price -->
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">${t('costPrice')}</label>
              <input type="number" step="0.5" min="0" id="prod-cost" required value="${product ? (product.costPrice || 0) : '60'}"
                class="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-slate-100" />
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">${t('retailPrice')} *</label>
              <input type="number" step="0.5" min="1" id="prod-selling" required value="${product ? product.sellingPrice : '95'}"
                class="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold text-slate-900 dark:text-white" />
            </div>
          </div>

          <!-- Initial Stock Units -->
          <div>
            <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">${t('initialStock')} *</label>
            <input type="number" min="0" id="prod-stock" required value="${product ? product.stock : '20'}"
              class="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold text-slate-900 dark:text-slate-100" />
          </div>

          <!-- Dual Date Inputs: Production / Batch Date & Expiry Date -->
          <div class="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-3">
            <div class="flex items-center justify-between">
              <label class="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <svg class="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                <span>${t('dualDateSchedule')}</span>
              </label>
              <span class="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/80 px-2 py-0.5 rounded-full">
                AI Expiry Engine
              </span>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">${t('productionDate')} *</label>
                <input type="date" id="prod-production-date" required value="${initialProdDate}"
                  class="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-slate-100 font-medium" />
              </div>
              <div>
                <label class="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">${t('expiryDate')} *</label>
                <input type="date" id="prod-expiry-date" required value="${initialExpDate}"
                  class="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-slate-100 font-medium" />
              </div>
            </div>

            <!-- Live Shelf-Life Preview Badge -->
            <div id="shelf-life-preview" class="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs transition-all space-y-1">
              <!-- Dynamically populated via updateShelfLifePreview() -->
            </div>
          </div>

          <!-- Alert Days Threshold & Barcode -->
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">${t('alertWindow')}</label>
              <select id="prod-alert-days" class="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-slate-100">
                <option value="1" ${product && product.alertDaysBefore === 1 ? 'selected' : ''}>${t('dayPrior1')}</option>
                <option value="2" ${!product || product.alertDaysBefore === 2 ? 'selected' : ''}>${t('dayPrior2')}</option>
                <option value="3" ${product && product.alertDaysBefore === 3 ? 'selected' : ''}>${t('dayPrior3')}</option>
                <option value="7" ${product && product.alertDaysBefore === 7 ? 'selected' : ''}>${t('dayPrior7')}</option>
              </select>
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">${t('barcodeUpc')}</label>
              <input type="text" id="prod-barcode" value="${product ? (product.barcode || '') : Math.floor(1000000000 + Math.random() * 9000000000)}"
                class="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono text-xs text-slate-900 dark:text-slate-100" />
            </div>
          </div>

          <!-- Image Selection Presets -->
          <div>
            <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">${t('productPhotoUrl')}</label>
            <input type="url" id="prod-image" value="${product ? product.image : PRESET_IMAGES[0].url}"
              class="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 mb-2 text-slate-900 dark:text-slate-100" />
            <div class="flex items-center gap-1.5 overflow-x-auto pb-1">
              ${PRESET_IMAGES.map(preset => `
                <button type="button" class="btn-preset-img px-2 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-emerald-100 dark:hover:bg-emerald-950/60 hover:text-emerald-800 dark:hover:text-emerald-300 text-[11px] font-semibold rounded-lg text-slate-600 dark:text-slate-300 shrink-0 cursor-pointer" data-url="${preset.url}">
                  ${preset.label}
                </button>
              `).join('')}
            </div>
          </div>

          <!-- Actions -->
          <div class="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
            <button type="button" id="modal-btn-cancel" class="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all cursor-pointer">
              ${t('cancel')}
            </button>
            <button type="submit" id="modal-btn-submit" class="px-5 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-500/20 transition-all flex items-center gap-1.5 cursor-pointer">
              <span>${isEdit ? t('saveChanges') : t('addToInventory')}</span>
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
  const prodDateInput = modalContainer.querySelector('#prod-production-date');
  const expDateInput = modalContainer.querySelector('#prod-expiry-date');
  const previewBox = modalContainer.querySelector('#shelf-life-preview');
  const submitBtn = modalContainer.querySelector('#modal-btn-submit');

  function updateShelfLifePreview() {
    if (!prodDateInput || !expDateInput || !previewBox) return;

    const prodVal = prodDateInput.value;
    const expVal = expDateInput.value;

    if (!prodVal || !expVal) {
      previewBox.innerHTML = `<span class="text-slate-400">Please choose both dates.</span>`;
      return;
    }

    const prodMidnight = normalizeUtcMidnight(prodVal);
    const expMidnight = normalizeUtcMidnight(expVal);

    if (!prodMidnight || !expMidnight) {
      previewBox.innerHTML = `<span class="text-slate-400">Invalid date format.</span>`;
      return;
    }

    const diffDays = Math.round((expMidnight.getTime() - prodMidnight.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays <= 0) {
      previewBox.className = 'p-2.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-300 dark:border-red-800 text-xs text-red-600 dark:text-red-300 font-bold';
      previewBox.innerHTML = `⚠️ ${t('expiryMustBeAfterProduction')}`;
      if (submitBtn) submitBtn.disabled = true;
      return;
    }

    if (submitBtn) submitBtn.disabled = false;

    const halfLifeDay = Math.floor(diffDays / 2);
    previewBox.className = 'p-2.5 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs transition-all space-y-1.5';
    previewBox.innerHTML = `
      <div class="flex items-center justify-between text-slate-800 dark:text-slate-200 font-bold">
        <span>🗓️ ${t('totalShelfLife')}: <span class="text-emerald-600 dark:text-emerald-400">${diffDays} Days</span></span>
        <span class="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 font-bold">Healthy Range</span>
      </div>
      <div class="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-emerald-100 dark:border-emerald-900/40">
        <div class="flex items-center gap-1.5 text-amber-700 dark:text-amber-300 font-medium">
          <span>⚡</span>
          <span>50% Half-Life on Day ${halfLifeDay}</span>
        </div>
        <div class="flex items-center gap-1.5 text-red-700 dark:text-red-300 font-medium">
          <span>🔥</span>
          <span>Final 48h Escalation (3x / day)</span>
        </div>
      </div>
    `;
  }

  prodDateInput?.addEventListener('input', updateShelfLifePreview);
  prodDateInput?.addEventListener('change', updateShelfLifePreview);
  expDateInput?.addEventListener('input', updateShelfLifePreview);
  expDateInput?.addEventListener('change', updateShelfLifePreview);
  updateShelfLifePreview();

  function closeModal() {
    modalContainer.innerHTML = '';
  }

  closeBtn?.addEventListener('click', closeModal);
  cancelBtn?.addEventListener('click', closeModal);

  // Preset image pickers
  const presetBtns = modalContainer.querySelectorAll('.btn-preset-img');
  presetBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      imageInput.value = btn.getAttribute('data-url');
    });
  });

  // Submit Handler
  form?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const productionDate = prodDateInput.value;
    const expiryDate = expDateInput.value;

    if (new Date(expiryDate).getTime() <= new Date(productionDate).getTime()) {
      showToast(t('expiryMustBeAfterProduction'), 'warning');
      return;
    }

    const payload = {
      name: modalContainer.querySelector('#prod-name').value,
      category: modalContainer.querySelector('#prod-category').value,
      sku: modalContainer.querySelector('#prod-sku').value,
      costPrice: parseFloat(modalContainer.querySelector('#prod-cost').value) || 0,
      sellingPrice: parseFloat(modalContainer.querySelector('#prod-selling').value) || 0,
      stock: parseInt(modalContainer.querySelector('#prod-stock').value, 10) || 0,
      productionDate,
      production_date: productionDate,
      expiryDate,
      expiry_date: expiryDate,
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

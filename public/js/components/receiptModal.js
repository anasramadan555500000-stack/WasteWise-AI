// Receipt Modal Component for POS Checkouts
import { store } from '../state.js';
import { formatCurrency, formatDateTime } from '../utils/formatters.js';
import { t, isRTL } from '../utils/i18n.js';

export function renderReceiptModal(transaction) {
  if (!transaction) return;

  const { settings, user } = store.getState();
  const currentSettings = settings || {};
  const restaurantName = currentSettings.restaurantName || 'WasteWise AI • Fried Chicken Express';
  const branchName = currentSettings.branchName || 'Main Branch - Downtown Cairo';
  const address = currentSettings.address || '15 El-Tahrir Square, Downtown, Cairo, Egypt';
  const phone = currentSettings.phone || '+20 100 123 4567';
  const receiptFooter = currentSettings.receiptFooter || 'Thank you for dining with us! Hot & Crispy Guarantee.';
  const taxPct = ((currentSettings.taxRate !== undefined ? currentSettings.taxRate : 0.08) * 100).toFixed(0);
  const currency = currentSettings.currency || 'EGP';

  const modalId = 'receipt-modal-container';
  let modalContainer = document.getElementById(modalId);

  if (!modalContainer) {
    modalContainer = document.createElement('div');
    modalContainer.id = modalId;
    document.body.appendChild(modalContainer);
  }

  modalContainer.innerHTML = `
    <div class="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 modal-backdrop animate-in fade-in duration-200">
      <div class="bg-white dark:bg-slate-900 rounded-3xl max-w-sm w-full p-6 ww-card-shadow border border-slate-200 dark:border-slate-800 relative animate-in zoom-in-95 duration-200 transition-colors">
        
        <!-- Printable Area (White thermal ticket appearance) -->
        <div id="printable-receipt" class="space-y-4 font-mono text-slate-800 bg-white p-4 rounded-2xl border border-slate-200 shadow-inner">
          
          <!-- Store Header & Official Logo (Enlarged for Crisp Thermal Receipts) -->
          <div class="text-center pb-3 border-b-2 border-dashed border-slate-200">
            <img src="/logo.png" alt="WasteWise AI" class="w-20 h-20 mx-auto mb-2 object-contain grayscale rounded-2xl bg-slate-950 p-1.5 border border-slate-300 shadow-sm hover:grayscale-0 transition-all" onerror="this.onerror=null;this.src='/images/logo.png'" />
            <div class="text-xs uppercase tracking-widest text-emerald-600 font-extrabold">${restaurantName}</div>
            <div class="text-[11px] font-bold text-slate-700 mt-0.5">${branchName}</div>
            <div class="text-[10px] text-slate-500">${address}</div>
            <div class="text-[10px] text-slate-500">Tel: ${phone}</div>
            <div class="text-[10px] text-slate-400 mt-0.5">Terminal: ${user?.stationTitle || 'Station #01'}</div>
          </div>

          <!-- Metadata -->
          <div class="text-xs space-y-1 pb-2 border-b border-dashed border-slate-200">
            <div class="flex justify-between">
              <span class="text-slate-500">${t('invoice')}:</span>
              <span class="font-bold text-slate-900">${transaction.invoiceNumber}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-500">${t('date')}:</span>
              <span>${formatDateTime(transaction.timestamp)}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-500">${t('cashier')}:</span>
              <span>${transaction.cashierName}</span>
            </div>
          </div>

          <!-- Itemized Table -->
          <div class="space-y-1.5 py-1 text-xs">
            <div class="flex justify-between text-[11px] text-slate-400 font-bold border-b border-slate-100 pb-1">
              <span>${t('itemDescription')}</span>
              <span>${t('subtotal')}</span>
            </div>
            ${(transaction.items || []).map(item => `
              <div class="flex justify-between items-start">
                <div class="max-w-[70%]">
                  <div class="font-bold text-slate-900 leading-tight">${item.name}</div>
                  <div class="text-[10px] text-slate-400">${item.quantity} x ${formatCurrency(item.unitPrice, currency)}</div>
                </div>
                <div class="font-bold text-slate-900">${formatCurrency(item.total, currency)}</div>
              </div>
            `).join('')}
          </div>

          <!-- Totals -->
          <div class="pt-2 border-t-2 border-dashed border-slate-200 text-xs space-y-1">
            <div class="flex justify-between text-slate-600">
              <span>${t('subtotal')}:</span>
              <span>${formatCurrency(transaction.subtotal, currency)}</span>
            </div>
            <div class="flex justify-between text-slate-600">
              <span>${t('salesTax')} (${taxPct}%):</span>
              <span>${formatCurrency(transaction.tax, currency)}</span>
            </div>
            <div class="flex justify-between text-sm font-extrabold text-slate-900 pt-1 border-t border-slate-200">
              <span>${t('totalPaid')}:</span>
              <span class="text-emerald-600">${formatCurrency(transaction.total, currency)}</span>
            </div>
            <div class="flex justify-between text-[11px] text-slate-500 pt-1">
              <span>${t('paymentTender')} (${(transaction.paymentMethod || 'cash').toUpperCase()}):</span>
              <span>${formatCurrency(transaction.amountTendered, currency)}</span>
            </div>
            <div class="flex justify-between text-xs font-bold text-slate-900">
              <span>${t('changeReturned')}:</span>
              <span>${formatCurrency(transaction.changeDue, currency)}</span>
            </div>
          </div>

          <!-- Simulated Barcode Graphic & Footer -->
          <div class="text-center pt-3 pb-1 border-t border-dashed border-slate-200 space-y-1">
            <div class="h-10 mx-auto flex items-center justify-center gap-1 overflow-hidden px-4">
              ${Array.from({ length: 28 }).map((_, i) => `
                <div class="h-8 ${i % 3 === 0 ? 'w-1 bg-slate-900' : (i % 2 === 0 ? 'w-0.5 bg-slate-700' : 'w-1.5 bg-slate-800')}"></div>
              `).join('')}
            </div>
            <div class="text-[10px] tracking-widest text-slate-400 font-mono">*${transaction.invoiceNumber}*</div>
            <div class="text-[10px] text-emerald-600 font-bold mt-1.5 leading-tight">${receiptFooter}</div>
          </div>

        </div>

        <!-- Print Actions -->
        <div class="mt-6 flex items-center gap-2">
          <button id="btn-print-receipt" class="flex-1 py-2.5 px-3 bg-slate-900 hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 active:scale-[0.99] text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-sm cursor-pointer">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/></svg>
            <span>${t('printReceipt')}</span>
          </button>
          <button id="btn-close-receipt" class="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl transition-all cursor-pointer">
            ${t('done')}
          </button>
        </div>

      </div>
    </div>
  `;

  const closeBtn = modalContainer.querySelector('#btn-close-receipt');
  const printBtn = modalContainer.querySelector('#btn-print-receipt');

  function closeModal() {
    modalContainer.innerHTML = '';
  }

  closeBtn?.addEventListener('click', closeModal);

  printBtn?.addEventListener('click', () => {
    window.print();
  });
}

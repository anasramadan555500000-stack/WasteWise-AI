// Receipt Modal Component for POS Checkouts
import { formatCurrency, formatDateTime } from '../utils/formatters.js';

export function renderReceiptModal(transaction) {
  if (!transaction) return;

  const modalId = 'receipt-modal-container';
  let modalContainer = document.getElementById(modalId);

  if (!modalContainer) {
    modalContainer = document.createElement('div');
    modalContainer.id = modalId;
    document.body.appendChild(modalContainer);
  }

  modalContainer.innerHTML = `
    <div class="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 modal-backdrop">
      <div class="bg-white rounded-3xl max-w-sm w-full p-6 ww-card-shadow border border-slate-200 relative animate-in fade-in zoom-in-95 duration-200">
        
        <!-- Printable Area -->
        <div id="printable-receipt" class="space-y-4 font-mono text-slate-800">
          
          <!-- Store Header & Official Logo -->
          <div class="text-center pb-3 border-b-2 border-dashed border-slate-200">
            <img src="/logo.png" alt="WasteWise AI" class="w-16 h-16 mx-auto mb-2 object-contain grayscale rounded-xl bg-slate-950 p-1 border border-slate-300 shadow-sm" onerror="this.onerror=null;this.src='/images/logo.png'" />
            <div class="text-xs uppercase tracking-widest text-emerald-600 font-extrabold">WasteWise AI • Fried Chicken Express</div>
            <div class="text-[11px] text-slate-400 mt-0.5">Fresh Fried Chicken & Live Expiry Management</div>
            <div class="text-[10px] text-slate-400">Terminal Station #01 • Cairo Branch</div>
          </div>

          <!-- Metadata -->
          <div class="text-xs space-y-1 pb-2 border-b border-dashed border-slate-200">
            <div class="flex justify-between">
              <span class="text-slate-500">Invoice:</span>
              <span class="font-bold text-slate-900">${transaction.invoiceNumber}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-500">Date:</span>
              <span>${formatDateTime(transaction.timestamp)}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-500">Cashier:</span>
              <span>${transaction.cashierName}</span>
            </div>
          </div>

          <!-- Itemized Table -->
          <div class="space-y-1.5 py-1 text-xs">
            <div class="flex justify-between text-[11px] text-slate-400 font-bold border-b border-slate-100 pb-1">
              <span>Item Description</span>
              <span>Total</span>
            </div>
            ${(transaction.items || []).map(item => `
              <div class="flex justify-between items-start">
                <div class="max-w-[70%]">
                  <div class="font-bold text-slate-900 leading-tight">${item.name}</div>
                  <div class="text-[10px] text-slate-400">${item.quantity} x ${formatCurrency(item.unitPrice)}</div>
                </div>
                <div class="font-bold text-slate-900">${formatCurrency(item.total)}</div>
              </div>
            `).join('')}
          </div>

          <!-- Totals -->
          <div class="pt-2 border-t-2 border-dashed border-slate-200 text-xs space-y-1">
            <div class="flex justify-between text-slate-600">
              <span>Subtotal:</span>
              <span>${formatCurrency(transaction.subtotal)}</span>
            </div>
            <div class="flex justify-between text-slate-600">
              <span>Tax (8%):</span>
              <span>${formatCurrency(transaction.tax)}</span>
            </div>
            <div class="flex justify-between text-sm font-extrabold text-slate-900 pt-1 border-t border-slate-200">
              <span>TOTAL PAID:</span>
              <span class="text-emerald-600">${formatCurrency(transaction.total)}</span>
            </div>
            <div class="flex justify-between text-[11px] text-slate-500 pt-1">
              <span>Payment Tender (${transaction.paymentMethod}):</span>
              <span>${formatCurrency(transaction.amountTendered)}</span>
            </div>
            <div class="flex justify-between text-xs font-bold text-slate-900">
              <span>Change Returned:</span>
              <span>${formatCurrency(transaction.changeDue)}</span>
            </div>
          </div>

          <!-- Simulated Barcode Graphic -->
          <div class="text-center pt-3 pb-1 border-t border-dashed border-slate-200 space-y-1">
            <div class="h-10 mx-auto flex items-center justify-center gap-1 overflow-hidden px-4">
              ${Array.from({ length: 28 }).map((_, i) => `
                <div class="h-8 ${i % 3 === 0 ? 'w-1 bg-slate-900' : (i % 2 === 0 ? 'w-0.5 bg-slate-700' : 'w-1.5 bg-slate-800')}"></div>
              `).join('')}
            </div>
            <div class="text-[10px] tracking-widest text-slate-400 font-mono">*${transaction.invoiceNumber}*</div>
            <div class="text-[10px] text-emerald-600 font-bold mt-1">Thank you for dining with us! Hot & Crispy Guarantee.</div>
          </div>

        </div>

        <!-- Action Buttons (No-print) -->
        <div class="no-print mt-6 flex items-center gap-2">
          <button id="btn-print-receipt" class="flex-1 py-2.5 px-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-1.5">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/></svg>
            <span>Print Receipt</span>
          </button>
          <button id="btn-close-receipt" class="flex-1 py-2.5 px-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-500/20 transition-all flex items-center justify-center gap-1.5">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
            <span>New Order</span>
          </button>
        </div>

      </div>
    </div>
  `;

  function closeModal() {
    modalContainer.innerHTML = '';
  }

  const printBtn = modalContainer.querySelector('#btn-print-receipt');
  if (printBtn) {
    printBtn.addEventListener('click', () => {
      window.print();
    });
  }

  const closeBtn = modalContainer.querySelector('#btn-close-receipt');
  if (closeBtn) {
    closeBtn.addEventListener('click', closeModal);
  }
}

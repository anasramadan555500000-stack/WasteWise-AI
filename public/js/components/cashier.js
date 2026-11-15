// Cashier POS Checkout Screen Component
import { store } from '../state.js';
import { api } from '../api.js';
import { formatCurrency, calculateExpiry } from '../utils/formatters.js';
import { showToast } from './toast.js';

const FALLBACK_IMG = 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=600&auto=format&fit=crop&q=80';

export function renderCashier(container) {
  const state = store.getState();
  const { products, filteredProducts, cart, filters } = state;
  const cartSummary = store.getCartSummary();

  container.innerHTML = `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        <!-- Left: Product Catalog Grid (8 Cols) -->
        <div class="lg:col-span-7 xl:col-span-8 space-y-4">
          
          <!-- Search & Category Filters Bar -->
          <div class="bg-white p-4 rounded-2xl border border-slate-200 ww-card-shadow space-y-3">
            <!-- Search Bar -->
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
              </div>
              <input type="text" id="pos-search-input" value="${filters.search}"
                placeholder="Search food by name, SKU, or scan barcode (Press Enter)..."
                class="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all" />
            </div>

            <!-- Category Filter Pills -->
            <div class="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              ${['All', 'Buckets', 'Meals', 'Sides', 'Sauces', 'Drinks'].map(cat => `
                <button class="pos-category-btn px-3 py-1.5 text-xs font-semibold rounded-xl whitespace-nowrap transition-all ${filters.category === cat ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/25' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'}" data-category="${cat}">
                  ${cat}
                </button>
              `).join('')}
            </div>
          </div>

          <!-- Product Grid -->
          <div class="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
            ${filteredProducts.length === 0 ? `
              <div class="col-span-full py-16 text-center text-slate-400 bg-white rounded-2xl border border-slate-200">
                <svg class="w-12 h-12 mx-auto mb-2 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/></svg>
                <p class="font-bold text-slate-700">No items found</p>
                <p class="text-xs text-slate-400">Try clearing the search filter.</p>
              </div>
            ` : filteredProducts.map(p => {
              const expiry = calculateExpiry(p.expiryDate, p.alertDaysBefore);
              const isPulse = expiry.isPulse;
              const isOutOfStock = p.stock <= 0;
              const effectivePrice = p.discountPrice !== null ? p.discountPrice : p.sellingPrice;

              return `
                <div class="pos-product-card bg-white rounded-2xl border border-slate-200 p-3 ww-card-shadow ww-card-shadow-hover flex flex-col justify-between transition-all cursor-pointer relative overflow-hidden group ${isPulse ? 'pulse-warning bg-amber-50/20' : ''} ${isOutOfStock ? 'opacity-50 pointer-events-none' : ''}"
                  data-id="${p.id}">
                  
                  <!-- Top Image & Expiry Tag -->
                  <div class="relative w-full aspect-square rounded-xl overflow-hidden bg-slate-100 mb-2.5">
                    <img src="${p.image || FALLBACK_IMG}" alt="${p.name}"
                      class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onerror="this.onerror=null;this.src='${FALLBACK_IMG}'" />
                    
                    <!-- Expiry Badge -->
                    <div class="absolute top-2 left-2">
                      <span class="text-[10px] font-bold px-2 py-0.5 rounded-full ${expiry.badgeClass}">
                        ${expiry.label}
                      </span>
                    </div>

                    <!-- Discount Badge -->
                    ${p.discountPrice ? `
                      <div class="absolute top-2 right-2">
                        <span class="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-500 text-white shadow-sm">
                          SALE
                        </span>
                      </div>
                    ` : ''}
                  </div>

                  <!-- Name & Category -->
                  <div class="space-y-1">
                    <div class="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">${p.category}</div>
                    <div class="text-xs font-bold text-slate-900 line-clamp-1 leading-snug" title="${p.name}">${p.name}</div>
                  </div>

                  <!-- Price & Stock Foot -->
                  <div class="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <div class="text-sm font-extrabold text-slate-900">${formatCurrency(effectivePrice)}</div>
                      ${p.discountPrice ? `
                        <div class="text-[10px] text-slate-400 line-through">${formatCurrency(p.sellingPrice)}</div>
                      ` : ''}
                    </div>

                    <!-- Stock Counter Tag -->
                    <div class="text-right">
                      <span class="text-[11px] font-bold ${p.stock <= p.minStockThreshold ? 'text-red-500' : 'text-slate-600'}">
                        ${p.stock} left
                      </span>
                      <div class="text-[9px] text-slate-400 font-mono">${p.sku}</div>
                    </div>
                  </div>

                </div>
              `;
            }).join('')}
          </div>

        </div>

        <!-- Right: Active Invoice Bill Sidebar (4-5 Cols) -->
        <div class="lg:col-span-5 xl:col-span-4 sticky top-20">
          <div class="bg-white rounded-2xl border border-slate-200 ww-card-shadow p-5 space-y-4">
            
            <!-- Bill Header -->
            <div class="flex items-center justify-between pb-3 border-b border-slate-100">
              <div class="flex items-center gap-2">
                <div class="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
                </div>
                <div>
                  <h2 class="text-sm font-bold text-slate-900">Current Order Bill</h2>
                  <p class="text-[11px] text-slate-400">${cartSummary.totalItems} item${cartSummary.totalItems === 1 ? '' : 's'} in cart</p>
                </div>
              </div>

              ${cart.length > 0 ? `
                <button id="pos-btn-clear-cart" class="text-xs text-red-500 hover:text-red-700 font-semibold p-1 hover:bg-red-50 rounded-lg transition-colors">
                  Clear All
                </button>
              ` : ''}
            </div>

            <!-- Cart Items Container (with Micro-interaction 3: Slide-in 300ms + Scale Pop 1.02) -->
            <div class="space-y-2.5 max-h-72 overflow-y-auto pr-1">
              ${cart.length === 0 ? `
                <div class="py-12 text-center text-slate-400">
                  <svg class="w-10 h-10 mx-auto mb-2 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
                  <p class="text-xs font-semibold text-slate-600">Cart is empty</p>
                  <p class="text-[11px] text-slate-400 mt-0.5">Click any product or scan barcode to add.</p>
                </div>
              ` : cart.map(item => {
                const p = item.product;
                const price = p.discountPrice !== null ? p.discountPrice : p.sellingPrice;
                const itemTotal = Number((price * item.quantity).toFixed(2));

                return `
                  <div class="cart-item-row p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3 ${item.isNew ? 'cart-item-slide-in' : ''}">
                    <!-- Thumbnail & Info -->
                    <div class="flex items-center gap-2.5 min-w-0">
                      <img src="${p.image || FALLBACK_IMG}" alt="${p.name}" class="w-9 h-9 rounded-lg object-cover shrink-0 border border-slate-200" onerror="this.onerror=null;this.src='${FALLBACK_IMG}'" />
                      <div class="min-w-0">
                        <div class="text-xs font-bold text-slate-900 truncate">${p.name}</div>
                        <div class="text-[11px] text-slate-400 font-semibold">${formatCurrency(price)} each</div>
                      </div>
                    </div>

                    <!-- Quantity Controls -->
                    <div class="flex items-center gap-1.5 shrink-0">
                      <div class="flex items-center bg-white border border-slate-200 rounded-lg p-0.5">
                        <button class="cart-btn-decrement w-6 h-6 flex items-center justify-center text-slate-500 hover:text-slate-800 rounded hover:bg-slate-100 transition-colors" data-id="${p.id}">
                          -
                        </button>
                        <span class="w-7 text-center text-xs font-bold text-slate-900">${item.quantity}</span>
                        <button class="cart-btn-increment w-6 h-6 flex items-center justify-center text-slate-500 hover:text-slate-800 rounded hover:bg-slate-100 transition-colors" data-id="${p.id}">
                          +
                        </button>
                      </div>

                      <div class="w-16 text-right font-bold text-xs text-slate-900">
                        ${formatCurrency(itemTotal)}
                      </div>

                      <button class="cart-btn-remove text-slate-400 hover:text-red-500 p-1 rounded-lg hover:bg-red-50 transition-colors" data-id="${p.id}" title="Remove">
                        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                      </button>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>

            <!-- Financial Calculation Summary -->
            <div class="pt-3 border-t border-slate-100 space-y-2 text-xs">
              <div class="flex justify-between text-slate-500">
                <span>Subtotal:</span>
                <span class="font-semibold text-slate-800">${formatCurrency(cartSummary.subtotal)}</span>
              </div>
              <div class="flex justify-between text-slate-500">
                <span>Sales Tax (8%):</span>
                <span class="font-semibold text-slate-800">${formatCurrency(cartSummary.tax)}</span>
              </div>
              <div class="flex justify-between text-base font-extrabold text-slate-900 pt-2 border-t border-slate-200">
                <span>Total Amount Due:</span>
                <span class="text-emerald-600">${formatCurrency(cartSummary.total)}</span>
              </div>
            </div>

            <!-- Payment Tender Selection (Multiple Payment Methods) -->
            <div class="pt-2 border-t border-slate-100 space-y-3">
              <label class="block text-xs font-bold uppercase tracking-wider text-slate-400">Payment Method Options</label>
              <div class="grid grid-cols-3 gap-1.5">
                <button type="button" id="tender-cash-btn" class="py-2 px-2 text-xs font-bold rounded-xl border transition-all flex flex-col items-center justify-center gap-1 bg-emerald-50 border-emerald-500 text-emerald-800">
                  <svg class="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
                  <span>Cash</span>
                </button>
                <button type="button" id="tender-card-btn" class="py-2 px-2 text-xs font-bold rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-all flex flex-col items-center justify-center gap-1">
                  <svg class="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/></svg>
                  <span>Visa / Card</span>
                </button>
                <button type="button" id="tender-wallet-btn" class="py-2 px-2 text-xs font-bold rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-all flex flex-col items-center justify-center gap-1">
                  <svg class="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"/></svg>
                  <span>Wallet</span>
                </button>
              </div>

              <!-- Quick Cash Tender Shortcuts -->
              <div id="cash-tender-controls" class="space-y-2">
                <div class="flex items-center gap-2">
                  <span class="text-xs text-slate-500 font-medium shrink-0">Tendered (EGP):</span>
                  <input type="number" id="tender-amount-input" step="1" min="${cartSummary.total}" value="${cartSummary.total > 0 ? cartSummary.total : 0}"
                    class="w-full py-1.5 px-3 text-xs bg-slate-50 border border-slate-200 rounded-lg font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>
                
                <div class="grid grid-cols-4 gap-1.5">
                  <button type="button" class="btn-quick-cash py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-[11px] font-bold text-slate-700" data-val="${cartSummary.total}">
                    Exact
                  </button>
                  <button type="button" class="btn-quick-cash py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-[11px] font-bold text-slate-700" data-val="100">
                    100 EGP
                  </button>
                  <button type="button" class="btn-quick-cash py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-[11px] font-bold text-slate-700" data-val="200">
                    200 EGP
                  </button>
                  <button type="button" class="btn-quick-cash py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-[11px] font-bold text-slate-700" data-val="500">
                    500 EGP
                  </button>
                </div>

                <div class="flex justify-between items-center text-xs p-2 rounded-lg bg-slate-50 border border-slate-200">
                  <span class="text-slate-500">Change Due:</span>
                  <span id="pos-change-due" class="font-bold text-emerald-600 text-sm">0.00 EGP</span>
                </div>
              </div>

              <!-- Visa / Card Tender Controls -->
              <div id="card-tender-controls" class="hidden p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                <div class="flex items-center gap-2 text-indigo-700 font-semibold">
                  <span class="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
                  <span>POS Terminal Tap / EMV Chip Active</span>
                </div>
                <input type="text" id="card-reference-input" placeholder="Auth / Reference Code (e.g. VISA-8842)"
                  class="w-full py-1.5 px-3 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500" value="VISA-${Math.floor(1000 + Math.random() * 9000)}" />
              </div>

              <!-- Mobile Wallet Controls -->
              <div id="wallet-tender-controls" class="hidden p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                <div class="flex items-center gap-2 text-emerald-700 font-semibold">
                  <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>Vodafone Cash / InstaPay Transfer</span>
                </div>
                <input type="text" id="wallet-phone-input" placeholder="Wallet Phone / InstaPay Ref (e.g. 01023456789)"
                  class="w-full py-1.5 px-3 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500" value="01098765432" />
              </div>
            </div>

            <!-- Complete Order Action Button -->
            <button id="pos-btn-checkout" ${cart.length === 0 ? 'disabled' : ''}
              class="w-full py-3.5 px-4 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.99] text-white text-sm font-extrabold rounded-xl shadow-md shadow-emerald-500/25 transition-all flex items-center justify-center gap-2">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
              <span>Complete Order / Checkout</span>
            </button>

          </div>
        </div>

      </div>
    </div>
  `;

  // Internal payment state
  let selectedTender = 'cash';

  // Event Handlers
  // Product Card Click -> Add to Cart with Slide-in micro-interaction
  const productCards = container.querySelectorAll('.pos-product-card');
  productCards.forEach(card => {
    card.addEventListener('click', () => {
      const id = card.getAttribute('data-id');
      const product = products.find(p => p.id === id);
      if (product) {
        try {
          store.addToCart(product, 1);
          card.classList.add('scale-95');
          setTimeout(() => card.classList.remove('scale-95'), 120);
        } catch (err) {
          showToast(err.message, 'warning');
        }
      }
    });
  });

  // Quantity Controls
  const incButtons = container.querySelectorAll('.cart-btn-increment');
  incButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = btn.getAttribute('data-id');
      const item = cart.find(i => i.product.id === id);
      if (item) {
        try {
          store.updateCartQuantity(id, item.quantity + 1);
        } catch (err) {
          showToast(err.message, 'warning');
        }
      }
    });
  });

  const decButtons = container.querySelectorAll('.cart-btn-decrement');
  decButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = btn.getAttribute('data-id');
      const item = cart.find(i => i.product.id === id);
      if (item) {
        store.updateCartQuantity(id, item.quantity - 1);
      }
    });
  });

  const removeButtons = container.querySelectorAll('.cart-btn-remove');
  removeButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = btn.getAttribute('data-id');
      store.removeFromCart(id);
    });
  });

  const clearCartBtn = container.querySelector('#pos-btn-clear-cart');
  if (clearCartBtn) {
    clearCartBtn.addEventListener('click', () => {
      store.clearCart();
    });
  }

  // Category Filtering
  const catButtons = container.querySelectorAll('.pos-category-btn');
  catButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const cat = btn.getAttribute('data-category');
      store.setState({
        filters: { ...filters, category: cat }
      });
    });
  });

  // Search Input & Barcode Scanner handler on Enter key
  const searchInput = container.querySelector('#pos-search-input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      store.setState({
        filters: { ...filters, search: e.target.value }
      });
    });

    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        const val = e.target.value.trim().toLowerCase();
        if (!val) return;

        const match = products.find(p =>
          (p.barcode && p.barcode.toLowerCase() === val) ||
          (p.sku && p.sku.toLowerCase() === val) ||
          p.name.toLowerCase() === val
        );

        if (match) {
          try {
            store.addToCart(match, 1);
            showToast(`Scanned & added to cart: ${match.name}`, 'success');
            searchInput.value = '';
            store.setState({ filters: { ...filters, search: '' } });
          } catch (err) {
            showToast(err.message, 'warning');
          }
        } else {
          showToast(`No item matching barcode/SKU: "${val}".`, 'warning');
        }
      }
    });
  }

  // Payment Tender Buttons
  const cashBtn = container.querySelector('#tender-cash-btn');
  const cardBtn = container.querySelector('#tender-card-btn');
  const walletBtn = container.querySelector('#tender-wallet-btn');
  const cashControls = container.querySelector('#cash-tender-controls');
  const cardControls = container.querySelector('#card-tender-controls');
  const walletControls = container.querySelector('#wallet-tender-controls');
  const tenderInput = container.querySelector('#tender-amount-input');
  const changeDueEl = container.querySelector('#pos-change-due');

  function updateChangeCalculation() {
    if (!tenderInput || !changeDueEl) return;
    const tendered = Number(tenderInput.value) || 0;
    const change = Math.max(0, tendered - cartSummary.total);
    changeDueEl.textContent = formatCurrency(change);
  }

  function setTender(mode) {
    selectedTender = mode;
    const activeClass = 'py-2 px-2 text-xs font-bold rounded-xl border transition-all flex flex-col items-center justify-center gap-1 bg-emerald-50 border-emerald-500 text-emerald-800';
    const inactiveClass = 'py-2 px-2 text-xs font-bold rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-all flex flex-col items-center justify-center gap-1';

    if (cashBtn) cashBtn.className = mode === 'cash' ? activeClass : inactiveClass;
    if (cardBtn) cardBtn.className = mode === 'visa' || mode === 'card' ? activeClass : inactiveClass;
    if (walletBtn) walletBtn.className = mode === 'mobile_wallet' ? activeClass : inactiveClass;

    if (cashControls) cashControls.classList.toggle('hidden', mode !== 'cash');
    if (cardControls) cardControls.classList.toggle('hidden', mode !== 'visa' && mode !== 'card');
    if (walletControls) walletControls.classList.toggle('hidden', mode !== 'mobile_wallet');
  }

  if (cashBtn) cashBtn.addEventListener('click', () => setTender('cash'));
  if (cardBtn) cardBtn.addEventListener('click', () => setTender('visa'));
  if (walletBtn) walletBtn.addEventListener('click', () => setTender('mobile_wallet'));

  if (tenderInput) {
    tenderInput.addEventListener('input', updateChangeCalculation);
    updateChangeCalculation();
  }

  const quickCashBtns = container.querySelectorAll('.btn-quick-cash');
  quickCashBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const val = btn.getAttribute('data-val');
      if (tenderInput) {
        tenderInput.value = val;
        updateChangeCalculation();
      }
    });
  });

  // Complete Checkout Button -> Calls API to instantly deduct stock from DB
  const checkoutBtn = container.querySelector('#pos-btn-checkout');
  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', async () => {
      if (cart.length === 0) {
        showToast('Cart is empty. Add products before proceeding to checkout.', 'warning');
        return;
      }

      const tenderedAmount = (selectedTender === 'visa' || selectedTender === 'card' || selectedTender === 'mobile_wallet')
        ? cartSummary.total 
        : (Number(tenderInput?.value) || cartSummary.total);

      if (selectedTender === 'cash' && tenderedAmount < cartSummary.total) {
        showToast(`Amount tendered (${tenderedAmount.toFixed(2)} EGP) is less than total due (${cartSummary.total.toFixed(2)} EGP).`, 'warning');
        return;
      }

      // Prevent double checkout by immediately disabling button
      checkoutBtn.disabled = true;
      checkoutBtn.innerHTML = `
        <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
        <span>Authorizing Order & Deducting Stock...</span>
      `;

      try {
        const payload = {
          items: cart.map(item => ({
            productId: item.product.id,
            quantity: item.quantity
          })),
          paymentMethod: selectedTender,
          amountTendered: Number(tenderedAmount.toFixed(2))
        };

        const result = await api.checkout(payload);

        // Optimistic local stock decrement for instantaneous responsive feel
        const updatedLocalProducts = store.getState().products.map(p => {
          const cartItem = cart.find(ci => ci.product.id === p.id);
          if (cartItem) {
            return { ...p, stock: Math.max(0, p.stock - cartItem.quantity) };
          }
          return p;
        });

        // Clear cart and update products
        store.setState({
          cart: [],
          products: result.updatedProducts || updatedLocalProducts
        });

        showToast(`Order completed! Invoice ${result.transaction.invoiceNumber} recorded.`, 'success');

        // Silent background sync
        window.dispatchEvent(new CustomEvent('wastewise:refresh'));

        // Open Receipt Modal
        window.dispatchEvent(new CustomEvent('wastewise:openReceiptModal', {
          detail: { transaction: result.transaction }
        }));
      } catch (err) {
        showToast(err.message, 'danger');
        checkoutBtn.disabled = false;
        checkoutBtn.innerHTML = `
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
          <span>Complete Order / Checkout</span>
        `;
      }
    });
  }
}

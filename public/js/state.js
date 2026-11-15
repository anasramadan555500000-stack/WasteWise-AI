// Central Reactive State Store for WasteWise AI (Fried Chicken Edition)

const INITIAL_FALLBACK_PRODUCTS = [
  {
    id: 'prod_fc_101',
    sku: 'FC-101',
    name: 'Crispy Chicken Bucket (12 Pcs)',
    category: 'Buckets',
    costPrice: 160.00,
    sellingPrice: 250.00,
    discountPrice: null,
    stock: 45,
    minStockThreshold: 15,
    expiryDate: '2026-11-19', // 4 days from now -> Safe (Green)
    alertDaysBefore: 2,
    barcode: '622100100101',
    image: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=600&auto=format&fit=crop&q=80',
    description: '12 pieces of golden, ultra-crispy secret recipe fried chicken.'
  },
  {
    id: 'prod_fc_102',
    sku: 'FC-102',
    name: 'Spicy Fried Chicken Meal (3 Pcs)',
    category: 'Meals',
    costPrice: 60.00,
    sellingPrice: 95.00,
    discountPrice: null,
    stock: 120,
    minStockThreshold: 30,
    expiryDate: '2026-11-17', // 2 days from now -> Warning (Amber)
    alertDaysBefore: 2,
    barcode: '622100100102',
    image: 'https://images.unsplash.com/photo-1569058242253-92a9c755a0ec?w=600&auto=format&fit=crop&q=80',
    description: '3 pieces hot & spicy crispy fried chicken.'
  },
  {
    id: 'prod_fc_103',
    sku: 'FC-103',
    name: 'French Fries (Large)',
    category: 'Sides',
    costPrice: 18.00,
    sellingPrice: 35.00,
    discountPrice: null,
    stock: 200,
    minStockThreshold: 50,
    expiryDate: '2026-11-20', // 5 days from now -> Safe (Green)
    alertDaysBefore: 2,
    barcode: '622100100103',
    image: 'https://images.unsplash.com/photo-1576107232684-1279f3908594?w=600&auto=format&fit=crop&q=80',
    description: 'Extra-crispy golden cut salted French fries.'
  },
  {
    id: 'prod_fc_104',
    sku: 'FC-104',
    name: 'Garlic Coleslaw Salad',
    category: 'Sides',
    costPrice: 10.00,
    sellingPrice: 20.00,
    discountPrice: null,
    stock: 80,
    minStockThreshold: 20,
    expiryDate: '2026-11-16', // 1 day from now -> Critical Expiry (Red)
    alertDaysBefore: 2,
    barcode: '622100100104',
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&auto=format&fit=crop&q=80',
    description: 'Fresh shredded cabbage and carrots in creamy garlic mayonnaise.'
  },
  {
    id: 'prod_fc_105',
    sku: 'FC-105',
    name: 'Special Cheddar Sauce',
    category: 'Sauces',
    costPrice: 7.00,
    sellingPrice: 15.00,
    discountPrice: null,
    stock: 150,
    minStockThreshold: 35,
    expiryDate: '2026-11-25', // 10 days from now -> Safe (Green)
    alertDaysBefore: 2,
    barcode: '622100100105',
    image: 'https://images.unsplash.com/photo-1574894709920-11b28e7367e3?w=600&auto=format&fit=crop&q=80',
    description: 'Rich, melted sharp warm cheddar cheese dipping cup.'
  },
  {
    id: 'prod_fc_106',
    sku: 'FC-106',
    name: 'Soft Drink Can',
    category: 'Drinks',
    costPrice: 12.00,
    sellingPrice: 20.00,
    discountPrice: null,
    stock: 300,
    minStockThreshold: 60,
    expiryDate: '2027-01-14', // 60 days from now -> Safe (Green)
    alertDaysBefore: 2,
    barcode: '622100100106',
    image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=600&auto=format&fit=crop&q=80',
    description: 'Chilled refreshing fizzy soft drink can 330ml.'
  }
];

export function computeFallbackAnalytics(products = INITIAL_FALLBACK_PRODUCTS) {
  const refDate = new Date('2026-11-15');
  refDate.setHours(0, 0, 0, 0);

  let totalStockUnits = 0;
  let totalInventoryValue = 0;
  let expiredWasteLoss = 0;
  let atRiskWasteLoss = 0;
  let safeCount = 0;
  let expiringSoonCount = 0;
  let expiredCount = 0;

  const expiringProductsList = [];
  const aiMarkdownSuggestions = [];

  products.forEach(p => {
    const expDate = new Date(p.expiryDate);
    expDate.setHours(0, 0, 0, 0);
    const diffMs = expDate.getTime() - refDate.getTime();
    const daysUntilExpiry = Math.round(diffMs / (1000 * 60 * 60 * 24));
    const stock = Number(p.stock) || 0;
    const cost = Number(p.costPrice || (p.sellingPrice * 0.6)) || 0;
    const price = Number(p.discountPrice || p.sellingPrice) || 0;

    totalStockUnits += stock;
    totalInventoryValue += stock * cost;

    if (daysUntilExpiry <= 1) {
      expiredCount++;
      const loss = Number((stock * cost).toFixed(2));
      expiredWasteLoss += loss;

      aiMarkdownSuggestions.push({
        productId: p.id,
        productName: p.name,
        daysUntilExpiry,
        stock,
        originalPrice: p.sellingPrice,
        currentPrice: price,
        hasDiscount: !!p.discountPrice,
        suggestedDiscountPct: 50,
        suggestedPrice: Number((p.sellingPrice * 0.5).toFixed(2)),
        estimatedSalvageValue: Number((p.sellingPrice * 0.5 * stock).toFixed(2)),
        riskReduction: `Recover up to ${(p.sellingPrice * 0.5 * stock).toFixed(0)} EGP instead of losing ${loss} EGP`
      });
    } else if (daysUntilExpiry === 2) {
      expiringSoonCount++;
      const atRisk = Number((stock * cost).toFixed(2));
      atRiskWasteLoss += atRisk;

      expiringProductsList.push({
        id: p.id,
        name: p.name,
        category: p.category,
        stock,
        costPrice: cost,
        sellingPrice: p.sellingPrice,
        discountPrice: p.discountPrice,
        daysUntilExpiry,
        atRiskValue: atRisk,
        image: p.image
      });

      aiMarkdownSuggestions.push({
        productId: p.id,
        productName: p.name,
        daysUntilExpiry,
        stock,
        originalPrice: p.sellingPrice,
        currentPrice: price,
        hasDiscount: !!p.discountPrice,
        suggestedDiscountPct: 25,
        suggestedPrice: Number((p.sellingPrice * 0.75).toFixed(2)),
        estimatedSalvageValue: Number((p.sellingPrice * 0.75 * stock).toFixed(2)),
        riskReduction: `Recover up to ${(p.sellingPrice * 0.75 * stock).toFixed(0)} EGP instead of losing ${atRisk} EGP`
      });
    } else {
      safeCount++;
    }
  });

  const simulatedRevenue = 49120.00;
  const simulatedCogs = 29574.00;
  const netProfit = Number((simulatedRevenue - simulatedCogs).toFixed(2));

  return {
    financials: {
      totalRevenue: simulatedRevenue,
      totalCogs: simulatedCogs,
      netProfit,
      profitMarginPct: 39.8,
      totalInventoryValue: Number(totalInventoryValue.toFixed(2)),
      wasteLossEstimation: Number((expiredWasteLoss + atRiskWasteLoss).toFixed(2)),
      expiredWasteLoss: Number(expiredWasteLoss.toFixed(2)),
      atRiskWasteLoss: Number(atRiskWasteLoss.toFixed(2))
    },
    inventoryOverview: {
      totalProducts: products.length,
      totalStockUnits,
      safeCount,
      expiringSoonCount,
      expiredCount,
      totalAlerts: expiringSoonCount + expiredCount
    },
    expiringProducts: expiringProductsList,
    aiMarkdownSuggestions
  };
}

class StateStore {
  constructor() {
    let savedUser = null;
    try {
      savedUser = JSON.parse(localStorage.getItem('wastewise_user'));
    } catch (e) {}

    const initialProducts = INITIAL_FALLBACK_PRODUCTS;
    const initialAnalytics = computeFallbackAnalytics(initialProducts);

    this.state = {
      user: savedUser,
      currentView: savedUser ? (savedUser.role === 'admin' ? 'admin' : 'cashier') : 'auth',
      adminTab: 'inventory',
      products: initialProducts,
      filteredProducts: initialProducts,
      cart: [],
      analytics: initialAnalytics,
      users: [],
      transactions: [],
      filters: {
        category: 'All',
        status: 'all',
        search: ''
      },
      isLoading: false,
      activeModal: null
    };

    this.listeners = new Set();
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify(changedKeys = []) {
    this.listeners.forEach(fn => fn(this.state, changedKeys));
  }

  setState(partialState) {
    const changedKeys = Object.keys(partialState);
    this.state = { ...this.state, ...partialState };

    if (partialState.user !== undefined) {
      if (this.state.user) {
        localStorage.setItem('wastewise_user', JSON.stringify(this.state.user));
      } else {
        localStorage.removeItem('wastewise_user');
      }
    }

    if (partialState.products || partialState.filters) {
      this.computeFilteredProducts();
    }

    // Ensure analytics is never null to prevent stuck skeletons
    if (this.state.products && (!this.state.analytics || this.state.analytics.error)) {
      this.state.analytics = computeFallbackAnalytics(this.state.products);
    }

    this.notify(changedKeys);
  }

  getState() {
    return this.state;
  }

  computeFilteredProducts() {
    let list = [...this.state.products];
    const { category, status, search } = this.state.filters;

    if (category && category !== 'All') {
      list = list.filter(p => p.category.toLowerCase() === category.toLowerCase());
    }

    if (status && status !== 'all') {
      list = list.filter(p => p.status === status);
    }

    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(p => 
        p.name.toLowerCase().includes(q) ||
        (p.sku && p.sku.toLowerCase().includes(q)) ||
        (p.barcode && p.barcode.includes(q)) ||
        p.category.toLowerCase().includes(q)
      );
    }

    this.state.filteredProducts = list;
  }

  addToCart(product, quantity = 1) {
    const existingIndex = this.state.cart.findIndex(item => item.product.id === product.id);
    let updatedCart = [...this.state.cart];

    if (existingIndex > -1) {
      const currentQty = updatedCart[existingIndex].quantity;
      const newQty = currentQty + quantity;
      if (newQty > product.stock) {
        throw new Error(`Cannot add more than ${product.stock} units of ${product.name}.`);
      }
      updatedCart[existingIndex] = {
        ...updatedCart[existingIndex],
        quantity: newQty
      };
    } else {
      if (quantity > product.stock) {
        throw new Error(`Insufficient stock: Only ${product.stock} available.`);
      }
      updatedCart.push({
        id: `cart_${product.id}`,
        product,
        quantity,
        isNew: true
      });
    }

    this.setState({ cart: updatedCart });
  }

  updateCartQuantity(productId, newQty) {
    let updatedCart = [...this.state.cart];
    const index = updatedCart.findIndex(item => item.product.id === productId);
    if (index === -1) return;

    if (newQty <= 0) {
      this.removeFromCart(productId);
      return;
    }

    const product = updatedCart[index].product;
    if (newQty > product.stock) {
      throw new Error(`Only ${product.stock} units available.`);
    }

    updatedCart[index] = {
      ...updatedCart[index],
      quantity: newQty,
      isNew: false
    };

    this.setState({ cart: updatedCart });
  }

  removeFromCart(productId) {
    const updatedCart = this.state.cart.filter(item => item.product.id !== productId);
    this.setState({ cart: updatedCart });
  }

  clearCart() {
    this.setState({ cart: [] });
  }

  getCartSummary(taxRate = 0.08) {
    let subtotal = 0;
    let totalItems = 0;

    for (const item of this.state.cart) {
      const price = item.product.discountPrice !== null ? item.product.discountPrice : item.product.sellingPrice;
      subtotal += price * item.quantity;
      totalItems += item.quantity;
    }

    subtotal = Number(subtotal.toFixed(2));
    const tax = Number((subtotal * taxRate).toFixed(2));
    const total = Number((subtotal + tax).toFixed(2));

    return {
      subtotal,
      tax,
      total,
      totalItems
    };
  }
}

export const store = new StateStore();

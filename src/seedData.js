// Pre-hashed passwords for Admin@123 and Cashier@123 (salt rounds: 10)
const ADMIN_HASH = '$2b$10$L7OQIROITRnhAJ3L5VZz8e.2Jl3Ij7Y1aGXpxUmpB/vLYGEU39neu';
const CASHIER_HASH = '$2b$10$CgWiNuzSgenY/clcMvrnF.3oacqzVRBOZcPidow9fjZOH9fBi4BPi';

const defaultUsers = [
  {
    id: 'usr_admin',
    name: 'Tariq Mansour (General Manager)',
    email: 'admin@wastewise.com',
    passwordHash: ADMIN_HASH,
    role: 'admin',
    createdAt: '2026-01-10T08:00:00Z',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80'
  },
  {
    id: 'usr_cashier',
    name: 'Karim Zaki (POS Cashier)',
    email: 'cashier@wastewise.com',
    passwordHash: CASHIER_HASH,
    role: 'cashier',
    createdAt: '2026-03-01T07:45:00Z',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80'
  }
];

// Anchor date: 2026-11-15
// Fried Chicken Restaurant Menu & Inventory
const defaultProducts = [
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
    expiryDate: '2026-11-19', // 4 days left -> Safe (Green)
    alertDaysBefore: 2,
    barcode: '622100100101',
    image: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=600&auto=format&fit=crop&q=80',
    description: '12 pieces of golden, ultra-crispy marinated secret-recipe fried chicken with signature spices.'
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
    expiryDate: '2026-11-17', // 2 days left -> Warning (Amber, triggers expiration alert & pulse)
    alertDaysBefore: 2,
    barcode: '622100100102',
    image: 'https://images.unsplash.com/photo-1569058242253-92a9c755a0ec?w=600&auto=format&fit=crop&q=80',
    description: '3 pieces hot & spicy crispy fried chicken, served fresh with Cajun seasoned crust.'
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
    expiryDate: '2026-11-20', // 5 days left -> Safe (Green)
    alertDaysBefore: 2,
    barcode: '622100100103',
    image: 'https://images.unsplash.com/photo-1576107232684-1279f3908594?w=600&auto=format&fit=crop&q=80',
    description: 'Extra-crispy golden cut salted French fries, piping hot and freshly fried.'
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
    expiryDate: '2026-11-16', // 1 day left -> Critical Expiry (Red)
    alertDaysBefore: 2,
    barcode: '622100100104',
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&auto=format&fit=crop&q=80',
    description: 'Traditional freshly shredded cabbage and carrots in creamy garlic mayonnaise dressing.'
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
    expiryDate: '2026-11-25', // 10 days left -> Safe (Green)
    alertDaysBefore: 2,
    barcode: '622100100105',
    image: 'https://images.unsplash.com/photo-1574894709920-11b28e7367e3?w=600&auto=format&fit=crop&q=80',
    description: 'Rich, melted sharp warm cheddar cheese dipping cup with jalapeño hints.'
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
    expiryDate: '2027-01-14', // 60 days left -> Safe (Green)
    alertDaysBefore: 2,
    barcode: '622100100106',
    image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=600&auto=format&fit=crop&q=80',
    description: 'Chilled refreshing fizzy soft drink can 330ml, served ice cold.'
  }
];

const defaultTransactions = [
  {
    id: 'txn_fc_901',
    invoiceNumber: 'INV-2026-901',
    cashierId: 'usr_cashier',
    cashierName: 'Karim Zaki',
    timestamp: '2026-11-15T15:30:00Z',
    items: [
      { productId: 'prod_fc_101', name: 'Crispy Chicken Bucket (12 Pcs)', quantity: 1, unitPrice: 250.00, total: 250.00 },
      { productId: 'prod_fc_103', name: 'French Fries (Large)', quantity: 2, unitPrice: 35.00, total: 70.00 },
      { productId: 'prod_fc_106', name: 'Soft Drink Can', quantity: 2, unitPrice: 20.00, total: 40.00 }
    ],
    subtotal: 360.00,
    tax: 28.80,
    total: 388.80,
    paymentMethod: 'cash',
    amountTendered: 400.00,
    changeDue: 11.20
  },
  {
    id: 'txn_fc_900',
    invoiceNumber: 'INV-2026-900',
    cashierId: 'usr_cashier',
    cashierName: 'Karim Zaki',
    timestamp: '2026-11-15T13:10:00Z',
    items: [
      { productId: 'prod_fc_102', name: 'Spicy Fried Chicken Meal (3 Pcs)', quantity: 2, unitPrice: 95.00, total: 190.00 },
      { productId: 'prod_fc_104', name: 'Garlic Coleslaw Salad', quantity: 2, unitPrice: 20.00, total: 40.00 },
      { productId: 'prod_fc_105', name: 'Special Cheddar Sauce', quantity: 2, unitPrice: 15.00, total: 30.00 }
    ],
    subtotal: 260.00,
    tax: 20.80,
    total: 280.80,
    paymentMethod: 'card',
    amountTendered: 280.80,
    changeDue: 0.00
  }
];

const defaultSettings = {
  restaurantName: 'WasteWise AI • Fried Chicken Express',
  branchName: 'Main Branch - Downtown Cairo',
  address: '15 El-Tahrir Square, Downtown, Cairo, Egypt',
  phone: '+20 100 123 4567',
  receiptFooter: 'Thank you for choosing WasteWise AI! Quality fried chicken, zero food waste.',
  currency: 'EGP',
  taxRate: 0.08,
  enabledPaymentMethods: {
    cash: true,
    card: true,
    wallet: true
  },
  warningDaysBefore: 2,
  criticalDaysBefore: 1,
  defaultMinStockThreshold: 15,
  autoBlockExpiredCheckout: true
};

module.exports = {
  defaultUsers,
  defaultProducts,
  defaultTransactions,
  defaultSettings
};

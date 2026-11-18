const fs = require('fs');
const path = require('path');
const config = require('./config');
const { calculateDaysUntilExpiry } = require('./utils/expiry');
const { defaultUsers, defaultProducts, defaultTransactions, defaultSettings } = require('./seedData');

// In-memory database cache ensuring 100% resilience on serverless platforms (Vercel, AWS Lambda)
let memoryDb = null;

function getInitialData() {
  return {
    users: defaultUsers,
    products: defaultProducts,
    transactions: defaultTransactions,
    settings: { ...defaultSettings },
    auditLogs: [
      {
        id: 'audit_init_1',
        timestamp: new Date().toISOString(),
        userId: 'usr_admin',
        userName: 'Tariq Mansour (General Manager)',
        action: 'INIT_SYSTEM',
        entityType: 'SYSTEM',
        entityId: null,
        details: { message: 'WasteWise AI system initialized with enterprise defaults.' },
        ip: '127.0.0.1'
      }
    ],
    revokedTokens: [],
    metadata: {
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
      systemDate: config.SIMULATED_CURRENT_DATE
    }
  };
}

function loadDb() {
  if (memoryDb) {
    return memoryDb;
  }

  // 1. Try reading from primary data file (local data/ or /tmp on serverless)
  if (fs.existsSync(config.DATA_FILE)) {
    try {
      const raw = fs.readFileSync(config.DATA_FILE, 'utf8');
      const parsed = JSON.parse(raw);
      parsed.auditLogs = parsed.auditLogs || [];
      parsed.revokedTokens = parsed.revokedTokens || [];
      parsed.users = parsed.users && parsed.users.length > 0 ? parsed.users : defaultUsers;
      parsed.products = parsed.products && parsed.products.length > 0 ? parsed.products : defaultProducts;
      parsed.transactions = parsed.transactions || defaultTransactions;
      parsed.settings = { ...defaultSettings, ...(parsed.settings || {}) };
      memoryDb = parsed;
      return memoryDb;
    } catch (err) {
      console.warn('[DB] Primary data file read notice:', err.message);
    }
  }

  // 2. Try reading from bundled static data file (data/wastewise_db.json)
  if (config.STATIC_DATA_FILE && fs.existsSync(config.STATIC_DATA_FILE)) {
    try {
      const raw = fs.readFileSync(config.STATIC_DATA_FILE, 'utf8');
      const parsed = JSON.parse(raw);
      parsed.auditLogs = parsed.auditLogs || [];
      parsed.revokedTokens = parsed.revokedTokens || [];
      parsed.users = parsed.users && parsed.users.length > 0 ? parsed.users : defaultUsers;
      parsed.products = parsed.products && parsed.products.length > 0 ? parsed.products : defaultProducts;
      parsed.transactions = parsed.transactions || defaultTransactions;
      parsed.settings = { ...defaultSettings, ...(parsed.settings || {}) };
      memoryDb = parsed;
      // Gracefully attempt to write to /tmp for subsequent reads
      saveDb(memoryDb);
      return memoryDb;
    } catch (err) {
      console.warn('[DB] Static data file read notice:', err.message);
    }
  }

  // 3. Fallback to hardcoded seed defaults
  memoryDb = getInitialData();
  saveDb(memoryDb);
  return memoryDb;
}

function saveDb(data) {
  memoryDb = data;
  data.metadata = data.metadata || {};
  data.metadata.lastUpdated = new Date().toISOString();
  data.auditLogs = data.auditLogs || [];
  data.revokedTokens = data.revokedTokens || [];

  // Graceful file persistence: Never crash if filesystem is read-only (e.g. Vercel Lambda)
  try {
    const dir = path.dirname(config.DATA_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    const tempPath = `${config.DATA_FILE}.tmp.${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    fs.writeFileSync(tempPath, JSON.stringify(data, null, 2), 'utf8');
    fs.renameSync(tempPath, config.DATA_FILE);
  } catch (err) {
    // Non-fatal on read-only environments
    console.info('[DB] Notice: Filesystem persistence skipped (read-only environment). In-memory state maintained.', err.message);
  }
}

// Audit Logging
function addAuditLog({ userId, userName, action, entityType, entityId, details, ip }) {
  const db = loadDb();
  db.auditLogs = db.auditLogs || [];
  const logEntry = {
    id: `audit_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    timestamp: new Date().toISOString(),
    userId: userId || 'system',
    userName: userName || 'System',
    action,
    entityType: entityType || 'SYSTEM',
    entityId: entityId || null,
    details: details || {},
    ip: ip || '127.0.0.1'
  };
  db.auditLogs.unshift(logEntry);
  if (db.auditLogs.length > 500) {
    db.auditLogs.pop();
  }
  saveDb(db);
  return logEntry;
}

function getAuditLogs() {
  const db = loadDb();
  return db.auditLogs || [];
}

// Token Revocation & Invalidation
function revokeToken(token) {
  if (!token) return;
  const db = loadDb();
  db.revokedTokens = db.revokedTokens || [];
  if (!db.revokedTokens.includes(token)) {
    db.revokedTokens.push(token);
    if (db.revokedTokens.length > 1000) {
      db.revokedTokens.shift();
    }
    saveDb(db);
  }
}

function isTokenRevoked(token) {
  if (!token) return true;
  const db = loadDb();
  return Array.isArray(db.revokedTokens) && db.revokedTokens.includes(token);
}

// User Queries
function getUsers() {
  const db = loadDb();
  return db.users.map(({ passwordHash, ...safeUser }) => safeUser);
}

function getUserByEmail(email) {
  if (!email) return null;
  const db = loadDb();
  const normalized = email.trim().toLowerCase();
  return db.users.find(u => u.email.toLowerCase() === normalized) || null;
}

function getUserById(id) {
  const db = loadDb();
  const user = db.users.find(u => u.id === id);
  if (!user) return null;
  const { passwordHash, ...safeUser } = user;
  return safeUser;
}

function getUserWithHash(id) {
  const db = loadDb();
  return db.users.find(u => u.id === id) || null;
}

function updateUserProfile(userId, { name, email, avatar, passwordHash, posPin, stationTitle }, auditUser = null) {
  const db = loadDb();
  const userIndex = db.users.findIndex(u => u.id === userId);
  if (userIndex === -1) {
    throw new Error('User not found.');
  }

  const existing = db.users[userIndex];
  if (name && typeof name === 'string' && name.trim().length >= 2) {
    existing.name = name.trim();
  }
  if (email && typeof email === 'string') {
    const normalized = email.trim().toLowerCase();
    const duplicate = db.users.find(u => u.email.toLowerCase() === normalized && u.id !== userId);
    if (duplicate) {
      throw new Error('Email is already in use by another user.');
    }
    existing.email = normalized;
  }
  if (avatar && typeof avatar === 'string') {
    existing.avatar = avatar.trim();
  }
  if (passwordHash && typeof passwordHash === 'string') {
    existing.passwordHash = passwordHash;
  }
  if (posPin !== undefined) {
    existing.posPin = posPin ? String(posPin).trim() : null;
  }
  if (stationTitle !== undefined && existing.role === 'admin') {
    existing.stationTitle = String(stationTitle).trim();
  }

  existing.updatedAt = new Date().toISOString();
  db.users[userIndex] = existing;
  saveDb(db);

  if (auditUser) {
    addAuditLog({
      userId: auditUser.id,
      userName: auditUser.name,
      action: 'UPDATE_PROFILE',
      entityType: 'USER',
      entityId: userId,
      details: { name: existing.name, email: existing.email, passwordChanged: !!passwordHash, posPinUpdated: posPin !== undefined },
      ip: auditUser.ip || '127.0.0.1'
    });
  }

  const { passwordHash: _, ...safeUser } = existing;
  return safeUser;
}

// Product Queries
function getProducts() {
  const db = loadDb();
  return db.products;
}

function getProductById(id) {
  const db = loadDb();
  return db.products.find(p => p.id === id) || null;
}

function addProduct(productData, auditUser = null) {
  const db = loadDb();
  const sellingPrice = Number(productData.price || productData.sellingPrice) || 0;
  const expiryDate = productData.expiry_date || productData.expiryDate;
  const productionDate = productData.production_date || productData.productionDate || config.SIMULATED_CURRENT_DATE;
  const image = productData.image_url || productData.image || 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=600&auto=format&fit=crop&q=80';

  const newProduct = {
    id: `prod_fc_${Date.now()}`,
    sku: productData.sku || `FC-${Math.floor(100 + Math.random() * 900)}`,
    name: productData.name.trim(),
    category: productData.category || 'General',
    costPrice: Number(productData.costPrice) || Math.round(sellingPrice * 0.6),
    sellingPrice,
    price: sellingPrice,
    discountPrice: productData.discountPrice ? Number(productData.discountPrice) : null,
    stock: parseInt(productData.stock, 10) || 0,
    minStockThreshold: parseInt(productData.minStockThreshold, 10) || 15,
    productionDate,
    production_date: productionDate,
    expiryDate,
    expiry_date: expiryDate,
    alertDaysBefore: parseInt(productData.alertDaysBefore, 10) || 2,
    barcode: productData.barcode || `622100${Math.floor(100000 + Math.random() * 900000)}`,
    image,
    image_url: image,
    description: productData.description || ''
  };

  db.products.push(newProduct);
  saveDb(db);

  if (auditUser) {
    addAuditLog({
      userId: auditUser.id,
      userName: auditUser.name,
      action: 'CREATE_PRODUCT',
      entityType: 'PRODUCT',
      entityId: newProduct.id,
      details: { name: newProduct.name, price: sellingPrice, stock: newProduct.stock },
      ip: auditUser.ip
    });
  }

  return newProduct;
}

function updateProduct(id, updateData, auditUser = null) {
  const db = loadDb();
  const index = db.products.findIndex(p => p.id === id);
  if (index === -1) return null;

  const existing = db.products[index];
  const sellingPrice = updateData.price !== undefined ? Number(updateData.price) : (updateData.sellingPrice !== undefined ? Number(updateData.sellingPrice) : existing.sellingPrice);
  const expiryDate = updateData.expiry_date || updateData.expiryDate || existing.expiryDate;
  const productionDate = updateData.production_date || updateData.productionDate || existing.productionDate || config.SIMULATED_CURRENT_DATE;
  const image = updateData.image_url || updateData.image || existing.image;

  const updated = {
    ...existing,
    ...updateData,
    id: existing.id,
    sellingPrice,
    price: sellingPrice,
    costPrice: updateData.costPrice !== undefined ? Number(updateData.costPrice) : existing.costPrice,
    discountPrice: updateData.discountPrice !== undefined ? (updateData.discountPrice ? Number(updateData.discountPrice) : null) : existing.discountPrice,
    stock: updateData.stock !== undefined ? parseInt(updateData.stock, 10) : existing.stock,
    minStockThreshold: updateData.minStockThreshold !== undefined ? parseInt(updateData.minStockThreshold, 10) : existing.minStockThreshold,
    productionDate,
    production_date: productionDate,
    expiryDate,
    expiry_date: expiryDate,
    image,
    image_url: image,
    alertDaysBefore: updateData.alertDaysBefore !== undefined ? parseInt(updateData.alertDaysBefore, 10) : existing.alertDaysBefore
  };

  db.products[index] = updated;
  saveDb(db);

  if (auditUser) {
    addAuditLog({
      userId: auditUser.id,
      userName: auditUser.name,
      action: 'UPDATE_PRODUCT',
      entityType: 'PRODUCT',
      entityId: id,
      details: { name: updated.name, price: sellingPrice, stock: updated.stock },
      ip: auditUser.ip
    });
  }

  return updated;
}

function deleteProduct(id, auditUser = null) {
  const db = loadDb();
  const index = db.products.findIndex(p => p.id === id);
  if (index === -1) return false;

  const removed = db.products.splice(index, 1)[0];
  saveDb(db);

  if (auditUser) {
    addAuditLog({
      userId: auditUser.id,
      userName: auditUser.name,
      action: 'DELETE_PRODUCT',
      entityType: 'PRODUCT',
      entityId: id,
      details: { name: removed.name },
      ip: auditUser.ip
    });
  }

  return true;
}

function applyMarkdown(id, discountPercentage, auditUser = null) {
  const db = loadDb();
  const product = db.products.find(p => p.id === id);
  if (!product) return null;

  const pct = Number(discountPercentage);
  if (isNaN(pct) || pct < 0 || pct > 90) {
    throw new Error('Discount percentage must be between 1% and 90% (or 0% to remove discount).');
  }
  if (pct > 0 && pct < 1) {
    throw new Error('Discount percentage must be at least 1%.');
  }

  const basePrice = Number(product.sellingPrice || product.price);
  if (pct === 0) {
    product.discountPrice = null;
  } else {
    const discounted = basePrice * (1 - pct / 100);
    product.discountPrice = Number(discounted.toFixed(2));
  }
  saveDb(db);

  if (auditUser) {
    addAuditLog({
      userId: auditUser.id,
      userName: auditUser.name,
      action: 'MARKDOWN_PRODUCT',
      entityType: 'PRODUCT',
      entityId: id,
      details: { name: product.name, discountPercentage: pct, discountPrice: product.discountPrice },
      ip: auditUser.ip
    });
  }

  return product;
}

// System Settings
function getSettings() {
  const db = loadDb();
  return { ...defaultSettings, ...(db.settings || {}) };
}

function updateSettings(updates, auditUser = null) {
  const db = loadDb();
  db.settings = db.settings || { ...defaultSettings };

  if (updates.restaurantName && typeof updates.restaurantName === 'string') {
    db.settings.restaurantName = updates.restaurantName.trim();
  }
  if (updates.branchName && typeof updates.branchName === 'string') {
    db.settings.branchName = updates.branchName.trim();
  }
  if (updates.address && typeof updates.address === 'string') {
    db.settings.address = updates.address.trim();
  }
  if (updates.phone && typeof updates.phone === 'string') {
    db.settings.phone = updates.phone.trim();
  }
  if (updates.receiptFooter && typeof updates.receiptFooter === 'string') {
    db.settings.receiptFooter = updates.receiptFooter.trim();
  }
  if (updates.currency && typeof updates.currency === 'string') {
    db.settings.currency = updates.currency.trim().toUpperCase();
  }
  if (updates.taxRate !== undefined && !isNaN(Number(updates.taxRate))) {
    const rate = Number(updates.taxRate);
    if (rate >= 0 && rate <= 0.5) {
      db.settings.taxRate = Number(rate.toFixed(4));
    }
  }
  if (updates.enabledPaymentMethods && typeof updates.enabledPaymentMethods === 'object') {
    db.settings.enabledPaymentMethods = {
      cash: updates.enabledPaymentMethods.cash !== false,
      card: updates.enabledPaymentMethods.card !== false,
      wallet: updates.enabledPaymentMethods.wallet !== false
    };
  }
  if (updates.warningDaysBefore !== undefined && !isNaN(Number(updates.warningDaysBefore))) {
    db.settings.warningDaysBefore = Math.max(1, parseInt(updates.warningDaysBefore, 10));
  }
  if (updates.criticalDaysBefore !== undefined && !isNaN(Number(updates.criticalDaysBefore))) {
    db.settings.criticalDaysBefore = Math.max(0, parseInt(updates.criticalDaysBefore, 10));
  }
  if (updates.defaultMinStockThreshold !== undefined && !isNaN(Number(updates.defaultMinStockThreshold))) {
    db.settings.defaultMinStockThreshold = Math.max(1, parseInt(updates.defaultMinStockThreshold, 10));
  }
  if (updates.autoBlockExpiredCheckout !== undefined) {
    db.settings.autoBlockExpiredCheckout = !!updates.autoBlockExpiredCheckout;
  }

  saveDb(db);

  if (auditUser) {
    addAuditLog({
      userId: auditUser.id,
      userName: auditUser.name,
      action: 'UPDATE_SETTINGS',
      entityType: 'SETTINGS',
      entityId: null,
      details: updates,
      ip: auditUser.ip || '127.0.0.1'
    });
  }

  return db.settings;
}

// Transactions & POS Checkout
function getTransactions() {
  const db = loadDb();
  return (db.transactions || []).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
}

function recordCheckout({ cashierId, cashierName, items, paymentMethod, amountTendered, taxRate }) {
  const db = loadDb();
  const currentSettings = getSettings();
  const effectiveTaxRate = taxRate !== undefined ? Number(taxRate) : (currentSettings.taxRate !== undefined ? currentSettings.taxRate : 0.08);

  if (!Array.isArray(items) || items.length === 0) {
    throw new Error('Checkout cart cannot be empty.');
  }

  const validatedItems = [];
  let subtotal = 0;

  for (const item of items) {
    const product = db.products.find(p => p.id === item.productId);
    if (!product) {
      throw new Error(`Product with ID "${item.productId}" not found.`);
    }

    const requestedQty = parseInt(item.quantity, 10);
    if (isNaN(requestedQty) || requestedQty <= 0) {
      throw new Error(`Invalid quantity for product "${product.name}".`);
    }

    const daysUntilExpiry = calculateDaysUntilExpiry(product.expiryDate || product.expiry_date, config.SIMULATED_CURRENT_DATE);
    if (currentSettings.autoBlockExpiredCheckout !== false && daysUntilExpiry <= 0) {
      throw new Error(`Cannot sell expired item: "${product.name}". Stock must be disposed.`);
    }

    if (product.stock < requestedQty) {
      throw new Error(`Insufficient stock for "${product.name}". Requested: ${requestedQty}, Available: ${product.stock}.`);
    }

    const effectiveUnitPrice = (product.discountPrice !== null && product.discountPrice !== undefined)
      ? Number(product.discountPrice)
      : Number(product.sellingPrice || product.price);

    const itemTotal = Number((effectiveUnitPrice * requestedQty).toFixed(2));
    subtotal += itemTotal;

    validatedItems.push({
      productId: product.id,
      name: product.name,
      quantity: requestedQty,
      unitPrice: effectiveUnitPrice,
      costPrice: Number(product.costPrice) || 0,
      total: itemTotal,
      productRef: product
    });
  }

  for (const item of validatedItems) {
    item.productRef.stock -= item.quantity;
    delete item.productRef;
  }

  subtotal = Number(subtotal.toFixed(2));
  const tax = Number((subtotal * effectiveTaxRate).toFixed(2));
  const total = Number((subtotal + tax).toFixed(2));

  const normalizedMethod = (paymentMethod || 'cash').toLowerCase();
  const isCash = normalizedMethod === 'cash';

  let tendered = Number(amountTendered);
  if (!isCash) {
    tendered = total;
  } else {
    if (isNaN(tendered) || tendered < total) {
      throw new Error(`Insufficient amount tendered. Total is ${total} EGP, but tendered ${tendered || 0} EGP.`);
    }
  }
  tendered = Number(tendered.toFixed(2));
  const changeDue = Number(Math.max(0, tendered - total).toFixed(2));

  const transaction = {
    id: `txn_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    invoiceNumber: `INV-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`,
    cashierId,
    cashierName,
    timestamp: new Date().toISOString(),
    items: validatedItems,
    subtotal,
    tax,
    total,
    paymentMethod: normalizedMethod,
    amountTendered: tendered,
    changeDue
  };

  db.transactions.unshift(transaction);
  saveDb(db);

  return {
    transaction,
    updatedProducts: db.products
  };
}

function resetToMockData(auditUser = null) {
  const initialData = getInitialData();
  saveDb(initialData);
  return initialData;
}

function getExportData() {
  const db = loadDb();
  return {
    exportDate: new Date().toISOString(),
    systemDate: config.SIMULATED_CURRENT_DATE,
    settings: getSettings(),
    users: db.users.map(({ passwordHash, ...safeUser }) => safeUser),
    products: db.products,
    transactions: db.transactions || [],
    auditLogs: db.auditLogs || [],
    metadata: db.metadata
  };
}

module.exports = {
  getUsers,
  getUserByEmail,
  getUserById,
  getUserWithHash,
  updateUserProfile,
  getSettings,
  updateSettings,
  getProducts,
  getProductById,
  addProduct,
  updateProduct,
  deleteProduct,
  applyMarkdown,
  getTransactions,
  recordCheckout,
  resetToMockData,
  addAuditLog,
  getAuditLogs,
  revokeToken,
  isTokenRevoked,
  getExportData
};

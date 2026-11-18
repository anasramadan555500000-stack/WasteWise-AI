// WasteWise AI Internationalization (i18n) Engine
// Supports dynamic English (en) and Arabic (ar) with RTL/LTR layout switching

const translations = {
  en: {
    // Brand & Header
    brandTitle: 'WasteWise',
    brandAi: 'AI',
    adminPanel: 'Admin Panel',
    posTerminal: 'POS Terminal',
    controlCenter: 'Control Center',
    posView: 'POS Terminal View',
    live: 'Live',
    cloudTooltip: 'Supabase Cloud Connected',
    stationPrefix: 'Station #01',
    notifications: 'Notifications',
    systemAlerts: 'System Notifications',
    markAllRead: 'Mark all as read',
    allCaughtUp: 'All caught up!',
    noAlerts: 'No critical expiry or low-stock alerts right now.',
    profile: 'My Profile',
    signOut: 'Sign Out',
    signedOutToast: 'You have been signed out safely.',
    allMarkedReadToast: 'All notifications marked as read.',

    // Common
    cancel: 'Cancel',
    save: 'Save',
    delete: 'Delete',
    edit: 'Edit',
    confirm: 'Confirm',
    close: 'Close',
    active: 'Active',
    expired: 'Expired',
    warning: 'Warning',
    safe: 'Safe',
    all: 'All',
    clearAll: 'Clear All',
    actions: 'Actions',

    // Cashier POS
    searchPosPlaceholder: 'Search food by name, SKU, or scan barcode (Press Enter)...',
    noItemsFound: 'No items found',
    tryClearingFilter: 'Try clearing the search filter or scanning a different barcode.',
    currentOrderBill: 'Current Order Bill',
    itemsInCart: 'item(s) in cart',
    cartEmpty: 'Cart is empty',
    cartEmptySub: 'Click any product or scan barcode to add.',
    subtotal: 'Subtotal:',
    salesTax: 'Sales Tax',
    totalDue: 'Total Amount Due:',
    paymentOptions: 'Payment Method Options',
    cash: 'Cash',
    card: 'Visa / Card',
    wallet: 'Wallet',
    tendered: 'Tendered (EGP):',
    changeDue: 'Change Due:',
    exact: 'Exact',
    posTapActive: 'POS Terminal Tap / EMV Chip Active',
    authRefCode: 'Auth / Reference Code (e.g. VISA-8842)',
    walletTransferActive: 'Vodafone Cash / InstaPay Transfer Active',
    walletPhoneInput: 'Wallet Phone / InstaPay Ref (e.g. 01023456789)',
    completeOrder: 'Complete Order / Checkout',
    orderAuthorizing: 'Authorizing Order & Deducting Stock...',
    leftInStock: 'left',
    scannedAdded: 'Scanned & added:',
    noItemBarcodeMatch: 'No item matching barcode/SKU:',

    // Categories
    catAll: 'All',
    catBuckets: 'Buckets',
    catMeals: 'Meals',
    catSides: 'Sides',
    catSauces: 'Sauces',
    catDrinks: 'Drinks',

    // Admin Dashboard
    criticalAlertHeader: 'Critical Alert:',
    productsExpiring2d: 'product(s) expiring within 2 days!',
    totalAtRiskLoss: 'Total potential inventory loss at risk:',
    takeMarkdownAction: 'Take proactive markdown action below to salvage capital.',
    viewExpiringItems: 'View Expiring Items',
    aiMarkdownEngine: '⚡ AI Markdown Engine',
    grossRevenue: 'Gross Sales Revenue',
    netProfit: 'Net Operating Profit',
    wasteLoss: 'Waste Loss at Risk',
    inventoryCost: 'Total Inventory Cost',
    liveDbSales: 'Authoritative from live DB sales',
    profitMargin: 'profit margin',
    totalStockUnits: 'total stock units',

    // Admin Tabs
    tabInventory: '📦 Inventory & Expiry Tracker',
    tabMarkdown: '🤖 AI Wastage & Salvage Engine',
    tabUsers: '🛡️ RBAC Users & Security',
    tabTransactions: '🧾 Sales Invoices',
    tabAuditLogs: '📜 Enterprise Audit Logs',
    tabSettings: '⚙️ System Settings',
    exportBackup: 'Export Backup',

    // Admin Inventory Table
    searchAdminPlaceholder: 'Search products by SKU, name, or barcode...',
    allExpiryStatuses: 'All Expiry Statuses',
    expiringIn2Days: '⚠️ Expiring in ≤ 2 Days',
    expiredItems: '🔴 Expired Items',
    safeItems: '🟢 Safe Items',
    addProduct: 'Add Product',
    thProductSku: 'Product & SKU',
    thCategory: 'Category',
    thCostRetail: 'Cost / Retail',
    thStockLevel: 'Stock Level',
    thExpiryDate: 'Expiry Date',
    thLiveStatus: 'Live Status',
    thActions: 'Actions',
    noMatchingProducts: 'No matching products found',
    tryAdjustingSearch: 'Try adjusting your search query or status filter.',

    // Admin Settings
    settingsTitle: '⚙️ Restaurant POS & System Configuration',
    adminOnlyBadge: 'Admin Only',
    settingsSubtitle: 'Customize receipt branding, financial rules, AI expiry triggers, and backup data.',
    saveSettingsBtn: 'Save System Settings',
    savingSettingsBtn: 'Saving Settings...',
    brandingCardTitle: 'Restaurant & Receipt Branding',
    brandingCardSub: 'Printed dynamically on invoices, customer receipts, and navbar.',
    restaurantName: 'Restaurant / Brand Name',
    branchName: 'Branch Name',
    phone: 'Phone Number',
    address: 'Address',
    receiptFooter: 'Receipt Footer Note',
    financialCardTitle: 'Financial & Tax Rules',
    financialCardSub: 'Controls VAT percentage, currency display, and enabled tenders.',
    currencyCode: 'Currency Code',
    salesTaxPct: 'Sales Tax / VAT (%)',
    enabledTenders: 'Enabled Checkout Payment Methods',
    thresholdsCardTitle: 'Inventory & AI Expiry Thresholds',
    thresholdsCardSub: 'Configures warning badges, bell notifications, and POS checkout blocks.',
    warningWindowDays: 'Warning Window (Days)',
    criticalThresholdDays: 'Critical Expiry (Days)',
    minStockThreshold: 'Default Low-Stock Threshold',
    autoBlockExpired: 'Auto-Block Expired Items at POS Checkout',
    autoBlockExpiredSub: 'Strictly prevents cashiers from billing any product that has already expired.',
    maintenanceCardTitle: 'System Maintenance & Database',
    maintenanceCardSub: 'Database backup exports and mock demonstration data management.',
    fullDbBackup: 'Full Enterprise Database Backup',
    fullDbBackupSub: 'Download all products, transactions, and settings in JSON format.',
    downloadJson: 'Download JSON',
    resetDemoDb: 'Reset Demo Database',
    resetDemoDbSub: 'Restore factory demonstration catalog (Fried Chicken meals & sides).',
    resetDemo: 'Reset Demo',

    // Auth Screen
    authSignInTitle: 'Sign In',
    authSignInSub: 'Enter your credentials to securely access your terminal or dashboard.',
    emailLabel: 'Email Address',
    passwordLabel: 'Password',
    rememberMe: 'Remember my session on this terminal',
    signInSubmit: 'Sign In to System',
    signingIn: 'Authorizing Secure Enterprise Session...',
    adminDemoBtn: 'Admin Demo (Full Access)',
    cashierDemoBtn: 'Cashier Demo (POS Station #01)',
    authFooterSub: 'Enterprise Food Waste Mitigation & Real-Time POS Platform',

    // User Profile Modal
    profileModalTitle: 'User Profile & Terminal Security',
    profileModalSub: 'Manage account information, POS terminal PIN, and credentials.',
    profilePhoto: 'Profile Photo',
    avatarPlaceholder: 'https://... or choose preset below',
    choosePreset: 'Choose a quick avatar preset or paste your image URL:',
    fullName: 'Full Name',
    emailAddress: 'Email Address',
    systemAccessRole: 'System Access Role',
    fullClearance: 'Full Clearance',
    posCashierRole: 'POS Cashier',
    displayTitleStation: 'Display Title / Station Name',
    assignedStation: 'Assigned Terminal Station',
    quickPosPin: 'Quick POS Cashier PIN Code (4–6 Digits)',
    optional: 'Optional',
    quickPinSub: 'Allows rapid POS authorization without re-typing long master passwords.',
    changePassword: 'Change Account Password (Leave blank to keep current)',
    currentPassword: 'Current Password',
    currentPasswordPlaceholder: 'Required if setting new password',
    newPassword: 'New Password',
    newPasswordPlaceholder: 'Min 6 characters',
    saveProfileChanges: 'Save Profile Changes',
    savingUpdates: 'Saving Updates...',
    profileUpdatedToast: 'Profile and security credentials updated successfully!',
    currentPasswordRequired: 'Please enter your current password to set a new password.',

    // Product Modal
    editInventoryItem: 'Edit Inventory Item',
    addNewInventoryItem: 'Add New Inventory Item',
    productModalSub: 'Configure retail pricing, stock, and expiry notification trigger.',
    productName: 'Product Name',
    productNamePlaceholder: 'e.g. Organic Almond Milk 1L',
    skuCode: 'SKU Code',
    costPrice: 'Cost Price (EGP)',
    retailPrice: 'Retail Selling Price (EGP)',
    initialStock: 'Initial Stock Units',
    expiryDate: 'Expiry Date (YYYY-MM-DD)',
    alertWindow: 'Alert Trigger Window',
    dayPrior1: '1 Day Prior',
    dayPrior2: '2 Days Prior (Default)',
    dayPrior3: '3 Days Prior',
    dayPrior7: '7 Days Prior',
    barcodeUpc: 'Barcode / UPC',
    productPhotoUrl: 'Product Photo URL or Preset',
    saveChanges: 'Save Changes',
    addToInventory: 'Add to Inventory',

    // Receipt Modal
    printReceipt: 'Print Receipt',
    done: 'Done',
    invoice: 'Invoice',
    date: 'Date',
    cashier: 'Cashier',
    itemDescription: 'Item Description',
    totalPaid: 'TOTAL PAID',
    paymentTender: 'Payment Tender',
    changeReturned: 'Change Returned',

    // New Upgrades: P&L, Half-Life & Visuals
    halfLifeReached: 'Half-Life Reached (50% Shelf Life)',
    criticalNearExpiry: 'Critical Near-Expiry',
    monthlyPnLTitle: 'Monthly Profit & Loss (P&L) Analytics',
    monthlyGrossRevenue: 'Monthly Gross Revenue',
    monthlyNetProfit: 'Net Monthly Operating Profit',
    monthlyProfitMargin: 'Monthly Profit Margin',
    monthlyLossesBreakdown: 'Total Losses Breakdown',
    expiredStockLoss: 'Expired Stock Loss',
    atRiskStockLoss: 'At-Risk Near-Expiry Value',
    markdownDiscountLoss: 'AI Markdown Price Reductions',
    totalLosses: 'Total Realized & At-Risk Losses',
    liveShift: 'Shift #01 • Morning Active',
    anchorDateLabel: 'Anchor: Nov 15, 2026',
    featurePosStockSync: '⚡ Live POS Stock Sync',
    featureAiHalfLife: '🤖 AI Half-Life Expiry Engine',
    featureRealtimePnL: '📊 Real-Time P&L Analytics',
    viewInInventory: 'Inspect in Inventory',

    // Multi-Stage Expiry & Reminder Engine
    dualDateSchedule: 'Dual-Date Lifecycle & Shelf-Life Schedule',
    productionDate: 'Production / Batch Date',
    productionDateSub: 'Start date of batch preparation',
    liveShelfLife: 'Live Shelf-Life Calculation',
    final48hEscalation: 'Final 48h Escalation (3x / day)',
    final48hBadge: 'Escalation (3x/d)',
    halfLifeBadge: 'Half-Life (50%)',
    freshBadge: 'Fresh',
    expiredBadge: 'Expired',
    stageEscalation: 'Final 48h Escalation',
    stageHalfLife: '50% Half-Life Reached',
    stageExpired: 'Expired Stock',
    stageFresh: 'Fresh Stock',
    reminderSlotMorning: 'Morning Reminder (09:00)',
    reminderSlotAfternoon: 'Afternoon Reminder (15:00)',
    reminderSlotEvening: 'Evening Reminder (21:00)',
    reminderSlot1: 'Morning Slot (00:00-08:00)',
    reminderSlot2: 'Afternoon Slot (08:00-16:00)',
    reminderSlot3: 'Evening Slot (16:00-24:00)',
    tagUrgentEscalation: '🔴 URGENT (≤ 2 Days • 3x/Day Reminder)',
    tagHalfLife: '🟠 HALF-LIFE (50% Shelf Life Reached)',
    tagExpired: '⛔ EXPIRED (Blocked from POS)',
    tagLowStock: '📦 LOW STOCK',
    applyAiMarkdown: 'Apply AI Markdown',
    muteChime: 'Mute Expiry Chime',
    unmuteChime: 'Unmute Expiry Chime',
    expiryMustBeAfterProduction: 'Expiry date must be strictly after production date.'
  },
  ar: {
    // Brand & Header
    brandTitle: 'WasteWise',
    brandAi: 'AI',
    adminPanel: 'لوحة الإدارة',
    posTerminal: 'شاشة الكاشير',
    controlCenter: 'لوحة التحكم',
    posView: 'نقطة البيع',
    live: 'متصل',
    cloudTooltip: 'قاعدة بيانات سوبابيس السحابية متصلة',
    stationPrefix: 'محطة #01',
    notifications: 'الإشعارات',
    systemAlerts: 'إشعارات وتنبيهات النظام',
    markAllRead: 'تعليم الكل كمقروء',
    allCaughtUp: 'تمت قراءة جميع التنبيهات!',
    noAlerts: 'لا توجد تنبيهات لانتهاء الصلاحية أو نقص المخزون حالياً.',
    profile: 'الملف الشخصي',
    signOut: 'تسجيل الخروج',
    signedOutToast: 'تم تسجيل الخروج بنجاح وأمان.',
    allMarkedReadToast: 'تم تعليم كافة الإشعارات كمقروءة.',

    // Common
    cancel: 'إلغاء',
    save: 'حفظ',
    delete: 'حذف',
    edit: 'تعديل',
    confirm: 'تأكيد',
    close: 'إغلاق',
    active: 'نشط',
    expired: 'منتهي الصلاحية',
    warning: 'تحذير',
    safe: 'آمن',
    all: 'الكل',
    clearAll: 'تفريغ السلة',
    actions: 'إجراءات',

    // Cashier POS
    searchPosPlaceholder: 'ابحث عن وجبة بالاسم، الكود، أو امسح الباركود (اضغط Enter)...',
    noItemsFound: 'لم يتم العثور على أي وجبات',
    tryClearingFilter: 'جرّب مسح نص البحث أو مسح باركود صنف آخر.',
    currentOrderBill: 'فاتورة الطلب الحالية',
    itemsInCart: 'صنف في السلة',
    cartEmpty: 'السلة فارغة',
    cartEmptySub: 'اضغط على أي وجبة أو امسح الباركود للإضافة إلى الفاتورة.',
    subtotal: 'المجموع الفرعي:',
    salesTax: 'ضريبة المبيعات',
    totalDue: 'الإجمالي النهائي المستحق:',
    paymentOptions: 'طريقة الدفع المعتمدة',
    cash: 'نقدي (كاش)',
    card: 'فيزا / بطاقة',
    wallet: 'محفظة إلكترونية',
    tendered: 'المبلغ المدفوع (ج.م):',
    changeDue: 'المبلغ المتبقي:',
    exact: 'المبلغ تماماً',
    posTapActive: 'ماكينة نقاط البيع جاهزة لتمرير البطاقة الإلكترونية',
    authRefCode: 'كود التفويض / الرقم المرجعي (مثال: VISA-8842)',
    walletTransferActive: 'تحويل فودافون كاش / إنستاباي نشط',
    walletPhoneInput: 'رقم المحفظة / مرجع إنستاباي (مثال: 01023456789)',
    completeOrder: 'إتمام الطلب وطباعة الإيصال',
    orderAuthorizing: 'جارٍ اعتماد الطلب وخصم المخزون من قاعدة البيانات...',
    leftInStock: 'متبقي',
    scannedAdded: 'تم مسح وإضافة:',
    noItemBarcodeMatch: 'لا يوجد منتج مطابق للباركود أو الكود:',

    // Categories
    catAll: 'الكل',
    catBuckets: 'وجبات عائلية',
    catMeals: 'وجبات فردية',
    catSides: 'أطباق جانبية',
    catSauces: 'صوصات',
    catDrinks: 'مشروبات',

    // Admin Dashboard
    criticalAlertHeader: 'تنبيه عاجل:',
    productsExpiring2d: 'منتجات ستنتهي صلاحيتها خلال يومين أو أقل!',
    totalAtRiskLoss: 'إجمالي الخسائر المالية المحتملة والمعرضة للتلف:',
    takeMarkdownAction: 'قم بتطبيق خصومات استباقية بالذكاء الاصطناعي لإنقاذ رأس المال.',
    viewExpiringItems: 'عرض المنتجات المهددة',
    aiMarkdownEngine: '⚡ محرك الخصم بالذكاء الاصطناعي',
    grossRevenue: 'إجمالي المبيعات المحققة',
    netProfit: 'صافي الربح التشغيلي',
    wasteLoss: 'الخسائر المعرضة للتلف',
    inventoryCost: 'إجمالي تكلفة المخزون',
    liveDbSales: 'محدث لحظياً ومباشراً من قاعدة البيانات',
    profitMargin: 'هامش الربح',
    totalStockUnits: 'إجمالي وحدات المخزون',

    // Admin Tabs
    tabInventory: '📦 إدارة المخزون والصلاحية',
    tabMarkdown: '🤖 محرك الذكاء الاصطناعي للتخفيضات',
    tabUsers: '🛡️ المستخدمين وتدرج الصلاحيات',
    tabTransactions: '🧾 فواتير المبيعات الحية',
    tabAuditLogs: '📜 سجلات تدقيق الأمان',
    tabSettings: '⚙️ إعدادات النظام والمطعم',
    exportBackup: 'تصدير نسخة احتياطية',

    // Admin Inventory Table
    searchAdminPlaceholder: 'ابحث عن صنف بالاسم، الكود، أو الباركود...',
    allExpiryStatuses: 'كافة حالات الصلاحية',
    expiringIn2Days: '⚠️ تنتهي خلال ≤ يومين',
    expiredItems: '🔴 أصناف منتهية الصلاحية',
    safeItems: '🟢 أصناف آمنة ومستقرة',
    addProduct: 'إضافة صنف جديد',
    thProductSku: 'المنتج والكود',
    thCategory: 'التصنيف',
    thCostRetail: 'التكلفة / سعر البيع',
    thStockLevel: 'مستوى المخزون',
    thExpiryDate: 'تاريخ انتهاء الصلاحية',
    thLiveStatus: 'الحالة الحالية',
    thActions: 'إجراءات',
    noMatchingProducts: 'لم يتم العثور على منتجات مطابقة',
    tryAdjustingSearch: 'جرّب تعديل نص البحث أو فلتر حالة الصلاحية.',

    // Admin Settings
    settingsTitle: '⚙️ إعدادات النظام ومطعم البروستد',
    adminOnlyBadge: 'للمدير فقط',
    settingsSubtitle: 'تخصيص هوية الإيصال، القواعد المالية، محددات الذكاء الاصطناعي، والنسخ الاحتياطي.',
    saveSettingsBtn: 'حفظ إعدادات النظام',
    savingSettingsBtn: 'جارٍ حفظ الإعدادات...',
    brandingCardTitle: 'بيانات وهوية المطعم والإيصال',
    brandingCardSub: 'تُطبع ديناميكياً على الفواتير، إيصالات العملاء، وشريط التنقل.',
    restaurantName: 'اسم المطعم / العلامة التجارية',
    branchName: 'اسم الفرع',
    phone: 'رقم الهاتف / الخط الساخن',
    address: 'العنوان بالتفصيل',
    receiptFooter: 'رسالة شكر تذييل الفاتورة',
    financialCardTitle: 'القواعد المالية والضريبية',
    financialCardSub: 'تحديد نسبة ضريبة القيمة المضافة، رمز العملة، ووسائل الدفع المفعلة.',
    currencyCode: 'رمز العملة',
    salesTaxPct: 'ضريبة المبيعات / القيمة المضافة (%)',
    enabledTenders: 'طرق الدفع المسموح بها في نقطة البيع',
    thresholdsCardTitle: 'محددات الصلاحية والذكاء الاصطناعي',
    thresholdsCardSub: 'تحديد شارات التحذير، جرس التنبيهات، وحظر بيع المنتهي.',
    warningWindowDays: 'فترة التحذير المسبق (بالأيام)',
    criticalThresholdDays: 'حد الصلاحية الحرج (بالأيام)',
    minStockThreshold: 'الحد الأدنى الافتراضي لنقص المخزون',
    autoBlockExpired: 'حظر بيع المنتجات منتهية الصلاحية عند الكاشير',
    autoBlockExpiredSub: 'يمنع الكاشير تماماً من فوترة أي منتج انتهت صلاحيته للحفاظ على سلامة العملاء.',
    maintenanceCardTitle: 'صيانة النظام والبيانات',
    maintenanceCardSub: 'تصدير النسخ الاحتياطية وإدارة البيانات التجريبية لقاعدة البيانات.',
    fullDbBackup: 'نسخة احتياطية كاملة من قاعدة البيانات',
    fullDbBackupSub: 'تنزيل جميع المنتجات، المبيعات، والإعدادات بصيغة JSON متكاملة.',
    downloadJson: 'تنزيل ملف JSON',
    resetDemoDb: 'استعادة البيانات التجريبية للمطعم',
    resetDemoDbSub: 'استرجاع قائمة الدجاج المقرمش والوجبات الأصلية للمطعم.',
    resetDemo: 'استعادة الأصل',

    // Auth Screen
    authSignInTitle: 'تسجيل الدخول',
    authSignInSub: 'أدخل بيانات اعتمادك للوصول الآمن لنقطة البيع أو لوحة التحكم.',
    emailLabel: 'البريد الإلكتروني',
    passwordLabel: 'كلمة المرور',
    rememberMe: 'تذكر جلستي على هذه المحطة',
    signInSubmit: 'تسجيل الدخول للنظام',
    signingIn: 'جارٍ التحقق من الهوية وفتح الجلسة الآمنة...',
    adminDemoBtn: 'دخول المدير (صلاحيات كاملة)',
    cashierDemoBtn: 'دخول الكاشير (المحطة #01)',
    authFooterSub: 'منظومة WasteWise AI الذكية لإدارة مخزون المطاعم والحد من هدر الطعام',

    // User Profile Modal
    profileModalTitle: 'الملف الشخصي وأمان المحطة',
    profileModalSub: 'إدارة بيانات الحساب، رمز PIN للمحطة، وكلمات المرور.',
    profilePhoto: 'الصورة الشخصية',
    avatarPlaceholder: 'رابط الصورة أو اختر رمزاً من الأسفل',
    choosePreset: 'اختر صورة جاهزة أو الصق رابط صورتك:',
    fullName: 'الاسم الكامل',
    emailAddress: 'البريد الإلكتروني',
    systemAccessRole: 'صلاحية الدخول للنظام',
    fullClearance: 'صلاحيات كاملة',
    posCashierRole: 'كاشير المحطة',
    displayTitleStation: 'المسمى الوظيفي / اسم المحطة',
    assignedStation: 'محطة الدخول المعينة',
    quickPosPin: 'رمز PIN السريع للكاشير (4–6 أرقام)',
    optional: 'اختياري',
    quickPinSub: 'يسمح بتسجيل الدخول السريع لمحطة البيع دون كتابة كلمة المرور كاملة.',
    changePassword: 'تغيير كلمة المرور (اتركها فارغة للإبقاء على الحالية)',
    currentPassword: 'كلمة المرور الحالية',
    currentPasswordPlaceholder: 'مطلوبة في حال تعيين كلمة مرور جديدة',
    newPassword: 'كلمة المرور الجديدة',
    newPasswordPlaceholder: '6 أحرف على الأقل',
    saveProfileChanges: 'حفظ بيانات الملف الشخصي',
    savingUpdates: 'جارٍ حفظ التعديلات...',
    profileUpdatedToast: 'تم تحديث الملف الشخصي وبيانات الأمان بنجاح!',
    currentPasswordRequired: 'يرجى إدخال كلمة المرور الحالية لتعيين كلمة مرور جديدة.',

    // Product Modal
    editInventoryItem: 'تعديل بيانات الصنف',
    addNewInventoryItem: 'إضافة صنف جديد للمخزون',
    productModalSub: 'تحديد سعر البيع، مستوى المخزون، وتنبيهات انتهاء الصلاحية.',
    productName: 'اسم الصنف',
    productNamePlaceholder: 'مثال: وجبة تويستر حار 3 قطع',
    skuCode: 'كود الصنف (SKU)',
    costPrice: 'سعر التكلفة (ج.م)',
    retailPrice: 'سعر البيع للجمهور (ج.م)',
    initialStock: 'عدد وحدات المخزون',
    expiryDate: 'تاريخ انتهاء الصلاحية (YYYY-MM-DD)',
    alertWindow: 'فترة التنبيه المسبق',
    dayPrior1: 'قبل يوم واحد',
    dayPrior2: 'قبل يومين (افتراضي)',
    dayPrior3: 'قبل 3 أيام',
    dayPrior7: 'قبل 7 أيام',
    barcodeUpc: 'الباركود / رمز UPC',
    productPhotoUrl: 'رابط صورة المنتج أو اختر قالباً',
    saveChanges: 'حفظ التعديلات',
    addToInventory: 'إضافة للمخزون',

    // Receipt Modal
    printReceipt: 'طباعة الفاتورة',
    done: 'إغلاق',
    invoice: 'رقم الفاتورة',
    date: 'التاريخ',
    cashier: 'الكاشير',
    itemDescription: 'بيان الصنف',
    totalPaid: 'الإجمالي المدفوع',
    paymentTender: 'طريقة الدفع',
    changeReturned: 'المتبقي المسترد',

    // New Upgrades: P&L, Half-Life & Visuals
    halfLifeReached: 'تم بلوغ نصف مدة الصلاحية (50%)',
    criticalNearExpiry: 'اقتراب حرج من انتهاء الصلاحية',
    monthlyPnLTitle: 'التقرير المالي الشهري للأرباح والخسائر (P&L)',
    monthlyGrossRevenue: 'إجمالي المبيعات الشهرية',
    monthlyNetProfit: 'صافي الربح التشغيلي الشهري',
    monthlyProfitMargin: 'هامش الربح الشهري',
    monthlyLossesBreakdown: 'تفصيل إجمالي الخسائر والهدر',
    expiredStockLoss: 'خسائر المخزون المنتهي',
    atRiskStockLoss: 'قيمة المخزون المهدد بالتلف',
    markdownDiscountLoss: 'تخفيضات الذكاء الاصطناعي المنفذة',
    totalLosses: 'إجمالي الخسائر والمخاطر المالية',
    liveShift: 'الوردية #01 • صباحي نشط',
    anchorDateLabel: 'التاريخ المرجعي: 15 نوفمبر 2026',
    featurePosStockSync: '⚡ مزامنة المخزون اللحظية لنقاط البيع',
    featureAiHalfLife: '🤖 محرك الذكاء الاصطناعي لنصف مدة الصلاحية',
    featureRealtimePnL: '📊 تحليلات فورية للأرباح والخسائر',
    viewInInventory: 'معاينة في المخزون',

    // Multi-Stage Expiry & Reminder Engine
    dualDateSchedule: 'الجدول الزمني للإنتاج وانتهاء الصلاحية',
    productionDate: 'تاريخ الإنتاج / التشغيلة',
    productionDateSub: 'تاريخ بدء تحضير أو إنتاج الدفعة',
    liveShelfLife: 'حساب فترة الصلاحية الحية',
    final48hEscalation: 'تصعيد الـ 48 ساعة الأخيرة (3 تذكيرات يومياً)',
    final48hBadge: 'تصعيد (3x/يوم)',
    halfLifeBadge: 'نصف الصلاحية (50%)',
    freshBadge: 'طازج',
    expiredBadge: 'منتهي الصلاحية',
    stageEscalation: 'تصعيد الـ 48 ساعة الأخيرة',
    stageHalfLife: 'تم بلوغ 50% من الصلاحية',
    stageExpired: 'مخزون منتهي الصلاحية',
    stageFresh: 'مخزون طازج',
    reminderSlotMorning: 'تذكير الصباح (09:00)',
    reminderSlotAfternoon: 'تذكير الظهيرة (15:00)',
    reminderSlotEvening: 'تذكير المساء (21:00)',
    reminderSlot1: 'فترة الصباح (00:00-08:00)',
    reminderSlot2: 'فترة الظهيرة (08:00-16:00)',
    reminderSlot3: 'فترة المساء (16:00-24:00)',
    tagUrgentEscalation: '🔴 عاجل (≤ يومين • 3 تذكيرات يومياً)',
    tagHalfLife: '🟠 نصف الصلاحية (تم بلوغ 50%)',
    tagExpired: '⛔ منتهي الصلاحية (محظور من البيع)',
    tagLowStock: '📦 مخزون منخفض',
    applyAiMarkdown: 'تطبيق خصم الذكاء الاصطناعي',
    muteChime: 'كتم صوت التنبيه',
    unmuteChime: 'تشغيل صوت التنبيه',
    expiryMustBeAfterProduction: 'يجب أن يكون تاريخ انتهاء الصلاحية بعد تاريخ الإنتاج.'
  }
};

let currentLanguage = localStorage.getItem('wastewise_lang') || 'en';

export function getLanguage() {
  return currentLanguage;
}

export function isRTL() {
  return currentLanguage === 'ar';
}

export function t(key, fallback = '') {
  const langDict = translations[currentLanguage] || translations.en;
  if (langDict && langDict[key] !== undefined) {
    return langDict[key];
  }
  const enDict = translations.en;
  if (enDict && enDict[key] !== undefined) {
    return enDict[key];
  }
  return fallback || key;
}

export function setLanguage(lang) {
  if (lang !== 'en' && lang !== 'ar') return;
  currentLanguage = lang;
  localStorage.setItem('wastewise_lang', lang);

  document.documentElement.lang = lang;
  document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';

  // Toggle class on html for font styling
  if (lang === 'ar') {
    document.documentElement.classList.add('lang-ar');
  } else {
    document.documentElement.classList.remove('lang-ar');
  }

  window.dispatchEvent(new CustomEvent('wastewise:langChange', { detail: { lang } }));
}

export function toggleLanguage() {
  const next = currentLanguage === 'en' ? 'ar' : 'en';
  setLanguage(next);
  return next;
}

// Initialize layout dir on module load
if (typeof document !== 'undefined') {
  document.documentElement.lang = currentLanguage;
  document.documentElement.dir = currentLanguage === 'ar' ? 'rtl' : 'ltr';
  if (currentLanguage === 'ar') {
    document.documentElement.classList.add('lang-ar');
  }
}

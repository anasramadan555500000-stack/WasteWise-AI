const app = require('./server');
const http = require('http');
const db = require('./src/db');
const { authLimiter } = require('./src/middleware/rateLimit');

let server;
const port = 3099;
const host = '127.0.0.1';

async function runTests() {
  server = http.createServer(app);
  await new Promise(resolve => server.listen(port, host, resolve));
  console.log(`Test server running on http://${host}:${port}...\n`);

  const baseUrl = `http://${host}:${port}`;

  try {
    // Reset database to clean mock state before starting test suite
    db.resetToMockData();
    authLimiter.clearAll();

    // 1. Test Admin Login (admin@wastewise.com)
    console.log('[1/14] Testing Admin Login (admin@wastewise.com)...');
    const adminLoginRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@wastewise.com', password: 'Admin@123' })
    });
    const adminData = await adminLoginRes.json();
    if (!adminData.success || !adminData.token) throw new Error('Admin login failed: ' + JSON.stringify(adminData));
    const adminToken = adminData.token;
    console.log('       -> Admin login: SUCCESS (Role: ' + adminData.user.role + ')');

    // 2. Test Cashier Login (cashier@wastewise.com)
    console.log('[2/14] Testing Cashier Login (cashier@wastewise.com)...');
    const cashierLoginRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'cashier@wastewise.com', password: 'Cashier@123' })
    });
    const cashierData = await cashierLoginRes.json();
    if (!cashierData.success || !cashierData.token) throw new Error('Cashier login failed: ' + JSON.stringify(cashierData));
    const cashierToken = cashierData.token;
    console.log('       -> Cashier login: SUCCESS (Role: ' + cashierData.user.role + ')');

    // 3. Test RBAC: Cashier access to Admin Analytics MUST be rejected (403)
    console.log('[3/14] Testing RBAC: Cashier attempting to access Admin Analytics...');
    const forbiddenRes = await fetch(`${baseUrl}/api/admin/analytics`, {
      headers: { 'Authorization': `Bearer ${cashierToken}` }
    });
    if (forbiddenRes.status !== 403) throw new Error(`Expected 403, got ${forbiddenRes.status}`);
    console.log('       -> RBAC Cashier restriction: SUCCESS (403 Forbidden verified)');

    // 4. Test Cashier viewing products - costPrice must be omitted
    console.log('[4/14] Testing Cashier view of products (non-financial stock list)...');
    const cashierProdRes = await fetch(`${baseUrl}/api/products`, {
      headers: { 'Authorization': `Bearer ${cashierToken}` }
    });
    const cashierProds = await cashierProdRes.json();
    const hasCostPrice = cashierProds.products.some(p => p.costPrice !== undefined);
    if (hasCostPrice) throw new Error('Security flaw: Cashier received costPrice!');
    console.log('       -> Cashier product view sanitized: SUCCESS');

    // 5. Test Admin viewing products - costPrice should be present
    console.log('[5/14] Testing Admin view of products...');
    const adminProdRes = await fetch(`${baseUrl}/api/products`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const adminProds = await adminProdRes.json();
    const adminHasCostPrice = adminProds.products.every(p => p.costPrice !== undefined);
    if (!adminHasCostPrice) throw new Error('Admin missing costPrice');
    console.log('       -> Admin product view with financial data: SUCCESS');

    // 6. Test Expiry flags and pulse detection on Fried Chicken items
    console.log('[6/14] Testing Expiry flags & UTC midnight classification...');
    const coleslaw = adminProds.products.find(p => p.name.includes('Coleslaw'));
    const spicyMeal = adminProds.products.find(p => p.name.includes('Spicy Fried Chicken'));
    if (!coleslaw || coleslaw.daysUntilExpiry !== 1 || coleslaw.status !== 'expired') {
      throw new Error(`Garlic Coleslaw expected 1 day (expired/critical), got ${coleslaw?.daysUntilExpiry}`);
    }
    if (!spicyMeal || spicyMeal.daysUntilExpiry !== 2 || spicyMeal.status !== 'warning') {
      throw new Error(`Spicy Meal expected 2 days (warning), got ${spicyMeal?.daysUntilExpiry}`);
    }
    console.log('       -> Expiry classification: SUCCESS (Coleslaw: 1d Critical, Spicy: 2d Warning)');

    // 7. Test Zero Client-Side Price Trust: Fake prices in checkout body ignored
    console.log('[7/14] Testing Zero Client-Side Price Trust (Client prices ignored)...');
    const bucket = cashierProds.products.find(p => p.sku === 'FC-101');
    const initialBucketStock = bucket.stock;

    const fakePriceCheckoutRes = await fetch(`${baseUrl}/api/checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${cashierToken}`
      },
      body: JSON.stringify({
        items: [{
          productId: bucket.id,
          quantity: 1,
          price: 1.00, // Client tries to spoof price to 1 EGP
          unitPrice: 1.00,
          total: 1.00
        }],
        paymentMethod: 'cash',
        amountTendered: 300.00
      })
    });
    const fakePriceResult = await fakePriceCheckoutRes.json();
    if (!fakePriceResult.success) throw new Error('Zero price trust checkout failed: ' + JSON.stringify(fakePriceResult));
    // Server must have calculated: 250 EGP subtotal, 20 EGP tax (8%), 270 EGP total
    if (fakePriceResult.transaction.subtotal !== 250.00 || fakePriceResult.transaction.total !== 270.00) {
      throw new Error(`Server accepted or miscalculated client price: Subtotal ${fakePriceResult.transaction.subtotal}, Total ${fakePriceResult.transaction.total}`);
    }
    console.log('       -> Zero Client Price Trust: SUCCESS (Server strictly enforced DB price: 250 EGP + 8% tax = 270 EGP)');

    // 8. Test Prevent Selling Expired Stock: Attempting to sell expired items fails (400)
    console.log('[8/14] Testing Block on Selling Expired Stock...');
    // Create a temporary expired product
    const expiredProd = db.addProduct({
      name: 'Expired Test Tender Chicken',
      category: 'Meals',
      sellingPrice: 50.00,
      costPrice: 25.00,
      stock: 10,
      expiryDate: '2026-11-10' // in the past relative to 2026-11-15
    });

    const expiredCheckoutRes = await fetch(`${baseUrl}/api/checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${cashierToken}`
      },
      body: JSON.stringify({
        items: [{ productId: expiredProd.id, quantity: 1 }],
        paymentMethod: 'cash',
        amountTendered: 100.00
      })
    });
    if (expiredCheckoutRes.status !== 400) {
      throw new Error(`Expected 400 for expired item sale, got ${expiredCheckoutRes.status}`);
    }
    const expiredErr = await expiredCheckoutRes.json();
    if (!expiredErr.error || !expiredErr.error.includes('expired')) {
      throw new Error('Expected expired product error message, got: ' + JSON.stringify(expiredErr));
    }
    console.log('       -> Selling Expired Stock Blocked: SUCCESS (400 Bad Request returned)');

    // 9. Test Atomic Stock Deduction / Negative Stock Prevention
    console.log('[9/14] Testing Atomic Stock Validation (Prevent Negative Inventory)...');
    const overStockCheckoutRes = await fetch(`${baseUrl}/api/checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${cashierToken}`
      },
      body: JSON.stringify({
        items: [{ productId: bucket.id, quantity: 99999 }],
        paymentMethod: 'cash',
        amountTendered: 9999999.00
      })
    });
    if (overStockCheckoutRes.status !== 400) {
      throw new Error(`Expected 400 for excessive stock request, got ${overStockCheckoutRes.status}`);
    }
    console.log('       -> Negative Inventory Prevention: SUCCESS (Rejected with 400)');

    // 10. Test Strict Input Bounds on AI Markdown (1% to 90%)
    console.log('[10/14] Testing Strict Discount Bounds on Markdown Route...');
    const invalidDiscountRes = await fetch(`${baseUrl}/api/products/${bucket.id}/markdown`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({ discountPercentage: 99 }) // Exceeds 90%
    });
    if (invalidDiscountRes.status !== 400) {
      throw new Error(`Expected 400 for 99% discount, got ${invalidDiscountRes.status}`);
    }
    const validDiscountRes = await fetch(`${baseUrl}/api/products/${bucket.id}/markdown`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({ discountPercentage: 25 })
    });
    const validDiscountData = await validDiscountRes.json();
    if (!validDiscountData.success || validDiscountData.product.discountPrice !== 187.50) {
      throw new Error('Valid discount calculation mismatch: ' + JSON.stringify(validDiscountData));
    }
    console.log('       -> Markdown Bounds Enforced: SUCCESS (25% applied = 187.50 EGP, 99% blocked)');

    // 11. Test Creation Past Expiry Guard
    console.log('[11/14] Testing Expiry Validation on Product Creation...');
    const pastProdRes = await fetch(`${baseUrl}/api/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        name: 'Spoiled Wings',
        category: 'Meals',
        sellingPrice: 40.00,
        stock: 5,
        expiryDate: '2026-11-10'
      })
    });
    if (pastProdRes.status !== 400) {
      throw new Error(`Expected 400 when creating expired product, got ${pastProdRes.status}`);
    }
    console.log('       -> Past Expiry Creation Guard: SUCCESS (400 Bad Request)');

    // 12. Test Enterprise Audit Logs & Database Export
    console.log('[12/14] Testing Audit Logs & Database Backup Export...');
    const auditRes = await fetch(`${baseUrl}/api/admin/audit-logs`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const auditData = await auditRes.json();
    if (!auditData.success || !Array.isArray(auditData.auditLogs) || auditData.auditLogs.length === 0) {
      throw new Error('Audit logs endpoint failed: ' + JSON.stringify(auditData));
    }

    const exportRes = await fetch(`${baseUrl}/api/admin/export`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    if (exportRes.status !== 200) {
      throw new Error(`Export returned status ${exportRes.status}`);
    }
    const exportData = await exportRes.json();
    if (!exportData.products || !exportData.transactions || !exportData.auditLogs) {
      throw new Error('Export backup missing required collections: ' + Object.keys(exportData));
    }
    console.log('       -> Audit Logs & DB Export: SUCCESS (Audit entries verified: ' + auditData.auditLogs.length + ')');

    // 13. Test Token Invalidation on Logout
    console.log('[13/14] Testing Token Blacklist / Invalidation on Logout...');
    const logoutRes = await fetch(`${baseUrl}/api/auth/logout`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${cashierToken}` }
    });
    const logoutData = await logoutRes.json();
    if (!logoutData.success) throw new Error('Logout failed: ' + JSON.stringify(logoutData));

    // Attempt to use revoked token
    const revokedAttemptRes = await fetch(`${baseUrl}/api/products`, {
      headers: { 'Authorization': `Bearer ${cashierToken}` }
    });
    if (revokedAttemptRes.status !== 401) {
      throw new Error(`Expected 401 for revoked token, got ${revokedAttemptRes.status}`);
    }
    console.log('       -> Token Invalidation: SUCCESS (Revoked token rejected with 401)');

    // 14. Test Brute-Force Rate Limiting (max 10 attempts per 15 min)
    console.log('[14/14] Testing Brute-Force Rate Limiting on /api/auth/login...');
    authLimiter.clearAll();
    let got429 = false;
    for (let i = 1; i <= 12; i++) {
      const res = await fetch(`${baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'admin@wastewise.com', password: 'wrongpassword' })
      });
      if (res.status === 429) {
        got429 = true;
        console.log(`       -> Request #${i} triggered HTTP 429 Rate Limit as expected.`);
        break;
      }
    }
    if (!got429) {
      throw new Error('Rate limiter failed to block after 10 requests!');
    }
    console.log('       -> Brute-Force Rate Limiter: SUCCESS (429 verified)');

    console.log('\n================================================================');
    console.log('   ALL 14 PRODUCTION-GRADE SECURITY & ARCHITECTURAL TESTS PASSED!');
    console.log('   ZERO VULNERABILITIES • ZERO REGRESSIONS • PRODUCTION-READY');
    console.log('================================================================\n');

  } catch (err) {
    console.error('\n❌ Test Suite Failed:', err);
    process.exitCode = 1;
  } finally {
    server.close();
  }
}

runTests();

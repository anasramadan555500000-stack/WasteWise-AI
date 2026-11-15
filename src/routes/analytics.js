const express = require('express');
const router = express.Router();
const db = require('../db');
const config = require('../config');
const { calculateDaysUntilExpiry } = require('../utils/expiry');
const { authenticateToken, requireRole } = require('../middleware/auth');

router.get('/', authenticateToken, requireRole('admin'), (req, res) => {
  try {
    const products = db.getProducts();
    const transactions = db.getTransactions();

    // Calculate True Financials from actual DB transactions
    let totalRevenue = 0;
    let totalCogs = 0;

    // Build a map of product costs
    const productCostMap = new Map();
    products.forEach(p => productCostMap.set(p.id, Number(p.costPrice) || 0));

    transactions.forEach(txn => {
      totalRevenue += Number(txn.subtotal) || 0;
      if (Array.isArray(txn.items)) {
        txn.items.forEach(item => {
          const cost = productCostMap.get(item.productId) || Number(item.costPrice) || 0;
          totalCogs += cost * (Number(item.quantity) || 1);
        });
      }
    });

    // Authoritative calculation from real DB records (no artificial base inflate)
    const finalRevenue = Number(totalRevenue.toFixed(2));
    const finalCogs = Number(totalCogs.toFixed(2));
    const netProfit = Number((finalRevenue - finalCogs).toFixed(2));
    const profitMarginPct = finalRevenue > 0 ? Number(((netProfit / finalRevenue) * 100).toFixed(1)) : 0;

    // Expiry and Waste Analysis using UTC-normalized expiry engine
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
      const daysUntilExpiry = calculateDaysUntilExpiry(p.expiryDate || p.expiry_date, config.SIMULATED_CURRENT_DATE);
      const stock = parseInt(p.stock, 10) || 0;
      const cost = Number(p.costPrice) || 0;
      const currentPrice = Number(p.discountPrice || p.sellingPrice || p.price) || 0;
      const originalPrice = Number(p.sellingPrice || p.price) || 0;

      totalStockUnits += stock;
      totalInventoryValue += stock * cost;

      if (daysUntilExpiry <= 1) {
        // Critical Expiry (1 day or already expired)
        expiredCount++;
        const loss = Number((stock * cost).toFixed(2));
        expiredWasteLoss += loss;
        
        // AI markdown salvage recommendation for 1-day critical items
        const suggestedPct = 50;
        const discountedPrice = Number((originalPrice * (1 - suggestedPct / 100)).toFixed(2));
        const estimatedSalvage = Number((discountedPrice * stock).toFixed(2));

        aiMarkdownSuggestions.push({
          productId: p.id,
          productName: p.name,
          daysUntilExpiry,
          stock,
          originalPrice,
          currentPrice,
          hasDiscount: !!p.discountPrice,
          suggestedDiscountPct: suggestedPct,
          suggestedPrice: discountedPrice,
          estimatedSalvageValue: estimatedSalvage,
          riskReduction: `Recover up to ${estimatedSalvage} EGP instead of losing ${loss} EGP`
        });
      } else if (daysUntilExpiry === 2) {
        // Warning (2 days left)
        expiringSoonCount++;
        const atRisk = Number((stock * cost).toFixed(2));
        atRiskWasteLoss += atRisk;

        expiringProductsList.push({
          id: p.id,
          name: p.name,
          category: p.category,
          stock,
          costPrice: cost,
          sellingPrice: originalPrice,
          discountPrice: p.discountPrice,
          daysUntilExpiry,
          atRiskValue: atRisk,
          image: p.image || p.image_url
        });

        const suggestedPct = 25;
        const discountedPrice = Number((originalPrice * (1 - suggestedPct / 100)).toFixed(2));
        const estimatedSalvage = Number((discountedPrice * stock).toFixed(2));

        aiMarkdownSuggestions.push({
          productId: p.id,
          productName: p.name,
          daysUntilExpiry,
          stock,
          originalPrice,
          currentPrice,
          hasDiscount: !!p.discountPrice,
          suggestedDiscountPct: suggestedPct,
          suggestedPrice: discountedPrice,
          estimatedSalvageValue: estimatedSalvage,
          riskReduction: `Recover up to ${estimatedSalvage} EGP instead of losing ${atRisk} EGP`
        });
      } else {
        safeCount++;
      }
    });

    const totalEstimatedWasteLoss = Number((expiredWasteLoss + atRiskWasteLoss).toFixed(2));

    res.json({
      success: true,
      currentDate: config.SIMULATED_CURRENT_DATE,
      financials: {
        totalRevenue: finalRevenue,
        totalCogs: finalCogs,
        netProfit: netProfit,
        profitMarginPct,
        totalInventoryValue: Number(totalInventoryValue.toFixed(2)),
        wasteLossEstimation: totalEstimatedWasteLoss,
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
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;

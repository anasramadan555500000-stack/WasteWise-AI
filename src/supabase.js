const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://nxiajseyrarmmnddjmoa.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_KEY || 'sb_publishable_4l11qjmOnn0tETrS5EzbYg_4YmKbCMv';

let supabase = null;
try {
  supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  });
  console.log('[Supabase] Initialized client for URL:', SUPABASE_URL);
} catch (err) {
  console.warn('[Supabase] Failed to initialize Supabase client:', err.message);
}

/**
 * Schema Mapping Consistency:
 * Dedicated mapper converting Supabase snake_case rows to application camelCase objects.
 */
function mapSupabaseRowToProduct(row) {
  if (!row) return null;
  const sellingPrice = Number(row.price || row.selling_price || 0);
  const costPrice = Number(row.cost_price || 0);
  const discountPrice = row.discount_price !== null && row.discount_price !== undefined ? Number(row.discount_price) : null;
  const stock = parseInt(row.stock, 10) || 0;
  const expiryDate = row.expiry_date || row.expiryDate;
  const image = row.image_url || row.image || 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=600&auto=format&fit=crop&q=80';

  return {
    id: String(row.id),
    sku: row.sku || `FC-${String(row.id).replace(/\D/g, '') || '101'}`,
    name: String(row.name || ''),
    category: String(row.category || 'General'),
    costPrice,
    sellingPrice,
    price: sellingPrice,
    discountPrice,
    stock,
    minStockThreshold: 15,
    expiryDate,
    expiry_date: expiryDate,
    alertDaysBefore: parseInt(row.alert_days_before || 2, 10),
    barcode: row.barcode || `622100${String(row.id).replace(/\D/g, '') || '100'}`,
    image,
    image_url: image,
    description: String(row.description || '')
  };
}

/**
 * Dedicated mapper converting application camelCase product object to Supabase snake_case row.
 */
function mapProductToSupabaseRow(product) {
  if (!product) return null;
  const price = Number(product.discountPrice !== null && product.discountPrice !== undefined ? product.discountPrice : (product.price || product.sellingPrice || 0));
  const expiryDate = product.expiryDate || product.expiry_date;
  const image = product.image || product.image_url;

  return {
    id: String(product.id),
    name: String(product.name || '').trim(),
    category: String(product.category || 'General'),
    price,
    stock: parseInt(product.stock, 10) || 0,
    expiry_date: expiryDate,
    image_url: image,
    cost_price: Number(product.costPrice || 0)
  };
}

/**
 * Fetch all products from Supabase 'products' table.
 * Returns null if table does not exist or fetch fails, triggering fallback.
 */
async function fetchProductsFromSupabase() {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('name');

    if (error) {
      if (error.code === 'PGRST205') {
        console.info('[Supabase] Note: "public.products" table not found in schema cache. Using robust local state fallback.');
      } else {
        console.warn('[Supabase] Fetch error:', error.message);
      }
      return null;
    }

    if (!Array.isArray(data) || data.length === 0) {
      return null;
    }

    return data.map(mapSupabaseRowToProduct);
  } catch (err) {
    console.warn('[Supabase] Unexpected error fetching products:', err.message);
    return null;
  }
}

/**
 * Auto-seed or sync products into Supabase 'products' table if available.
 */
async function syncProductToSupabase(product) {
  if (!supabase) return false;
  try {
    const row = mapProductToSupabaseRow(product);
    if (!row) return false;

    const { error } = await supabase
      .from('products')
      .upsert(row, { onConflict: 'id' });

    if (error) {
      return false;
    }
    return true;
  } catch (err) {
    return false;
  }
}

/**
 * Deduct/update stock in Supabase table in real-time.
 */
async function updateSupabaseStock(productId, newStock) {
  if (!supabase) return false;
  try {
    const { error } = await supabase
      .from('products')
      .update({ stock: Math.max(0, parseInt(newStock, 10)), updated_at: new Date().toISOString() })
      .eq('id', productId);

    if (error) {
      return false;
    }
    return true;
  } catch (err) {
    return false;
  }
}

module.exports = {
  supabase,
  SUPABASE_URL,
  SUPABASE_KEY,
  mapSupabaseRowToProduct,
  mapProductToSupabaseRow,
  fetchProductsFromSupabase,
  syncProductToSupabase,
  updateSupabaseStock
};

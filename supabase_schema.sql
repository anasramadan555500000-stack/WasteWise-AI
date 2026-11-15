-- ============================================================================
-- WasteWise AI (Fried Chicken Restaurant Edition) - Supabase Database Schema
-- Project: https://nxiajseyrarmmnddjmoa.supabase.co
-- ============================================================================

-- 1. Create Products Table with required columns:
-- id, name, category, price, stock, expiry_date, image_url
CREATE TABLE IF NOT EXISTS public.products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  price NUMERIC(10, 2) NOT NULL,
  stock INTEGER NOT NULL DEFAULT 0,
  expiry_date DATE NOT NULL,
  image_url TEXT,
  cost_price NUMERIC(10, 2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- 3. Create RLS Policies for Anon & Authenticated access
DROP POLICY IF EXISTS "Allow public read access on products" ON public.products;
CREATE POLICY "Allow public read access on products"
ON public.products FOR SELECT
TO anon, authenticated
USING (true);

DROP POLICY IF EXISTS "Allow public insert on products" ON public.products;
CREATE POLICY "Allow public insert on products"
ON public.products FOR INSERT
TO anon, authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public update on products" ON public.products;
CREATE POLICY "Allow public update on products"
ON public.products FOR UPDATE
TO anon, authenticated
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public delete on products" ON public.products;
CREATE POLICY "Allow public delete on products"
ON public.products FOR DELETE
TO anon, authenticated
USING (true);

-- 4. Auto-Seed Initial Fried Chicken Mock Catalog:
INSERT INTO public.products (id, name, category, price, stock, expiry_date, image_url, cost_price)
VALUES 
  ('prod_fc_101', 'Crispy Chicken Bucket (12 Pcs)', 'Buckets', 250.00, 45, CURRENT_DATE + INTERVAL '4 days', 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=600&auto=format&fit=crop&q=80', 160.00),
  ('prod_fc_102', 'Spicy Fried Chicken Meal (3 Pcs)', 'Meals', 95.00, 120, CURRENT_DATE + INTERVAL '2 days', 'https://images.unsplash.com/photo-1569058242253-92a9c755a0ec?w=600&auto=format&fit=crop&q=80', 60.00),
  ('prod_fc_103', 'French Fries (Large)', 'Sides', 35.00, 200, CURRENT_DATE + INTERVAL '5 days', 'https://images.unsplash.com/photo-1576107232684-1279f3908594?w=600&auto=format&fit=crop&q=80', 18.00),
  ('prod_fc_104', 'Garlic Coleslaw Salad', 'Sides', 20.00, 80, CURRENT_DATE + INTERVAL '1 day', 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&auto=format&fit=crop&q=80', 10.00),
  ('prod_fc_105', 'Special Cheddar Sauce', 'Sauces', 15.00, 150, CURRENT_DATE + INTERVAL '10 days', 'https://images.unsplash.com/photo-1574894709920-11b28e7367e3?w=600&auto=format&fit=crop&q=80', 7.00),
  ('prod_fc_106', 'Soft Drink Can', 'Drinks', 20.00, 300, CURRENT_DATE + INTERVAL '60 days', 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=600&auto=format&fit=crop&q=80', 12.00)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  category = EXCLUDED.category,
  price = EXCLUDED.price,
  stock = EXCLUDED.stock,
  expiry_date = EXCLUDED.expiry_date,
  image_url = EXCLUDED.image_url;

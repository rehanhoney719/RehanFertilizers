-- Supabase Schema for Ahsan Fertilizer & Crops Store
-- Run this SQL in the Supabase SQL Editor to create all tables

-- Shops table
CREATE TABLE IF NOT EXISTS shops (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  user_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_shops_user ON shops(user_id);

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  category TEXT DEFAULT '',
  unit TEXT NOT NULL DEFAULT 'bags',
  min_stock NUMERIC(10,2) NOT NULL DEFAULT 10,
  user_id TEXT,
  shop_id BIGINT REFERENCES shops(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sales table
CREATE TABLE IF NOT EXISTS sales (
  id BIGSERIAL PRIMARY KEY,
  product_id BIGINT REFERENCES products(id) ON DELETE RESTRICT,
  quantity NUMERIC(10,2) NOT NULL,
  rate NUMERIC(10,2) NOT NULL,
  total_amount NUMERIC(12,2) NOT NULL,
  profit NUMERIC(12,2) DEFAULT 0,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  customer_name TEXT DEFAULT '',
  customer_phone TEXT DEFAULT '',
  customer_address TEXT DEFAULT '',
  payment_status TEXT NOT NULL DEFAULT 'cash' CHECK (payment_status IN ('cash', 'loan', 'partial')),
  amount_paid NUMERIC(12,2) DEFAULT 0,
  remaining_amount NUMERIC(12,2) DEFAULT 0,
  due_date DATE,
  notes TEXT DEFAULT '',
  user_id TEXT,
  shop_id BIGINT REFERENCES shops(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Purchases table
CREATE TABLE IF NOT EXISTS purchases (
  id BIGSERIAL PRIMARY KEY,
  product_id BIGINT REFERENCES products(id) ON DELETE RESTRICT,
  quantity NUMERIC(10,2) NOT NULL,
  rate NUMERIC(10,2) NOT NULL,
  total_amount NUMERIC(12,2) NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  supplier TEXT DEFAULT '',
  notes TEXT DEFAULT '',
  user_id TEXT,
  shop_id BIGINT REFERENCES shops(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Crop Purchases table
CREATE TABLE IF NOT EXISTS crop_purchases (
  id BIGSERIAL PRIMARY KEY,
  crop_type TEXT NOT NULL,
  quantity NUMERIC(10,2) NOT NULL,
  rate NUMERIC(10,2) NOT NULL,
  total_amount NUMERIC(12,2) NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  supplier TEXT DEFAULT '',
  notes TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'in_storage' CHECK (status IN ('in_storage', 'sold')),
  user_id TEXT,
  shop_id BIGINT REFERENCES shops(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default products
INSERT INTO products (name, category, unit, min_stock) VALUES
  ('Engro Urea', 'Urea', 'bags', 10),
  ('Sona Urea', 'Urea', 'bags', 10),
  ('Sona DAP', 'DAP', 'bags', 10)
ON CONFLICT (name) DO NOTHING;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_sales_date ON sales(date);
CREATE INDEX IF NOT EXISTS idx_sales_product ON sales(product_id);
CREATE INDEX IF NOT EXISTS idx_sales_payment ON sales(payment_status);
CREATE INDEX IF NOT EXISTS idx_purchases_product ON purchases(product_id);
CREATE INDEX IF NOT EXISTS idx_purchases_date ON purchases(date);
CREATE INDEX IF NOT EXISTS idx_crop_purchases_status ON crop_purchases(status);
CREATE INDEX IF NOT EXISTS idx_crop_purchases_type ON crop_purchases(crop_type);

-- User-scoped indexes
CREATE INDEX IF NOT EXISTS idx_products_user ON products(user_id);
CREATE INDEX IF NOT EXISTS idx_sales_user ON sales(user_id);
CREATE INDEX IF NOT EXISTS idx_purchases_user ON purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_crop_purchases_user ON crop_purchases(user_id);

-- Shop-scoped indexes
CREATE INDEX IF NOT EXISTS idx_products_shop ON products(shop_id);
CREATE INDEX IF NOT EXISTS idx_sales_shop ON sales(shop_id);
CREATE INDEX IF NOT EXISTS idx_purchases_shop ON purchases(shop_id);
CREATE INDEX IF NOT EXISTS idx_crop_purchases_shop ON crop_purchases(shop_id);

-- Enable Row Level Security (RLS)
ALTER TABLE shops ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE crop_purchases ENABLE ROW LEVEL SECURITY;

-- Allow all operations for authenticated and anonymous users (single-user app)
CREATE POLICY "Allow all on shops" ON shops FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on products" ON products FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on sales" ON sales FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on purchases" ON purchases FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on crop_purchases" ON crop_purchases FOR ALL USING (true) WITH CHECK (true);

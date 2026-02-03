-- Migration: Add multi-shop support
-- Run this SQL in the Supabase SQL Editor to add shop support to an existing database.
-- After running this, existing data (with shop_id = NULL) won't appear until you
-- create a default shop and assign existing rows to it (see bottom of this file).

-- 1. Create shops table
CREATE TABLE IF NOT EXISTS shops (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  user_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_shops_user ON shops(user_id);
ALTER TABLE shops ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all on shops" ON shops FOR ALL USING (true) WITH CHECK (true);

-- 2. Add shop_id column to all 4 entity tables
ALTER TABLE products ADD COLUMN IF NOT EXISTS shop_id BIGINT REFERENCES shops(id) ON DELETE CASCADE;
ALTER TABLE sales ADD COLUMN IF NOT EXISTS shop_id BIGINT REFERENCES shops(id) ON DELETE CASCADE;
ALTER TABLE purchases ADD COLUMN IF NOT EXISTS shop_id BIGINT REFERENCES shops(id) ON DELETE CASCADE;
ALTER TABLE crop_purchases ADD COLUMN IF NOT EXISTS shop_id BIGINT REFERENCES shops(id) ON DELETE CASCADE;

-- 3. Add indexes on shop_id
CREATE INDEX IF NOT EXISTS idx_products_shop ON products(shop_id);
CREATE INDEX IF NOT EXISTS idx_sales_shop ON sales(shop_id);
CREATE INDEX IF NOT EXISTS idx_purchases_shop ON purchases(shop_id);
CREATE INDEX IF NOT EXISTS idx_crop_purchases_shop ON crop_purchases(shop_id);

-- 4. Migrate existing data: create a default shop per user and assign all rows.
-- This creates a "Main Shop" for each distinct user_id found in products/sales/purchases/crop_purchases
-- and updates all their rows to point to that shop.

DO $$
DECLARE
  uid TEXT;
  new_shop_id BIGINT;
BEGIN
  FOR uid IN
    SELECT DISTINCT user_id FROM (
      SELECT user_id FROM products WHERE user_id IS NOT NULL AND shop_id IS NULL
      UNION
      SELECT user_id FROM sales WHERE user_id IS NOT NULL AND shop_id IS NULL
      UNION
      SELECT user_id FROM purchases WHERE user_id IS NOT NULL AND shop_id IS NULL
      UNION
      SELECT user_id FROM crop_purchases WHERE user_id IS NOT NULL AND shop_id IS NULL
    ) all_users
  LOOP
    INSERT INTO shops (name, user_id) VALUES ('Main Shop', uid) RETURNING id INTO new_shop_id;
    UPDATE products SET shop_id = new_shop_id WHERE user_id = uid AND shop_id IS NULL;
    UPDATE sales SET shop_id = new_shop_id WHERE user_id = uid AND shop_id IS NULL;
    UPDATE purchases SET shop_id = new_shop_id WHERE user_id = uid AND shop_id IS NULL;
    UPDATE crop_purchases SET shop_id = new_shop_id WHERE user_id = uid AND shop_id IS NULL;
  END LOOP;
END $$;

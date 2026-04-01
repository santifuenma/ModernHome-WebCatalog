-- ============================================================
-- Migration: Add stock column to product_stores
-- Run this in Supabase SQL Editor
-- ============================================================

-- 1. Add stock column (default 0 so existing rows don't break)
ALTER TABLE product_stores
    ADD COLUMN IF NOT EXISTS stock integer NOT NULL DEFAULT 0;

-- 2. Migrate existing stock from products → each product's store rows
--    (every store assignment gets the current global stock of the product)
UPDATE product_stores ps
SET stock = COALESCE(p.stock, 0)
FROM products p
WHERE ps.product_id = p.id;

-- NOTE: products.stock is kept as-is for now (backward compat).
-- It will no longer be written by the app — stock lives in product_stores.

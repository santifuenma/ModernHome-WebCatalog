-- ============================================================
-- Migration: Update valid store codes
-- Run this in Supabase SQL Editor
-- ============================================================

-- 1. Remove all inventory assignments for the deprecated 'DP' (Depósito) store
DELETE FROM product_stores WHERE store_code = 'DP';

-- 2. Drop the old check constraint (which restricted to LM, SM, DP, CT, BT)
ALTER TABLE product_stores DROP CONSTRAINT IF EXISTS product_stores_store_code_check;

-- 3. Add the new check constraint with Valencia (V) instead of Depósito (DP)
ALTER TABLE product_stores ADD CONSTRAINT product_stores_store_code_check CHECK (store_code IN ('LM', 'SM', 'V', 'CT', 'BT'));

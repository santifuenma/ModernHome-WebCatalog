-- ============================================================
-- Migration: Add missing UPDATE policy for product_stores
-- Run this in Supabase SQL Editor
-- ============================================================

-- When product_stores was created, INSERT and DELETE policies were added,
-- but the UPDATE policy was missing. UPSERT requires an UPDATE policy
-- to modify existing rows.

CREATE POLICY "product_stores_auth_update"
    ON product_stores FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Informational: you can verify all policies on product_stores with:
-- select * from pg_policies where tablename = 'product_stores';

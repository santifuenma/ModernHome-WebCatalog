-- =============================================================================
-- Migration 001: numeric dimension columns on products
--
-- products.dimensions stays as the free text shown on the product page.
-- These columns are a numeric copy derived from it (see
-- features/products/dimensions.parser.ts) used only to filter by range.
--
-- Meaning is fixed, regardless of how each product sheet labels it:
--   width_cm   front / main horizontal side  ("Largo", or "Ancho" if no "Largo")
--   depth_cm   the other horizontal side     ("Profundidad", or "Ancho" if "Largo")
--   height_cm  height                        ("Alto")
--
-- NULL = the product has no such measure (or it could not be parsed).
-- Safe to run more than once.
-- =============================================================================

ALTER TABLE products
    ADD COLUMN IF NOT EXISTS width_cm  numeric,
    ADD COLUMN IF NOT EXISTS depth_cm  numeric,
    ADD COLUMN IF NOT EXISTS height_cm numeric;

-- =============================================================================
-- Migration 002: searchable text copy of products.materials
--
-- products.materials is a text[] (one entry per line). PostgREST can only match
-- whole array elements (cs / ov), not text INSIDE them, so ilike cannot be used.
-- materials_search holds all the entries joined into a single lowercase text
-- ("madera maciza + mdf | tablero con mármol sintético | ..."), which can be
-- filtered with ilike '%keyword%'.
--
-- A trigger keeps it in sync on every insert / change of materials, whatever
-- writes the row (admin panel, scripts, SQL editor). It is only a search aid:
-- products.materials stays the source of truth shown on the product page.
--
-- Note: ilike ignores case but NOT accents ("marmol" does not match "mármol").
-- Safe to run more than once.
-- =============================================================================

ALTER TABLE products
    ADD COLUMN IF NOT EXISTS materials_search text;

CREATE OR REPLACE FUNCTION products_set_materials_search()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
    NEW.materials_search := lower(array_to_string(NEW.materials, ' | '));
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_products_materials_search ON products;

CREATE TRIGGER trg_products_materials_search
    BEFORE INSERT OR UPDATE OF materials ON products
    FOR EACH ROW EXECUTE FUNCTION products_set_materials_search();

-- Fill the products that already exist (the trigger only acts on future writes)
UPDATE products
SET materials_search = lower(array_to_string(materials, ' | '));

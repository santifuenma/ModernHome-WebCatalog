-- =============================================================================
-- Migration 003: accent-insensitive materials_search
--
-- Migration 002 made materials_search a lowercase text copy of products.materials,
-- but ilike does not ignore accents ("marmol" did not match "mármol"). From now on
-- the stored text has no accents, and the search terms lose them too
-- (see features/products/search-terms.ts), so both sides always match.
--
-- The accent table here ('áéíóúüñ') must stay identical to the one in
-- features/products/search-terms.ts. Plain translate(): no extension required.
-- Safe to run more than once.
-- =============================================================================

CREATE OR REPLACE FUNCTION products_set_materials_search()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
    NEW.materials_search := lower(translate(
        array_to_string(NEW.materials, ' | '),
        'áéíóúüñÁÉÍÓÚÜÑ', 'aeiouunAEIOUUN'
    ));
    RETURN NEW;
END;
$$;

-- Rebuild the products that already exist with the new rule
UPDATE products
SET materials_search = lower(translate(
    array_to_string(materials, ' | '),
    'áéíóúüñÁÉÍÓÚÜÑ', 'aeiouunAEIOUUN'
));

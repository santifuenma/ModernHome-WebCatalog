-- =============================================================================
-- MODERN HOME CATALOG — Database schema (reference)
-- PostgreSQL / Supabase
--
-- Reconstructed from the live Supabase project (column names and value types)
-- and from how the application code reads and writes each table. It is not a
-- pg_dump: items marked "(assumed)" could not be read from the API.
--
-- Safe to run on an existing database: every statement uses IF NOT EXISTS, so
-- tables and indexes that already exist are left untouched.
--
-- Tables
--   products                   one row per product (catalog data)
--   product_stores             stores that carry a product, with stock per store
--   product_images             gallery (Cloudinary public ids; the UI allows 4)
--   product_material_swatches  small previews of materials or finishes
--   product_downloads          downloadable file (e.g. technical sheet, 3D model)
--
-- Store codes (product_stores.store_code):
--   LM Las Mercedes | SM Santa Mónica | V Valencia | CT La Castellana | BT Barquisimeto
--   Source of truth: STORE_LABELS in features/products/product.types.ts
--
-- Notes
--   - Ambientes and subcategorías have no table: they are the distinct values
--     of products.ambiente / products.subcategoria among published products.
--   - Images live in Cloudinary; only cloudinary_public_id is stored here.
-- =============================================================================


-- =============================================================================
-- TABLE: products
-- Maps to the Product model in features/products/product.types.ts.
-- =============================================================================

CREATE TABLE IF NOT EXISTS products (

    id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Identification
    code          text        NOT NULL UNIQUE,   -- internal code (e.g. "MH-001"); key used by the Excel import (unique: assumed)
    name          text        NOT NULL,
    slug          text        NOT NULL UNIQUE,   -- URL segment (e.g. "dorian") (unique: assumed)

    -- Info
    brand         text        NOT NULL,
    designer      text,                          -- optional

    -- LEGACY single-store columns. Stores and stock now live in product_stores.
    -- The table still has them and the Excel importer keeps filling them with
    -- placeholder values, so new rows must provide them (NOT NULL: assumed).
    store         text        NOT NULL,
    stock         integer     DEFAULT 0,

    -- Catalog organisation.
    -- ambiente = 'general' means "not classified yet": the public catalog
    -- hides those products until an admin assigns a real ambiente.
    ambiente      text        NOT NULL,          -- e.g. sala, comedor, dormitorio, exterior, complementos
    subcategoria  text        NOT NULL,          -- e.g. camas, sofas, mesas

    -- External link to the product
    url           text,

    -- Characteristics (lists of free text; one entry per line in the admin form)
    dimensions    text[],
    materials     text[],

    -- Publication status. false = hidden from the public catalog.
    is_active     boolean     DEFAULT true,
    created_at    timestamp   DEFAULT now()

);


-- =============================================================================
-- TABLE: product_stores
-- Many-to-many between products and stores, with independent stock per store.
-- Written by the admin form and by the Excel importer / remover.
-- =============================================================================

CREATE TABLE IF NOT EXISTS product_stores (

    id          uuid         PRIMARY KEY DEFAULT gen_random_uuid(),

    product_id  uuid         NOT NULL REFERENCES products(id) ON DELETE CASCADE,

    -- One of: LM | SM | V | CT | BT  (no CHECK constraint is assumed)
    store_code  text         NOT NULL,

    stock       integer      NOT NULL DEFAULT 0,
    created_at  timestamptz  DEFAULT now(),

    -- Required by the upserts in the code: onConflict: 'product_id,store_code'
    UNIQUE (product_id, store_code)

);


-- =============================================================================
-- TABLE: product_images
-- One-to-many: the gallery of a product. Only the Cloudinary reference is stored.
-- =============================================================================

CREATE TABLE IF NOT EXISTS product_images (

    id                    uuid     PRIMARY KEY DEFAULT gen_random_uuid(),

    product_id            uuid     NOT NULL REFERENCES products(id) ON DELETE CASCADE,

    cloudinary_public_id  text     NOT NULL,     -- e.g. "catalogo/dorian/main"
    alt                   text,
    is_main               boolean  DEFAULT false,
    position              integer                -- display order (0 = first)

);


-- =============================================================================
-- TABLE: product_material_swatches
-- Small preview images of available materials or finishes.
-- =============================================================================

CREATE TABLE IF NOT EXISTS product_material_swatches (

    id                    uuid  PRIMARY KEY DEFAULT gen_random_uuid(),

    product_id            uuid  NOT NULL REFERENCES products(id) ON DELETE CASCADE,

    name                  text,                  -- e.g. "Lino beige"
    cloudinary_public_id  text  NOT NULL

);


-- =============================================================================
-- TABLE: product_downloads
-- Downloadable file of a product (the admin UI manages one per product).
-- =============================================================================

CREATE TABLE IF NOT EXISTS product_downloads (

    id          uuid  PRIMARY KEY DEFAULT gen_random_uuid(),

    product_id  uuid  NOT NULL REFERENCES products(id) ON DELETE CASCADE,

    name        text  NOT NULL,                  -- e.g. "Descargar modelo 3D"
    url         text  NOT NULL

);


-- =============================================================================
-- INDEXES
-- Tuned for the query patterns in features/products/product.repository.ts.
-- The public catalog always filters by is_active = true and then by ambiente or
-- subcategoria, and orders by created_at DESC.
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_products_ambiente      ON products(ambiente);
CREATE INDEX IF NOT EXISTS idx_products_subcategoria  ON products(subcategoria);
CREATE INDEX IF NOT EXISTS idx_products_is_active     ON products(is_active);

-- getProductsByAmbiente     -> WHERE is_active = true AND ambiente = X
CREATE INDEX IF NOT EXISTS idx_products_active_ambiente
    ON products(is_active, ambiente);

-- getProductsBySubcategoria -> WHERE is_active = true AND subcategoria = X
CREATE INDEX IF NOT EXISTS idx_products_active_subcategoria
    ON products(is_active, subcategoria);

-- getProductCards -> WHERE is_active = true ORDER BY created_at DESC
-- Partial index: only published products (smaller and faster to scan).
CREATE INDEX IF NOT EXISTS idx_products_active_created_at
    ON products(created_at DESC)
    WHERE is_active = true;

-- Filtering by store goes through product_stores
-- (the (product_id, store_code) UNIQUE constraint already covers lookups by product).
CREATE INDEX IF NOT EXISTS idx_product_stores_store_code ON product_stores(store_code);

-- Speed up joins from the sub-tables back to products
CREATE INDEX IF NOT EXISTS idx_product_images_product_id    ON product_images(product_id);
CREATE INDEX IF NOT EXISTS idx_product_swatches_product_id  ON product_material_swatches(product_id);
CREATE INDEX IF NOT EXISTS idx_product_downloads_product_id ON product_downloads(product_id);

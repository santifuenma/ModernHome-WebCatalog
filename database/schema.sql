-- =============================================================================
-- MODERN HOME CATALOG — Database Schema
-- Compatible with Supabase (PostgreSQL)
--
-- Aligned with the Product model defined in:
--   features/products/product.types.ts
--
-- Images are stored in Cloudinary. Only the cloudinary_public_id is stored.
-- Store codes: LM | SM | DP | CT | BT
-- =============================================================================


-- =============================================================================
-- TABLE: products
-- Main product record. Maps to the Product interface.
-- =============================================================================

CREATE TABLE products (

    id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Identification
    code                TEXT        UNIQUE NOT NULL,       -- Internal furniture code (e.g. "MH-001")
    name                TEXT        NOT NULL,
    slug                TEXT        UNIQUE NOT NULL,       -- URL segment used in routing (e.g. "dorian")

    -- Info
    brand               TEXT        NOT NULL,
    designer            TEXT,                              -- Optional (maps to Product.designer?)

    -- Store
    -- Valid codes: LM (Las Mercedes), SM (Santa Monica), DP (Depósito), CT (Castellana), BT (Barquisimeto)
    store               TEXT        NOT NULL,

    -- Stock
    stock               INTEGER     DEFAULT 0,

    -- Catalog organization (maps to Product.ambiente / Product.subcategoria)
    ambiente            TEXT        NOT NULL,              -- e.g. dormitorio, sala, comedor
    subcategoria        TEXT        NOT NULL,              -- e.g. camas, sofas, mesas

    -- Characteristics (stored as arrays — maps to Product.dimensions[] and Product.materials[])
    dimensions          TEXT[],                            -- e.g. ARRAY['200x160x90cm', 'King: 200x200cm']
    materials           TEXT[],                            -- e.g. ARRAY['Madera de roble', 'Tela lino']

    -- Status
    is_active           BOOLEAN     DEFAULT TRUE,
    created_at          TIMESTAMP   DEFAULT NOW()

);


-- =============================================================================
-- TABLE: product_images
-- One-to-many: each product can have multiple images (max 4 in the UI).
-- Maps to ProductImage { url, alt, isMain }.
-- Only stores cloudinary_public_id, NOT binary data.
-- =============================================================================

CREATE TABLE product_images (

    id                      UUID    PRIMARY KEY DEFAULT gen_random_uuid(),

    product_id              UUID    REFERENCES products(id) ON DELETE CASCADE,

    -- Cloudinary reference only (e.g. "catalogo/dorian/main")
    cloudinary_public_id    TEXT    NOT NULL,

    alt                     TEXT,                   -- Maps to ProductImage.alt
    is_main                 BOOLEAN DEFAULT FALSE,  -- Maps to ProductImage.isMain
    position                INTEGER                 -- Display order (0 = first)

);


-- =============================================================================
-- TABLE: product_material_swatches
-- Small preview images of available materials or finishes.
-- Maps to MaterialSwatch { name, image }.
-- =============================================================================

CREATE TABLE product_material_swatches (

    id                      UUID    PRIMARY KEY DEFAULT gen_random_uuid(),

    product_id              UUID    REFERENCES products(id) ON DELETE CASCADE,

    name                    TEXT,                   -- Maps to MaterialSwatch.name (e.g. "Lino beige")

    -- Cloudinary reference (maps to MaterialSwatch.image)
    cloudinary_public_id    TEXT    NOT NULL

);


-- =============================================================================
-- TABLE: product_downloads
-- Downloadable files such as 3D models.
-- Maps to ProductDownload { name, url }.
-- =============================================================================

CREATE TABLE product_downloads (

    id          UUID    PRIMARY KEY DEFAULT gen_random_uuid(),

    product_id  UUID    REFERENCES products(id) ON DELETE CASCADE,

    name        TEXT    NOT NULL,   -- Maps to ProductDownload.name (e.g. "Descargar modelo 3D")
    url         TEXT    NOT NULL    -- Maps to ProductDownload.url

);


-- =============================================================================
-- INDEXES
-- Optimized for catalog filtering patterns used in the service layer:
--   getProductsByAmbiente(ambiente)
--   getProductsBySubcategoria(subcategoria)
-- =============================================================================

CREATE INDEX idx_products_slug          ON products(slug);
CREATE INDEX idx_products_ambiente      ON products(ambiente);
CREATE INDEX idx_products_subcategoria  ON products(subcategoria);
CREATE INDEX idx_products_store         ON products(store);
CREATE INDEX idx_products_is_active     ON products(is_active);

-- Speed up joins from sub-tables back to products
CREATE INDEX idx_product_images_product_id      ON product_images(product_id);
CREATE INDEX idx_product_swatches_product_id    ON product_material_swatches(product_id);
CREATE INDEX idx_product_downloads_product_id   ON product_downloads(product_id);

-- =============================================================================
-- COMPOSITE & PARTIAL INDEXES (optimized for 4000+ products)
-- The catalog always filters with is_active = true AND (ambiente OR subcategoria).
-- Composite indexes are faster than two separate indexes for these patterns.
-- =============================================================================

-- Used by: getProductsByAmbiente → WHERE is_active = true AND ambiente = X
CREATE INDEX idx_products_active_ambiente
    ON products(is_active, ambiente);

-- Used by: getProductsBySubcategoria → WHERE is_active = true AND subcategoria = X
CREATE INDEX idx_products_active_subcategoria
    ON products(is_active, subcategoria);

-- Used by: getProductsByStore → WHERE is_active = true AND store = X
CREATE INDEX idx_products_active_store
    ON products(is_active, store);

-- Partial index: only indexes active products (smaller index, faster scans).
-- Used by: getProductCards → WHERE is_active = true ORDER BY created_at DESC
CREATE INDEX idx_products_active_created_at
    ON products(created_at DESC)
    WHERE is_active = true;

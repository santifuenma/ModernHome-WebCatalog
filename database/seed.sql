-- =============================================================================
-- MODERN HOME CATALOG — Seed Data
-- Ejecutar en Supabase SQL Editor DESPUÉS de haber cargado schema.sql
--
-- IMPORTANTE: Las imágenes usan cloudinary_public_id.
-- Sube las imágenes a Cloudinary con la estructura:
--   catalogo/[slug]/[nombre]
-- Ejemplo: catalogo/dorian/main
-- =============================================================================


-- =============================================================================
-- PRODUCTO: Dorian (Novaluna)
-- =============================================================================

-- 1. Insertar el producto principal
INSERT INTO products (
    code,
    name,
    slug,
    brand,
    designer,
    store,                              -- Columna heredada (modelo de una sola tienda): la tabla aún la exige
    stock,                              -- Columna heredada: el stock real por tienda está en product_stores (paso 1b)
    ambiente,
    subcategoria,
    dimensions,
    materials,
    is_active
) VALUES (
    'MH-001',
    'Dorian',
    'dorian',
    'Novaluna',
    NULL,
    'LM',                               -- Tienda por defecto: Las Mercedes
    1,
    'dormitorio',
    'camas',
    ARRAY[
        'Ancho: 178 cm',
        'Largo: 215 cm',
        'Altura cabecero: 95 cm',
        'Altura base: 35 cm',
        'Tamaño King'
    ],
    ARRAY[
        'Tapizado textil o semipiel seleccionable',
        'Estructura acolchada',
        'Patas metálicas'
    ],
    TRUE
);


-- 1b. Asignar el producto a su tienda con su stock
-- Códigos de tienda: LM | SM | V | CT | BT

INSERT INTO product_stores (product_id, store_code, stock)
VALUES (
    (SELECT id FROM products WHERE slug = 'dorian'),
    'LM',                               -- Las Mercedes
    1
);


-- 2. Insertar las imágenes del producto
-- NOTA: Reemplaza los cloudinary_public_id con los IDs reales
--       después de subir las imágenes a Cloudinary.
--       Estructura sugerida: catalogo/[slug]/[posicion]

INSERT INTO product_images (product_id, cloudinary_public_id, alt, is_main, position)
VALUES
    (
        (SELECT id FROM products WHERE slug = 'dorian'),
        'catalogo/dorian/main',         -- Subir: dorian-novaluna.jpg
        'Dorian bed',
        TRUE,
        0
    ),
    (
        (SELECT id FROM products WHERE slug = 'dorian'),
        'catalogo/dorian/side',         -- Subir: dorian-novaluna-2.jpg
        'Dorian side',
        FALSE,
        1
    ),
    (
        (SELECT id FROM products WHERE slug = 'dorian'),
        'catalogo/dorian/detail',       -- Subir: dorian-novaluna-3.jpg
        'Dorian detail',
        FALSE,
        2
    );


-- 3. Insertar los swatches de materiales

INSERT INTO product_material_swatches (product_id, name, cloudinary_public_id)
VALUES
    (
        (SELECT id FROM products WHERE slug = 'dorian'),
        'Tela azul',
        'catalogo/dorian/swatches/azul'     -- Subir: blue.jpg
    ),
    (
        (SELECT id FROM products WHERE slug = 'dorian'),
        'Tela gris',
        'catalogo/dorian/swatches/gris'     -- Subir: grey.jpg
    );


-- 4. Insertar el archivo descargable

INSERT INTO product_downloads (product_id, name, url)
VALUES
    (
        (SELECT id FROM products WHERE slug = 'dorian'),
        'Descargar modelo 3D',
        '/downloads/dorian.glb'
    );


-- =============================================================================
-- VERIFICACIÓN
-- Ejecuta esto para confirmar que los datos se insertaron correctamente:
-- =============================================================================
-- SELECT p.name, p.slug, p.ambiente, p.subcategoria,
--        COUNT(DISTINCT pst.id) AS stores,
--        COUNT(DISTINCT pi.id) AS images,
--        COUNT(DISTINCT ps.id) AS swatches,
--        COUNT(DISTINCT pd.id) AS downloads
-- FROM products p
-- LEFT JOIN product_stores pst ON pst.product_id = p.id
-- LEFT JOIN product_images pi ON pi.product_id = p.id
-- LEFT JOIN product_material_swatches ps ON ps.product_id = p.id
-- LEFT JOIN product_downloads pd ON pd.product_id = p.id
-- GROUP BY p.id, p.name, p.slug, p.ambiente, p.subcategoria;

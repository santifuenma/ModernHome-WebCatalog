-- ============================================================
-- MIGRACIÓN: product_stores (many-to-many entre products y stores)
-- ============================================================
-- Ejecutar esto en el SQL Editor de Supabase.
--
-- ¿Qué hace este script?
--  1. Crea la tabla junction `product_stores`
--  2. Migra los datos del campo `store` existente en `products`
--     a la nueva tabla (para no perder la asignación actual)
--  3. (Opcional) El campo `store` se mantiene en `products` 
--     pero ya no se usa para la lógica de tiendas. Puedes 
--     borrarlo más adelante si quieres limpiar el esquema.
-- ============================================================

-- 1. Crear la tabla junction
CREATE TABLE IF NOT EXISTS product_stores (
    id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id  uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    store_code  text NOT NULL CHECK (store_code IN ('LM', 'SM', 'DP', 'CT', 'BT')),
    created_at  timestamptz DEFAULT now(),
    UNIQUE (product_id, store_code)
);

-- 2. Habilitar RLS (Row-Level Security) igual que el resto de tablas
ALTER TABLE product_stores ENABLE ROW LEVEL SECURITY;

-- 3. Política de lectura pública (los usuarios no autenticados pueden ver las tiendas de un producto)
CREATE POLICY "product_stores_public_read"
    ON product_stores FOR SELECT
    USING (true);

-- 4. Políticas de escritura solo para usuarios autenticados (admin)
CREATE POLICY "product_stores_auth_insert"
    ON product_stores FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "product_stores_auth_delete"
    ON product_stores FOR DELETE
    TO authenticated
    USING (true);

-- 5. Migrar datos existentes: copiar el campo `store` de cada producto a la nueva tabla
--    Solo migra productos que tienen un valor de store no nulo
INSERT INTO product_stores (product_id, store_code)
SELECT id, store
FROM products
WHERE store IS NOT NULL
  AND store IN ('LM', 'SM', 'DP', 'CT', 'BT')
ON CONFLICT (product_id, store_code) DO NOTHING;

-- ============================================================
-- VERIFICACIÓN (opcional — ejecutar aparte para confirmar)
-- ============================================================
-- SELECT p.code, ps.store_code 
-- FROM products p
-- JOIN product_stores ps ON ps.product_id = p.id
-- ORDER BY p.code;

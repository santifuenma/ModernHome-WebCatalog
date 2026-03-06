import { createSupabaseServerClient } from '@/infrastructure/supabase/server'
import { Product, ProductCard, ProductImage, MaterialSwatch, ProductDownload } from './product.types'

/**
 * product.repository.ts
 * Capa de acceso a datos — hace las queries directas a Supabase.
 * El service layer llama a estas funciones; los componentes nunca llaman aquí directamente.
 *
 * Cada función devuelve los datos ya mapeados al tipo TypeScript correspondiente.
 */

// ─── Row types (shape of raw Supabase rows) ───────────────────────────────────

interface ProductRow {
    id: string
    code: string | null
    name: string
    slug: string
    brand: string
    designer: string | null
    store: string | null
    stock: number | null
    ambiente: string
    subcategoria: string
    dimensions: string[] | null
    materials: string[] | null
    is_active: boolean | null
    created_at: string | null
    product_images: ImageRow[]
    product_material_swatches: SwatchRow[]
    product_downloads: DownloadRow[]
}

interface ImageRow {
    id: string
    cloudinary_public_id: string
    alt: string | null
    is_main: boolean | null
    position: number | null
}

interface SwatchRow {
    id: string
    name: string | null
    cloudinary_public_id: string
}

interface DownloadRow {
    id: string
    name: string
    url: string
}

// ─── Cloudinary URL builder ────────────────────────────────────────────────────

/**
 * buildCloudinaryUrl
 * Constructs the full Cloudinary URL from a public_id.
 * The DB stores only the public_id; the full URL is built here in the repository.
 */
function buildCloudinaryUrl(publicId: string): string {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
    // f_auto → Cloudinary serves the correct format (jpg, webp, avif) automatically
    // q_auto → Optimizes quality automatically
    return `https://res.cloudinary.com/${cloudName}/image/upload/f_auto,q_auto/${publicId}`
}

// ─── Row → TypeScript mappers ─────────────────────────────────────────────────

/**
 * toProduct
 * Maps a raw Supabase row (with nested sub-tables) to the Product interface.
 */
function toProduct(row: ProductRow): Product {
    return {
        id: row.id,
        code: row.code ?? undefined,
        name: row.name,
        slug: row.slug,
        brand: row.brand,
        designer: row.designer ?? undefined,
        store: row.store as Product['store'],
        stock: row.stock ?? undefined,
        ambiente: row.ambiente,
        subcategoria: row.subcategoria,
        dimensions: row.dimensions ?? [],
        materials: row.materials ?? [],
        is_active: row.is_active ?? true,
        created_at: row.created_at ?? undefined,
        images: (row.product_images ?? [])
            .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
            .map((img): ProductImage => ({
                url: buildCloudinaryUrl(img.cloudinary_public_id),
                alt: img.alt ?? undefined,
                isMain: img.is_main ?? false,
            })),
        materialSwatches: (row.product_material_swatches ?? [])
            .map((s): MaterialSwatch => ({
                name: s.name ?? undefined,
                image: buildCloudinaryUrl(s.cloudinary_public_id),
            })),
        download: row.product_downloads?.[0]
            ? { name: row.product_downloads[0].name, url: row.product_downloads[0].url } as ProductDownload
            : undefined,
    }
}

/**
 * toProductCard
 * Maps a raw row to the lightweight ProductCard used in grids.
 */
function toProductCard(row: ProductRow): ProductCard {
    const mainImage = row.product_images?.find(img => img.is_main) ?? row.product_images?.[0]
    return {
        id: row.id,
        name: row.name,
        slug: row.slug,
        brand: row.brand,
        ambiente: row.ambiente,
        subcategoria: row.subcategoria,
        image: mainImage ? buildCloudinaryUrl(mainImage.cloudinary_public_id) : '',
    }
}

// ─── Base query (reused in all list queries) ──────────────────────────────────

const PRODUCT_SELECT = `
    *,
    product_images ( id, cloudinary_public_id, alt, is_main, position ),
    product_material_swatches ( id, name, cloudinary_public_id ),
    product_downloads ( id, name, url )
`

// ─── Repository functions ─────────────────────────────────────────────────────

/**
 * dbGetAllProducts
 * Returns ALL active products (used by the main catalog page).
 */
export async function dbGetAllProducts(): Promise<ProductCard[]> {
    const supabase = await createSupabaseServerClient()
    const { data, error } = await supabase
        .from('products')
        .select(PRODUCT_SELECT)
        .eq('is_active', true)
        .order('created_at', { ascending: false })

    if (error) throw new Error(`dbGetAllProducts: ${error.message}`)
    return (data as ProductRow[]).map(toProductCard)
}

/**
 * dbGetProductsByAmbiente
 * Returns active products filtered by ambiente.
 */
export async function dbGetProductsByAmbiente(ambiente: string): Promise<ProductCard[]> {
    const supabase = await createSupabaseServerClient()
    const { data, error } = await supabase
        .from('products')
        .select(PRODUCT_SELECT)
        .eq('ambiente', ambiente)
        .eq('is_active', true)
        .order('created_at', { ascending: false })

    if (error) throw new Error(`dbGetProductsByAmbiente: ${error.message}`)
    return (data as ProductRow[]).map(toProductCard)
}

/**
 * dbGetProductsBySubcategoria
 * Returns active products filtered by subcategoria.
 */
export async function dbGetProductsBySubcategoria(subcategoria: string): Promise<ProductCard[]> {
    const supabase = await createSupabaseServerClient()
    const { data, error } = await supabase
        .from('products')
        .select(PRODUCT_SELECT)
        .eq('subcategoria', subcategoria)
        .eq('is_active', true)
        .order('created_at', { ascending: false })

    if (error) throw new Error(`dbGetProductsBySubcategoria: ${error.message}`)
    return (data as ProductRow[]).map(toProductCard)
}

/**
 * dbGetProductBySlug
 * Returns the full Product detail by slug.
 */
export async function dbGetProductBySlug(slug: string): Promise<Product | null> {
    const supabase = await createSupabaseServerClient()
    const { data, error } = await supabase
        .from('products')
        .select(PRODUCT_SELECT)
        .eq('slug', slug)
        .eq('is_active', true)
        .single()

    if (error) return null
    return toProduct(data as ProductRow)
}

/**
 * dbGetProductsByStore
 * Returns products for a specific store code (LM, SM, DP, CT, BT).
 */
export async function dbGetProductsByStore(store: string): Promise<ProductCard[]> {
    const supabase = await createSupabaseServerClient()
    const { data, error } = await supabase
        .from('products')
        .select(PRODUCT_SELECT)
        .eq('store', store)
        .eq('is_active', true)

    if (error) throw new Error(`dbGetProductsByStore: ${error.message}`)
    return (data as ProductRow[]).map(toProductCard)
}

/**
 * dbGetProductsInStock
 * Returns products with stock > 0.
 */
export async function dbGetProductsInStock(): Promise<ProductCard[]> {
    const supabase = await createSupabaseServerClient()
    const { data, error } = await supabase
        .from('products')
        .select(PRODUCT_SELECT)
        .gt('stock', 0)
        .eq('is_active', true)

    if (error) throw new Error(`dbGetProductsInStock: ${error.message}`)
    return (data as ProductRow[]).map(toProductCard)
}

/**
 * dbGetInactiveProducts
 * Returns products marked as inactive (for admin use).
 */
export async function dbGetInactiveProducts(): Promise<ProductCard[]> {
    const supabase = await createSupabaseServerClient()
    const { data, error } = await supabase
        .from('products')
        .select(PRODUCT_SELECT)
        .eq('is_active', false)

    if (error) throw new Error(`dbGetInactiveProducts: ${error.message}`)
    return (data as ProductRow[]).map(toProductCard)
}

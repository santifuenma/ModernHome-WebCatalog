import { createSupabaseServerClient } from '@/infrastructure/supabase/server'
import { Product, ProductCard, ProductImage, MaterialSwatch, ProductDownload } from './product.types'

/**
 * product.repository.ts
 * Capa de acceso a datos — hace las queries directas a Supabase.
 * El service layer llama a estas funciones; los componentes nunca llaman aquí directamente.
 *
 * Paginación real: usa .range() en la DB — nunca se traen más filas de las necesarias.
 * Select mínimo: PRODUCT_CARD_SELECT solo trae los campos necesarios para la grilla.
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

// Fila ligera para la grilla — solo campos de ProductCard + imagen principal
interface ProductCardRow {
    id: string
    name: string
    slug: string
    brand: string
    ambiente: string
    subcategoria: string
    product_images: Pick<ImageRow, 'cloudinary_public_id' | 'is_main'>[]
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

// ─── Resultado paginado ───────────────────────────────────────────────────────

export interface PaginatedProducts {
    items: ProductCard[]
    totalItems: number
}

// ─── Cloudinary URL builder ────────────────────────────────────────────────────

/**
 * buildCloudinaryUrl
 * Constructs the full Cloudinary URL from a public_id.
 * The DB stores only the public_id; the full URL is built here in the repository.
 *
 * f_auto → Cloudinary serves the correct format (jpg, webp, avif) automatically
 * q_auto → Optimizes quality automatically
 * c_limit,w_800 → Cap width at 800px for card images (saves bandwidth on grids)
 */
function buildCloudinaryUrl(publicId: string, forCard = false): string {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
    // Se quita c_limit,w_800 para evitar pixelaciones si next/image pide resoluciones grandes.
    // Dejamos que next/image de Next.js haga el sizing responsive basado en los "sizes" props.
    const transforms = 'f_auto,q_auto'
    return `https://res.cloudinary.com/${cloudName}/image/upload/${transforms}/${publicId}`
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
                id: img.id,
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
 * Maps a lightweight card row to the ProductCard used in grids.
 */
function toProductCard(row: ProductCardRow): ProductCard {
    const mainImage = row.product_images?.find(img => img.is_main) ?? row.product_images?.[0]
    return {
        id: row.id,
        name: row.name,
        slug: row.slug,
        brand: row.brand,
        ambiente: row.ambiente,
        subcategoria: row.subcategoria,
        image: mainImage ? buildCloudinaryUrl(mainImage.cloudinary_public_id, true) : '',
    }
}

// ─── Select strings ────────────────────────────────────────────────────────────

/**
 * PRODUCT_CARD_SELECT
 * Select mínimo para la grilla del catálogo.
 * Solo trae los campos que necesita ProductCard + la imagen principal.
 * NO incluye swatches ni downloads (reducción ~60% de datos transferidos).
 */
const PRODUCT_CARD_SELECT = `
    id,
    name,
    slug,
    brand,
    ambiente,
    subcategoria,
    product_images ( cloudinary_public_id, is_main )
`

/**
 * PRODUCT_FULL_SELECT
 * Select completo para la página de detalle de producto.
 */
const PRODUCT_FULL_SELECT = `
    *,
    product_images ( id, cloudinary_public_id, alt, is_main, position ),
    product_material_swatches ( id, name, cloudinary_public_id ),
    product_downloads ( id, name, url )
`

// ─── Repository functions ─────────────────────────────────────────────────────

/**
 * dbGetAllProducts
 * Returns paginated active products for the main catalog page.
 * Uses DB-level .range() — never fetches more rows than needed.
 */
export async function dbGetAllProducts(page: number, pageSize: number): Promise<PaginatedProducts> {
    const supabase = await createSupabaseServerClient()
    const from = (page - 1) * pageSize
    const to = from + pageSize - 1

    const [dataResult, countResult] = await Promise.all([
        supabase
            .from('products')
            .select(PRODUCT_CARD_SELECT)
            .eq('is_active', true)
            .not('product_images', 'is', null)
            .order('created_at', { ascending: false })
            .range(from, to),
        supabase
            .from('products')
            .select('id', { count: 'exact', head: true })
            .eq('is_active', true)
            .not('product_images', 'is', null),
    ])

    if (dataResult.error) throw new Error(`dbGetAllProducts: ${dataResult.error.message}`)
    return {
        items: (dataResult.data as ProductCardRow[]).map(toProductCard),
        totalItems: countResult.count ?? 0,
    }
}

/**
 * dbGetProductsByAmbiente
 * Returns paginated active products filtered by ambiente.
 */
export async function dbGetProductsByAmbiente(
    ambiente: string,
    page: number,
    pageSize: number,
): Promise<PaginatedProducts> {
    const supabase = await createSupabaseServerClient()
    const from = (page - 1) * pageSize
    const to = from + pageSize - 1

    const [dataResult, countResult] = await Promise.all([
        supabase
            .from('products')
            .select(PRODUCT_CARD_SELECT)
            .eq('ambiente', ambiente)
            .eq('is_active', true)
            .not('product_images', 'is', null)
            .order('created_at', { ascending: false })
            .range(from, to),
        supabase
            .from('products')
            .select('id', { count: 'exact', head: true })
            .eq('ambiente', ambiente)
            .eq('is_active', true)
            .not('product_images', 'is', null),
    ])

    if (dataResult.error) throw new Error(`dbGetProductsByAmbiente: ${dataResult.error.message}`)
    return {
        items: (dataResult.data as ProductCardRow[]).map(toProductCard),
        totalItems: countResult.count ?? 0,
    }
}

/**
 * dbGetProductsBySubcategoria
 * Returns paginated active products filtered by subcategoria.
 */
export async function dbGetProductsBySubcategoria(
    subcategoria: string,
    page: number,
    pageSize: number,
): Promise<PaginatedProducts> {
    const supabase = await createSupabaseServerClient()
    const from = (page - 1) * pageSize
    const to = from + pageSize - 1

    const [dataResult, countResult] = await Promise.all([
        supabase
            .from('products')
            .select(PRODUCT_CARD_SELECT)
            .eq('subcategoria', subcategoria)
            .eq('is_active', true)
            .not('product_images', 'is', null)
            .order('created_at', { ascending: false })
            .range(from, to),
        supabase
            .from('products')
            .select('id', { count: 'exact', head: true })
            .eq('subcategoria', subcategoria)
            .eq('is_active', true)
            .not('product_images', 'is', null),
    ])

    if (dataResult.error) throw new Error(`dbGetProductsBySubcategoria: ${dataResult.error.message}`)
    return {
        items: (dataResult.data as ProductCardRow[]).map(toProductCard),
        totalItems: countResult.count ?? 0,
    }
}

/**
 * dbGetProductBySlug
 * Returns the full Product detail by slug.
 */
export async function dbGetProductBySlug(slug: string): Promise<Product | null> {
    const supabase = await createSupabaseServerClient()
    const { data, error } = await supabase
        .from('products')
        .select(PRODUCT_FULL_SELECT)
        .eq('slug', slug)
        .eq('is_active', true)
        .single()

    if (error) return null
    return toProduct(data as ProductRow)
}

/**
 * dbGetProductById
 * Returns the full Product detail by ID (Useful for Admin).
 */
export async function dbGetProductById(id: string): Promise<Product | null> {
    const supabase = await createSupabaseServerClient()
    const { data, error } = await supabase
        .from('products')
        .select(PRODUCT_FULL_SELECT)
        .eq('id', id)
        .single()

    if (error) return null
    return toProduct(data as ProductRow)
}

/**
 * dbGetProductsByStore
 * Returns paginated products for a specific store code (LM, SM, DP, CT, BT).
 */
export async function dbGetProductsByStore(
    store: string,
    page: number,
    pageSize: number,
): Promise<PaginatedProducts> {
    const supabase = await createSupabaseServerClient()
    const from = (page - 1) * pageSize
    const to = from + pageSize - 1

    const [dataResult, countResult] = await Promise.all([
        supabase
            .from('products')
            .select(PRODUCT_CARD_SELECT)
            .eq('store', store)
            .eq('is_active', true)
            .range(from, to),
        supabase
            .from('products')
            .select('id', { count: 'exact', head: true })
            .eq('store', store)
            .eq('is_active', true),
    ])

    if (dataResult.error) throw new Error(`dbGetProductsByStore: ${dataResult.error.message}`)
    return {
        items: (dataResult.data as ProductCardRow[]).map(toProductCard),
        totalItems: countResult.count ?? 0,
    }
}

/**
 * dbGetProductsInStock
 * Returns paginated products with stock > 0.
 */
export async function dbGetProductsInStock(
    page: number,
    pageSize: number,
): Promise<PaginatedProducts> {
    const supabase = await createSupabaseServerClient()
    const from = (page - 1) * pageSize
    const to = from + pageSize - 1

    const [dataResult, countResult] = await Promise.all([
        supabase
            .from('products')
            .select(PRODUCT_CARD_SELECT)
            .gt('stock', 0)
            .eq('is_active', true)
            .range(from, to),
        supabase
            .from('products')
            .select('id', { count: 'exact', head: true })
            .gt('stock', 0)
            .eq('is_active', true),
    ])

    if (dataResult.error) throw new Error(`dbGetProductsInStock: ${dataResult.error.message}`)
    return {
        items: (dataResult.data as ProductCardRow[]).map(toProductCard),
        totalItems: countResult.count ?? 0,
    }
}

/**
 * dbGetInactiveProducts
 * Returns paginated products marked as inactive (for admin use).
 */
export async function dbGetInactiveProducts(
    page: number,
    pageSize: number,
): Promise<PaginatedProducts> {
    const supabase = await createSupabaseServerClient()
    const from = (page - 1) * pageSize
    const to = from + pageSize - 1

    const [dataResult, countResult] = await Promise.all([
        supabase
            .from('products')
            .select(PRODUCT_CARD_SELECT)
            .eq('is_active', false)
            .range(from, to),
        supabase
            .from('products')
            .select('id', { count: 'exact', head: true })
            .eq('is_active', false),
    ])

    if (dataResult.error) throw new Error(`dbGetInactiveProducts: ${dataResult.error.message}`)
    return {
        items: (dataResult.data as ProductCardRow[]).map(toProductCard),
        totalItems: countResult.count ?? 0,
    }
}

// ─── ADMIN CRUD FUNCTIONS ──────────────────────────────────────────────────────

/**
 * dbSearchProductsAdmin
 * Searches products by code (exact) or name (partial, case-insensitive).
 * Ignores active status to allow managing all products.
 */
export async function dbSearchProductsAdmin(
    query: string,
    page: number,
    pageSize: number
): Promise<PaginatedProducts> {
    const supabase = await createSupabaseServerClient()
    const from = (page - 1) * pageSize
    const to = from + pageSize - 1

    const searchQuery = `%${query}%`

    const [dataResult, countResult] = await Promise.all([
        supabase
            .from('products')
            .select(PRODUCT_CARD_SELECT)
            .or(`code.eq."${query}",name.ilike."${searchQuery}"`)
            .order('created_at', { ascending: false })
            .range(from, to),
        supabase
            .from('products')
            .select('id', { count: 'exact', head: true })
            .or(`code.eq."${query}",name.ilike."${searchQuery}"`),
    ])

    if (dataResult.error) throw new Error(`dbSearchProductsAdmin: ${dataResult.error.message}`)
    return {
        items: (dataResult.data as ProductCardRow[]).map(toProductCard),
        totalItems: countResult.count ?? 0,
    }
}

/**
 * dbCreateProduct
 * Inserts a new product into the database.
 */
export async function dbCreateProduct(productData: any): Promise<string> {
    const supabase = await createSupabaseServerClient()
    const { data, error } = await supabase
        .from('products')
        .insert(productData)
        .select('id')
        .single()

    if (error) throw new Error(`dbCreateProduct: ${error.message}`)
    return data.id
}

/**
 * dbUpdateProduct
 * Updates an existing product.
 */
export async function dbUpdateProduct(id: string, productData: any): Promise<void> {
    const supabase = await createSupabaseServerClient()
    const { error } = await supabase
        .from('products')
        .update(productData)
        .eq('id', id)

    if (error) throw new Error(`dbUpdateProduct: ${error.message}`)
}

/**
 * dbDeleteProduct
 * Deletes a product. Related images and data cascade delete automatically.
 */
export async function dbDeleteProduct(id: string): Promise<void> {
    const supabase = await createSupabaseServerClient()
    const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id)

    if (error) throw new Error(`dbDeleteProduct: ${error.message}`)
}

/**
 * dbAddProductImage
 * Links a Cloudinary image to a product.
 */
export async function dbAddProductImage(productId: string, cloudinaryPublicId: string, isMain: boolean = false): Promise<string> {
    const supabase = await createSupabaseServerClient()
    
    // Si la nueva imagen es principal, quitar la flag is_main del resto
    if (isMain) {
        await supabase
            .from('product_images')
            .update({ is_main: false })
            .eq('product_id', productId)
    }

    const { data, error } = await supabase
        .from('product_images')
        .insert({
            product_id: productId,
            cloudinary_public_id: cloudinaryPublicId,
            is_main: isMain,
            position: 0
        })
        .select('id')
        .single()

    if (error) throw new Error(`dbAddProductImage: ${error.message}`)
    return data.id
}

/**
 * dbRemoveProductImage
 * Removes an image link from the database.
 */
export async function dbRemoveProductImage(imageId: string): Promise<void> {
    const supabase = await createSupabaseServerClient()
    const { error } = await supabase
        .from('product_images')
        .delete()
        .eq('id', imageId)

    if (error) throw new Error(`dbRemoveProductImage: ${error.message}`)
}

/**
 * dbAddProductSwatch
 */
export async function dbAddProductSwatch(productId: string, name: string | null, cloudinaryPublicId: string): Promise<string> {
    const supabase = await createSupabaseServerClient()
    const { data, error } = await supabase
        .from('product_material_swatches')
        .insert({
            product_id: productId,
            name: name,
            cloudinary_public_id: cloudinaryPublicId,
        })
        .select('id')
        .single()

    if (error) throw new Error(`dbAddProductSwatch: ${error.message}`)
    return data.id
}

/**
 * dbRemoveProductSwatch
 */
export async function dbRemoveProductSwatch(swatchId: string): Promise<void> {
    const supabase = await createSupabaseServerClient()
    const { error } = await supabase
        .from('product_material_swatches')
        .delete()
        .eq('id', swatchId)

    if (error) throw new Error(`dbRemoveProductSwatch: ${error.message}`)
}

/**
 * dbSetProductDownload
 * Upserts a single download link per product.
 */
export async function dbSetProductDownload(productId: string, name: string, url: string): Promise<void> {
    const supabase = await createSupabaseServerClient()
    // Borrar el anterior si existe (por simplicidad, nuestra UI maneja 1 solo descargable)
    await supabase.from('product_downloads').delete().eq('product_id', productId)
    
    const { error } = await supabase
        .from('product_downloads')
        .insert({
            product_id: productId,
            name: name,
            url: url
        })

    if (error) throw new Error(`dbSetProductDownload: ${error.message}`)
}

/**
 * dbRemoveProductDownload
 */
export async function dbRemoveProductDownload(productId: string): Promise<void> {
    const supabase = await createSupabaseServerClient()
    const { error } = await supabase
        .from('product_downloads')
        .delete()
        .eq('product_id', productId)

    if (error) throw new Error(`dbRemoveProductDownload: ${error.message}`)
}

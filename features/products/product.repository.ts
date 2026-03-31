import { createSupabaseServerClient } from '@/infrastructure/supabase/server'
import { Product, ProductCard, ProductImage, MaterialSwatch, ProductDownload, StoreCode } from './product.types'

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
    stock: number | null
    ambiente: string
    subcategoria: string
    dimensions: string[] | null
    materials: string[] | null
    url: string | null
    is_active: boolean | null
    created_at: string | null
    product_images: ImageRow[]
    product_material_swatches: SwatchRow[]
    product_downloads: DownloadRow[]
    product_stores: ProductStoreRow[]
}

// Fila ligera para la grilla — solo campos de ProductCard + imagen principal
interface ProductCardRow {
    id: string
    name: string
    slug: string
    brand: string
    ambiente: string
    subcategoria: string
    is_active: boolean | null
    product_images: Pick<ImageRow, 'cloudinary_public_id' | 'is_main'>[]
    product_stores: Pick<ProductStoreRow, 'store_code'>[]
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

interface ProductStoreRow {
    store_code: string
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
        stores: (row.product_stores ?? []).map(s => s.store_code as StoreCode),
        stock: row.stock ?? undefined,
        ambiente: row.ambiente,
        subcategoria: row.subcategoria,
        dimensions: row.dimensions ?? [],
        materials: row.materials ?? [],
        url: row.url ?? undefined,
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
                id: s.id,
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
        is_active: row.is_active ?? true,
        image: mainImage ? buildCloudinaryUrl(mainImage.cloudinary_public_id, true) : '',
        stores: (row.product_stores ?? []).map(s => s.store_code as StoreCode),
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
    is_active,
    product_images ( cloudinary_public_id, is_main ),
    product_stores ( store_code )
`

/**
 * PRODUCT_CARD_SELECT_IMG
 * Igual que PRODUCT_CARD_SELECT pero con product_images!inner.
 * El !inner actúa como INNER JOIN: excluye automáticamente productos sin imágenes.
 * Usar en todas las queries públicas del catálogo para no mostrar productos sin foto.
 */
const PRODUCT_CARD_SELECT_IMG = `
    id,
    name,
    slug,
    brand,
    ambiente,
    subcategoria,
    is_active,
    product_images!inner ( cloudinary_public_id, is_main ),
    product_stores ( store_code )
`

/**
 * PRODUCT_FULL_SELECT
 * Select completo para la página de detalle de producto.
 */
const PRODUCT_FULL_SELECT = `
    *,
    product_images ( id, cloudinary_public_id, alt, is_main, position ),
    product_material_swatches ( id, name, cloudinary_public_id ),
    product_downloads ( id, name, url ),
    product_stores ( store_code )
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
            .select(PRODUCT_CARD_SELECT_IMG)
            .eq('is_active', true)
            .order('created_at', { ascending: false })
            .order('id', { ascending: true })
            .range(from, to),
        supabase
            .from('products')
            .select('id, product_images!inner(id)', { count: 'exact', head: true })
            .eq('is_active', true),
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
            .select(PRODUCT_CARD_SELECT_IMG)
            .eq('ambiente', ambiente)
            .eq('is_active', true)
            .order('created_at', { ascending: false })
            .order('id', { ascending: true })
            .range(from, to),
        supabase
            .from('products')
            .select('id, product_images!inner(id)', { count: 'exact', head: true })
            .eq('ambiente', ambiente)
            .eq('is_active', true),
    ])

    if (dataResult.error) throw new Error(`dbGetProductsByAmbiente: ${dataResult.error.message}`)
    return {
        items: (dataResult.data as ProductCardRow[]).map(toProductCard),
        totalItems: countResult.count ?? 0,
    }
}

/**
 * dbGetProductsBySubcategoria
 * Returns paginated active products filtered by ambiente and subcategoria.
 */
export async function dbGetProductsBySubcategoria(
    ambiente: string,
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
            .select(PRODUCT_CARD_SELECT_IMG)
            .eq('ambiente', ambiente)
            .eq('subcategoria', subcategoria)
            .eq('is_active', true)
            .order('created_at', { ascending: false })
            .order('id', { ascending: true })
            .range(from, to),
        supabase
            .from('products')
            .select('id, product_images!inner(id)', { count: 'exact', head: true })
            .eq('ambiente', ambiente)
            .eq('subcategoria', subcategoria)
            .eq('is_active', true),
    ])

    if (dataResult.error) throw new Error(`dbGetProductsBySubcategoria: ${dataResult.error.message}`)
    return {
        items: (dataResult.data as unknown as ProductCardRow[]).map(toProductCard),
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
 * Returns paginated products for a specific store code via product_stores junction.
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
            .eq('product_stores.store_code', store)
            .eq('is_active', true)
            .order('created_at', { ascending: false })
            .order('id', { ascending: true })
            .range(from, to),
        supabase
            .from('products')
            .select('id, product_stores!inner(store_code)', { count: 'exact', head: true })
            .eq('product_stores.store_code', store)
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
            .order('created_at', { ascending: false })
            .order('id', { ascending: true })
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
            .order('created_at', { ascending: false })
            .order('id', { ascending: true })
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

// ─── Admin filter types ────────────────────────────────────────────────────────

export interface AdminFilters {
    query?: string
    status?: 'active' | 'hidden' | 'all'
    images?: 'with' | 'without' | 'all'
    store?: string
    ambiente?: string
    subcategoria?: string
    stock?: 'instock' | 'nostock' | 'all'
}

// ─── ADMIN CRUD FUNCTIONS ──────────────────────────────────────────────────────

/**
 * dbSearchProductsAdmin
 * Searches and filters products for the admin panel.
 * Does NOT enforce is_active — surfaces all products so admins can manage them.
 */
export async function dbSearchProductsAdmin(
    filters: AdminFilters,
    page: number,
    pageSize: number
): Promise<PaginatedProducts> {
    const supabase = await createSupabaseServerClient()
    const from = (page - 1) * pageSize
    const to = from + pageSize - 1

    function applyFilters(q: any) {
        let chain = q as any

        // Text search
        if (filters.query) {
            const searchQuery = `%${filters.query}%`
            chain = chain.or(`code.ilike."${searchQuery}",name.ilike."${searchQuery}"`)
        }

        // Status
        if (filters.status === 'active') chain = chain.eq('is_active', true)
        else if (filters.status === 'hidden') chain = chain.eq('is_active', false)

        // Store — filtra vía la tabla junction product_stores
        // Nota: el inner join ya se aplica abajo condicionalmente; aquí solo añadimos el filtro de valor
        if (filters.store) chain = chain.eq('product_stores.store_code', filters.store)

        // Ambiente
        if (filters.ambiente) chain = chain.eq('ambiente', filters.ambiente)

        // Subcategoria
        if (filters.subcategoria) chain = chain.eq('subcategoria', filters.subcategoria)

        // Stock
        if (filters.stock === 'instock') chain = chain.gt('stock', 0)
        else if (filters.stock === 'nostock') chain = chain.eq('stock', 0)

        return chain
    }

    // Construir queries base. Si hay filtro por tienda, usamos inner join en product_stores.
    const storeInnerJoin = filters.store
        ? PRODUCT_CARD_SELECT.replace('product_stores ( store_code )', 'product_stores!inner ( store_code )')
        : PRODUCT_CARD_SELECT

    let dataQuery = supabase.from('products').select(storeInnerJoin)
    let countQuery = filters.store
        ? supabase.from('products').select('id, product_stores!inner(store_code)', { count: 'exact', head: true })
        : supabase.from('products').select('id', { count: 'exact', head: true })

    if (filters.images === 'with') {
        dataQuery = supabase.from('products').select(
            storeInnerJoin.replace('product_images ( cloudinary_public_id, is_main )', 'product_images!inner ( cloudinary_public_id, is_main )')
        ).not('product_images', 'is', null)
        const countImgSelect = filters.store
            ? 'id, product_images!inner(id), product_stores!inner(store_code)'
            : 'id, product_images!inner(id)'
        countQuery = supabase.from('products').select(countImgSelect, { count: 'exact', head: true })
    } else if (filters.images === 'without') {
        // Products with NO images: filter where product_images is null
        dataQuery = supabase.from('products').select(storeInnerJoin).is('product_images', null)
        countQuery = filters.store
            ? supabase.from('products').select('id, product_stores!inner(store_code)', { count: 'exact', head: true }).is('product_images', null)
            : supabase.from('products').select('id', { count: 'exact', head: true }).is('product_images', null)
    }

    const [dataResult, countResult] = await Promise.all([
        applyFilters(
            dataQuery.order('created_at', { ascending: false }).order('id', { ascending: true }).range(from, to)
        ),
        applyFilters(countQuery),
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

/**
 * dbGetAllUniqueSwatches
 * Retrieves a deduplicated list of all available material swatches in the entire catalog.
 * Useful for the Admin UI to allow selecting existing materials instead of re-uploading them.
 */
export async function dbGetAllUniqueSwatches(): Promise<MaterialSwatch[]> {
    const supabase = await createSupabaseServerClient()
    
    // Using a distinct select implicitly if supported or fetching all and deduplicating in memory.
    // For small/medium catalogs, fetching swatches and deduplicating in-memory or via distinct is fine.
    const { data, error } = await supabase
        .from('product_material_swatches')
        .select('name, cloudinary_public_id')
        // Order by name so they appear alphabetically.
        .order('name', { ascending: true })

    if (error) throw new Error(`dbGetAllUniqueSwatches: ${error.message}`)

    // Deduplicate by cloudinary_public_id
    const uniqueMap = new Map<string, MaterialSwatch>()
    for (const row of data || []) {
        if (!uniqueMap.has(row.cloudinary_public_id)) {
            uniqueMap.set(row.cloudinary_public_id, {
                name: row.name ?? undefined,
                image: buildCloudinaryUrl(row.cloudinary_public_id),
            })
        }
    }

    return Array.from(uniqueMap.values())
}

// ─── Product Stores CRUD ──────────────────────────────────────────────

/**
 * dbGetProductStores
 * Returns the list of store codes assigned to a product.
 */
export async function dbGetProductStores(productId: string): Promise<string[]> {
    const supabase = await createSupabaseServerClient()
    const { data, error } = await supabase
        .from('product_stores')
        .select('store_code')
        .eq('product_id', productId)

    if (error) throw new Error(`dbGetProductStores: ${error.message}`)
    return (data ?? []).map(r => r.store_code)
}

/**
 * dbSetProductStores
 * Replaces all store assignments for a product with the provided list.
 * Uses a delete-then-insert strategy (safe for small lists like store codes).
 */
export async function dbSetProductStores(
    productId: string,
    storeCodes: string[]
): Promise<void> {
    const supabase = await createSupabaseServerClient()

    // 1. Remove all current assignments
    const { error: deleteError } = await supabase
        .from('product_stores')
        .delete()
        .eq('product_id', productId)

    if (deleteError) throw new Error(`dbSetProductStores (delete): ${deleteError.message}`)

    // 2. Insert the new assignments (skip if empty)
    if (storeCodes.length === 0) return

    const rows = storeCodes.map(code => ({ product_id: productId, store_code: code }))
    const { error: insertError } = await supabase
        .from('product_stores')
        .insert(rows)

    if (insertError) throw new Error(`dbSetProductStores (insert): ${insertError.message}`)
}

/**
 * dbGetAllActiveSubcategories
 * Fetches all active subcategories from the products table.
 * Returns a Record mapping each ambiente to its list of Subcategories.
 */
export async function dbGetAllActiveSubcategories(): Promise<Record<string, { label: string, slug: string, ambiente: string }[]>> {
    const supabase = await createSupabaseServerClient()
    
    // We only need the ambiente and subcategoria fields of active products
    const { data, error } = await supabase
        .from('products')
        .select('ambiente, subcategoria')
        .eq('is_active', true)

    if (error) throw new Error(`dbGetAllActiveSubcategories: ${error.message}`)

    // Use a Set to track uniqueness by combining ambiente + subcategoria
    const uniqueMap = new Map<string, { label: string, slug: string, ambiente: string }>()
    
    for (const row of data || []) {
        const key = `${row.ambiente}-${row.subcategoria}`
        if (!uniqueMap.has(key)) {
            // Helper to capitalize: e.g. "mesas-de-centro" -> "Mesas de centro"
            const raw = row.subcategoria.replace(/-/g, ' ')
            const label = raw.charAt(0).toUpperCase() + raw.slice(1)
            
            uniqueMap.set(key, {
                label,
                slug: row.subcategoria,
                ambiente: row.ambiente
            })
        }
    }

    // Group them by ambiente
    const grouped: Record<string, { label: string, slug: string, ambiente: string }[]> = {}
    
    for (const sub of uniqueMap.values()) {
        if (!grouped[sub.ambiente]) grouped[sub.ambiente] = []
        grouped[sub.ambiente].push(sub)
    }

    // Optionally sort them alphabetically within each ambiente
    for (const key in grouped) {
        grouped[key].sort((a, b) => a.label.localeCompare(b.label))
    }

    return grouped
}

import {
    dbGetAllProducts,
    dbGetProductsByAmbiente,
    dbGetProductsBySubcategoria,
    dbGetProductBySlug,
    dbGetProductsByStore,
    dbGetProductsInStock,
    dbGetInactiveProducts,
} from './product.repository'
import { Product, ProductCard } from './product.types'

const PAGE_SIZE = 20

// ======================================================
// Tipos de paginación
// ======================================================

export interface PaginatedResult<T> {
    items: T[]
    currentPage: number
    totalPages: number
    totalItems: number
}

// ======================================================
// Helper: pagina un array ya filtrado/mapeado
// ======================================================

/**
 * paginateProducts
 * Divides an array of ProductCard into pages of PAGE_SIZE items.
 * Returns only the items for the requested page plus pagination metadata.
 */
function paginateProducts(products: ProductCard[], page: number): PaginatedResult<ProductCard> {
    const totalItems = products.length
    const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE))
    const currentPage = Math.min(Math.max(1, page), totalPages)
    const start = (currentPage - 1) * PAGE_SIZE
    const items = products.slice(start, start + PAGE_SIZE)
    return { items, currentPage, totalPages, totalItems }
}

// ======================================================
// Obtener todos los productos (estructura completa)
// ======================================================

/**
 * getProducts
 * Returns all products from Supabase (unfiltered, unpaginated).
 * Used internally — prefer getProductCards for catalog pages.
 */
export async function getProducts(): Promise<ProductCard[]> {
    return dbGetAllProducts()
}

// ======================================================
// Obtener productos para el catálogo (versión ligera, paginada)
// ======================================================

/**
 * getProductCards
 * Returns all products as lightweight ProductCards, paginated.
 */
export async function getProductCards(page = 1): Promise<PaginatedResult<ProductCard>> {
    const all = await dbGetAllProducts()
    return paginateProducts(all, page)
}

// ======================================================
// Obtener productos por ambiente (para catálogo, paginado)
// ======================================================

/**
 * getProductsByAmbiente
 * Returns products filtered by ambiente, paginated.
 */
export async function getProductsByAmbiente(ambiente: string, page = 1): Promise<PaginatedResult<ProductCard>> {
    const filtered = await dbGetProductsByAmbiente(ambiente)
    return paginateProducts(filtered, page)
}

// ======================================================
// Obtener productos por subcategoría (para catálogo, paginado)
// ======================================================

/**
 * getProductsBySubcategoria
 * Returns products filtered by subcategoria, paginated.
 */
export async function getProductsBySubcategoria(subcategoria: string, page = 1): Promise<PaginatedResult<ProductCard>> {
    const filtered = await dbGetProductsBySubcategoria(subcategoria)
    return paginateProducts(filtered, page)
}

// ======================================================
// Obtener producto completo por slug (detalle)
// ======================================================

/**
 * getProductBySlug
 * Returns the full Product object for the detail page.
 */
export async function getProductBySlug(slug: string): Promise<Product | null> {
    return dbGetProductBySlug(slug)
}

// ======================================================
// Obtener productos por tienda (DB only — no se muestra en UI)
// ======================================================

/**
 * getProductsByStore
 * Returns products for a specific store code (LM, SM, DP, CT, BT).
 */
export async function getProductsByStore(store: string, page = 1): Promise<PaginatedResult<ProductCard>> {
    const filtered = await dbGetProductsByStore(store)
    return paginateProducts(filtered, page)
}

// ======================================================
// Obtener productos con stock disponible (DB only)
// ======================================================

/**
 * getProductsInStock
 * Returns products with stock > 0.
 */
export async function getProductsInStock(page = 1): Promise<PaginatedResult<ProductCard>> {
    const filtered = await dbGetProductsInStock()
    return paginateProducts(filtered, page)
}

// ======================================================
// Obtener productos inactivos (DB only)
// ======================================================

/**
 * getInactiveProducts
 * Returns products marked as inactive (for admin use).
 */
export async function getInactiveProducts(page = 1): Promise<PaginatedResult<ProductCard>> {
    const filtered = await dbGetInactiveProducts()
    return paginateProducts(filtered, page)
}

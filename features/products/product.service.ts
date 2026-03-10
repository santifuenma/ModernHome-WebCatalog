import {
    dbGetAllProducts,
    dbGetProductsByAmbiente,
    dbGetProductsBySubcategoria,
    dbGetProductBySlug,
    dbGetProductsByStore,
    dbGetProductsInStock,
    dbGetInactiveProducts,
    PaginatedProducts,
} from './product.repository'
import { Product, ProductCard } from './product.types'

export const PAGE_SIZE = 20

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
// Helper: convierte PaginatedProducts del repo → PaginatedResult del service
// ======================================================

function toResult(
    { items, totalItems }: PaginatedProducts,
    page: number,
): PaginatedResult<ProductCard> {
    const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE))
    const currentPage = Math.min(Math.max(1, page), totalPages)
    return { items, currentPage, totalPages, totalItems }
}

// ======================================================
// Obtener todos los productos (paginados)
// ======================================================

/**
 * getProductCards
 * Returns paginated products for the main catalog page.
 * No extra caching — the DB-level .range() already ensures only 20 rows are fetched.
 * New products appear immediately on the next request.
 */
export async function getProductCards(page = 1): Promise<PaginatedResult<ProductCard>> {
    const result = await dbGetAllProducts(page, PAGE_SIZE)
    return toResult(result, page)
}

// ======================================================
// Obtener todos los productos (sin paginación — uso interno)
// ======================================================

export async function getProducts(): Promise<ProductCard[]> {
    const result = await dbGetAllProducts(1, PAGE_SIZE)
    return result.items
}

// ======================================================
// Obtener productos por ambiente (paginados)
// ======================================================

export async function getProductsByAmbiente(
    ambiente: string,
    page = 1,
): Promise<PaginatedResult<ProductCard>> {
    const result = await dbGetProductsByAmbiente(ambiente, page, PAGE_SIZE)
    return toResult(result, page)
}

// ======================================================
// Obtener productos por subcategoría (paginados)
// ======================================================

export async function getProductsBySubcategoria(
    subcategoria: string,
    page = 1,
): Promise<PaginatedResult<ProductCard>> {
    const result = await dbGetProductsBySubcategoria(subcategoria, page, PAGE_SIZE)
    return toResult(result, page)
}

// ======================================================
// Obtener producto completo por slug (detalle)
// ======================================================

export async function getProductBySlug(slug: string): Promise<Product | null> {
    return dbGetProductBySlug(slug)
}

// ======================================================
// Obtener productos por tienda
// ======================================================

export async function getProductsByStore(
    store: string,
    page = 1,
): Promise<PaginatedResult<ProductCard>> {
    const result = await dbGetProductsByStore(store, page, PAGE_SIZE)
    return toResult(result, page)
}

// ======================================================
// Obtener productos con stock disponible
// ======================================================

export async function getProductsInStock(page = 1): Promise<PaginatedResult<ProductCard>> {
    const result = await dbGetProductsInStock(page, PAGE_SIZE)
    return toResult(result, page)
}

// ======================================================
// Obtener productos inactivos (admin)
// ======================================================

export async function getInactiveProducts(page = 1): Promise<PaginatedResult<ProductCard>> {
    const result = await dbGetInactiveProducts(page, PAGE_SIZE)
    return toResult(result, page)
}

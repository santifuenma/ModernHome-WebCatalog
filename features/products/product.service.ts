import {
    dbGetAllProducts,
    dbGetProductsByAmbiente,
    dbGetProductsBySubcategoria,
    dbGetProductBySlug,
    dbGetProductById,
    dbGetProductsByStore,
    dbGetProductsInStock,
    dbGetInactiveProducts,
    dbSearchProductsAdmin,
    dbCreateProduct,
    dbUpdateProduct,
    dbDeleteProduct,
    dbAddProductImage,
    dbRemoveProductImage,
    dbAddProductSwatch,
    dbRemoveProductSwatch,
    dbSetProductDownload,
    dbRemoveProductDownload,
    dbGetAllUniqueSwatches,
    PaginatedProducts,
    AdminFilters,
} from './product.repository'
import { Product, ProductCard, MaterialSwatch } from './product.types'

export const PAGE_SIZE = 21

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
    ambiente: string,
    subcategoria: string,
    page = 1,
): Promise<PaginatedResult<ProductCard>> {
    const result = await dbGetProductsBySubcategoria(ambiente, subcategoria, page, PAGE_SIZE)
    return toResult(result, page)
}

// ======================================================
// Obtener producto completo por slug (detalle)
// ======================================================

export async function getProductBySlug(slug: string): Promise<Product | null> {
    return dbGetProductBySlug(slug)
}

export async function getProductById(id: string): Promise<Product | null> {
    return dbGetProductById(id)
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

// ======================================================
// ADMIN CRUD (Search, Create, Update, Delete)
// ======================================================

export async function searchProductsAdmin(filters: AdminFilters, page = 1): Promise<PaginatedResult<ProductCard>> {
    const result = await dbSearchProductsAdmin(filters, page, PAGE_SIZE)
    return toResult(result, page)
}

export async function createProduct(data: Partial<Product>): Promise<string> {
    return dbCreateProduct(data)
}

export async function updateProduct(id: string, data: Partial<Product>): Promise<void> {
    return dbUpdateProduct(id, data)
}

export async function deleteProduct(id: string): Promise<void> {
    return dbDeleteProduct(id)
}

export async function addProductImage(productId: string, cloudinaryPublicId: string, isMain = false): Promise<string> {
    return dbAddProductImage(productId, cloudinaryPublicId, isMain)
}

export async function removeProductImage(imageId: string): Promise<void> {
    return dbRemoveProductImage(imageId)
}

export async function addProductSwatch(productId: string, name: string | null, cloudinaryPublicId: string): Promise<string> {
    return dbAddProductSwatch(productId, name, cloudinaryPublicId)
}

export async function removeProductSwatch(swatchId: string): Promise<void> {
    return dbRemoveProductSwatch(swatchId)
}

export async function setProductDownload(productId: string, name: string, url: string): Promise<void> {
    return dbSetProductDownload(productId, name, url)
}

export async function removeProductDownload(productId: string): Promise<void> {
    return dbRemoveProductDownload(productId)
}

export async function getAllUniqueSwatches(): Promise<MaterialSwatch[]> {
    return dbGetAllUniqueSwatches()
}

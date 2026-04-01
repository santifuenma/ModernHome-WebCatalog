// ======================================================
// STORE CODES
// Maps to the `store` column in the DB (LM, SM, DP, CT, BT)
// ======================================================

export type StoreCode = 'LM' | 'SM' | 'V' | 'CT' | 'BT'

export const STORE_LABELS: Record<StoreCode, string> = {
    LM: 'Las Mercedes',
    SM: 'Santa Mónica',
    V: 'Valencia',
    CT: 'La Castellana',
    BT: 'Barquisimeto',
}

// ======================================================
// PRODUCT STORE (asignación de tienda con stock propio)
// ======================================================

export interface ProductStore {
    storeCode: StoreCode
    stock: number
}



export interface ProductImage {
    id?: string
    url: string
    alt?: string
    isMain?: boolean
}

// ======================================================
// MATERIAL SWATCH (imagen pequeña de material)
// ======================================================

export interface MaterialSwatch {
    id?: string
    name?: string
    image: string
}

// ======================================================
// DOWNLOADABLE FILE
// ======================================================

export interface ProductDownload {
    name: string
    url: string
}

// ======================================================
// PRODUCT (estructura completa)
// ======================================================

export interface Product {
    id: string

    // Identificación
    name: string
    slug: string

    // Información básica
    brand: string
    designer?: string

    // Organización del catálogo
    ambiente: string
    subcategoria: string

    // Características (texto libre)
    dimensions: string[]
    materials: string[]

    // Imágenes del producto (máx 4)
    images: ProductImage[]

    // Swatches de materiales
    materialSwatches?: MaterialSwatch[]

    // Archivo descargable (ej: modelo 3D)
    download?: ProductDownload

    // Enlace externo al producto
    url?: string

    // ── Campos de negocio (DB only) ──
    code?: string            // Código interno del producto (ej: 'MH-001')
    stores?: ProductStore[]  // Asignaciones de tienda con stock propio (many-to-many)
    is_active?: boolean      // Si el producto está publicado
    created_at?: string      // Fecha de creación (ISO string)
}

// ======================================================
// PRODUCT CARD (para grid del catálogo)
// ======================================================

export interface ProductCard {
    id: string
    name: string
    slug: string

    brand: string

    ambiente: string
    subcategoria: string

    image: string
    is_active?: boolean
    stores?: ProductStore[]  // Asignaciones de tienda con stock propio (para filtros admin)
}

// ======================================================
// PRODUCT LIST RESULT (para paginación)
// ======================================================

export interface ProductListResult {
    items: ProductCard[]
    page: number
    pageSize: number
    total: number
    hasMore: boolean
}
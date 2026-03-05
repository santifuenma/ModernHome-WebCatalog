// ======================================================
// PRODUCT IMAGE
// ======================================================

export interface ProductImage {
    url: string
    alt?: string
    isMain?: boolean
}

// ======================================================
// MATERIAL SWATCH (imagen pequeña de material)
// ======================================================

export interface MaterialSwatch {
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
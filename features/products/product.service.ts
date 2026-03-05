import { mockProducts } from "./mockProducts"
import { Product, ProductCard } from "./product.types"

// ======================================================
// Mapper: convierte Product completo → ProductCard
// ======================================================

function toProductCard(product: Product): ProductCard {
    return {
        id: product.id,
        name: product.name,
        slug: product.slug,
        brand: product.brand,
        ambiente: product.ambiente,
        subcategoria: product.subcategoria,
        image: product.images[0]?.url || ""
    }
}

// ======================================================
// Obtener todos los productos (estructura completa)
// ======================================================

export function getProducts(): Product[] {
    return mockProducts
}

// ======================================================
// Obtener productos para el catálogo (versión ligera)
// ======================================================

export function getProductCards(): ProductCard[] {
    return mockProducts.map(toProductCard)
}

// ======================================================
// Obtener productos por ambiente (para catálogo)
// ======================================================

export function getProductsByAmbiente(ambiente: string): ProductCard[] {
    return mockProducts
        .filter(product => product.ambiente === ambiente)
        .map(toProductCard)
}

// ======================================================
// Obtener productos por subcategoría (para catálogo)
// ======================================================

export function getProductsBySubcategoria(subcategoria: string): ProductCard[] {
    return mockProducts
        .filter(product => product.subcategoria === subcategoria)
        .map(toProductCard)
}

// ======================================================
// Obtener producto completo por slug (detalle)
// ======================================================

export function getProductBySlug(slug: string): Product | undefined {
    return mockProducts.find(product => product.slug === slug)
}